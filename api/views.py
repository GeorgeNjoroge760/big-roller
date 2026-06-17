from django.db import models, transaction
from django.db.models import Count, Sum, Q
from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from users.models import UserProfile
from products.models import Category, Product
from orders.models import Order, OrderItem
from notifications.models import Notification
from payments.models import Payment
from inventory.models import InventoryLog

from .serializers import *


# ─── AUTH ───────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.auth import authenticate
    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    user_ser = UserSerializer(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': user_ser.data,
    })


@api_view(['GET'])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ─── CATEGORIES ──────────────────────────────────────────────────────────

@api_view(['GET'])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# ─── PRODUCTS ────────────────────────────────────────────────────────────

@api_view(['GET'])
def product_list(request):
    products = Product.objects.filter(is_available=True).select_related('category')
    category = request.query_params.get('category')
    search = request.query_params.get('search')
    if category:
        products = products.filter(category_id=category)
    if search:
        products = products.filter(name__icontains=search)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def product_detail(request, pk):
    try:
        product = Product.objects.select_related('category').get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    serializer = ProductSerializer(product)
    return Response(serializer.data)


# ─── ORDERS ──────────────────────────────────────────────────────────────

@api_view(['POST'])
def place_order(request):
    serializer = PlaceOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    items_data = data['items']

    if not items_data:
        return Response({'error': 'Order must have at least one item'}, status=400)

    # Validate stock
    product_ids = [item['product_id'] for item in items_data]
    products = {p.id: p for p in Product.objects.filter(id__in=product_ids)}

    for item in items_data:
        product = products.get(item['product_id'])
        if not product:
            return Response({'error': f'Product {item["product_id"]} not found'}, status=400)
        if item['quantity'] > product.stock:
            return Response({
                'error': f'Not enough stock for {product.name}. Only {product.stock} left.'
            }, status=400)

    with transaction.atomic():
        order = Order.objects.create(
            waiter=request.user,
            customer_name=data.get('customer_name', 'Walk-in Customer'),
            notes=data.get('notes', ''),
        )
        total = 0
        for item in items_data:
            product = products[item['product_id']]
            subtotal = product.price * item['quantity']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                unit_price=product.price,
                subtotal=subtotal,
            )
            total += subtotal
        order.total_amount = total
        order.save()

    # Notify counter attendants
    for counter in User.objects.filter(profile__role='counter'):
        Notification.objects.create(
            recipient=counter,
            title='New Order',
            message=f'Order #{order.order_number} placed by {request.user.username}',
            notification_type='info',
        )

    result = OrderSerializer(order)
    return Response(result.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def order_list(request):
    user = request.user
    role = user.profile.role

    if role == 'admin':
        orders = Order.objects.all()
    elif role == 'waiter':
        orders = Order.objects.filter(waiter=user)
    elif role == 'counter':
        orders = Order.objects.filter(
            Q(counter_attendant=user) | Q(status='pending')
        )
    else:
        orders = Order.objects.none()

    status_filter = request.query_params.get('status')
    if status_filter:
        orders = orders.filter(status=status_filter)

    orders = orders.prefetch_related('items__product').select_related('waiter', 'counter_attendant')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def order_detail(request, pk):
    try:
        order = Order.objects.prefetch_related('items__product').select_related(
            'waiter', 'counter_attendant', 'payment'
        ).get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    serializer = OrderSerializer(order)
    return Response(serializer.data)


@api_view(['POST'])
def accept_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if order.status != 'pending':
        return Response({'error': 'Order is not pending'}, status=400)

    order.status = 'claimed'
    order.counter_attendant = request.user
    order.claimed_at = timezone.now()
    order.save()

    return Response(OrderSerializer(order).data)


@api_view(['POST'])
def cancel_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if order.status in ('delivered', 'cancelled'):
        return Response({'error': 'Order cannot be cancelled'}, status=400)

    order.status = 'cancelled'
    order.save()

    return Response(OrderSerializer(order).data)


@api_view(['POST'])
def process_order(request, pk):
    try:
        order = Order.objects.select_related('waiter').prefetch_related('items__product').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if order.status != 'claimed':
        return Response({'error': 'Order must be claimed first'}, status=400)

    payment_data = request.data
    payment_method = payment_data.get('method', 'cash')

    with transaction.atomic():
        # Deduct stock
        for item in order.items.all():
            product = item.product
            product.stock -= item.quantity
            product.save()
            InventoryLog.objects.create(
                product=product,
                user=request.user,
                action='sale',
                quantity_change=-item.quantity,
                stock_before=product.stock + item.quantity,
                stock_after=product.stock,
            )

        # Update order status
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()

        # Create payment
        Payment.objects.create(
            order=order,
            amount=order.total_amount,
            method=payment_method,
            status='completed',
        )

        # Notify waiter
        if order.waiter:
            Notification.objects.create(
                recipient=order.waiter,
                title='Order Delivered',
                message=f'Order #{order.order_number} has been processed and delivered.',
                notification_type='success',
            )

    return Response(OrderSerializer(order).data)


# ─── NOTIFICATIONS ─────────────────────────────────────────────────────

@api_view(['GET'])
def notification_list(request):
    notifications = Notification.objects.filter(recipient=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def mark_notification_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    notif.is_read = True
    notif.save()
    return Response({'status': 'ok'})


@api_view(['POST'])
def mark_all_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'ok'})


@api_view(['GET'])
def unread_count(request):
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'count': count})


# ─── DASHBOARD ──────────────────────────────────────────────────────────

@api_view(['GET'])
def dashboard(request):
    user = request.user
    role = user.profile.role
    today = timezone.localdate()
    data = {'role': role}

    if role == 'admin':
        data['total_revenue_today'] = Order.objects.filter(
            status='delivered', delivered_at__date=today
        ).aggregate(t=Sum('total_amount'))['t'] or 0
        data['pending_orders'] = Order.objects.filter(status='pending').count()
        data['total_products'] = Product.objects.count()
        data['low_stock'] = Product.objects.filter(stock__lte=models.F('min_stock_level')).count()

    elif role == 'waiter':
        data['pending'] = Order.objects.filter(waiter=user, status='pending').count()
        data['active'] = Order.objects.filter(waiter=user).exclude(
            status__in=['pending', 'delivered', 'cancelled']
        ).count()
        data['total_sales'] = Order.objects.filter(
            waiter=user, status='delivered'
        ).aggregate(t=Sum('total_amount'))['t'] or 0

    elif role == 'counter':
        data['pending_orders'] = Order.objects.filter(status='pending').count()
        data['claimed'] = Order.objects.filter(counter_attendant=user).exclude(
            status__in=['pending', 'delivered', 'cancelled']
        ).count()
        data['completed_today'] = Order.objects.filter(
            counter_attendant=user, status='delivered', delivered_at__date=today
        ).count()

    return Response(data)
