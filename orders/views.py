from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils import timezone
from .models import Order, OrderItem
from products.models import Product
from inventory.models import InventoryLog
from notifications.models import Notification
from receipts.models import Receipt
from payments.models import Payment
from sales.models import Sale
from django.db import transaction

@login_required
def place_order(request):
    if request.method == 'POST':
        raw_items = request.POST.get('items', '')
        raw_qty = request.POST.get('quantities', '')
        if raw_items and raw_qty:
            items_data = raw_items.split(',')
            quantities = raw_qty.split(',')
        else:
            items_data = request.POST.getlist('items[]')
            quantities = request.POST.getlist('quantities[]')
        customer_name = request.POST.get('customer_name', 'Walk-in Customer')
        notes = request.POST.get('notes', '')
        if not items_data:
            messages.error(request, 'Order must have at least one item.')
            return redirect('products:menu')
        items = []
        total = 0
        for prod_id, qty in zip(items_data, quantities):
            try:
                product = Product.objects.get(id=prod_id)
                qty = int(qty)
                if qty < 1:
                    messages.error(request, 'Invalid quantity.')
                    return redirect('products:menu')
                if qty > product.stock:
                    messages.error(request, f'Not enough stock for {product.name}. Only {product.stock} left.')
                    return redirect('products:menu')
                unit_price = product.price
                subtotal = unit_price * qty
                items.append((product, qty, unit_price, subtotal))
                total += subtotal
            except (Product.DoesNotExist, ValueError, TypeError):
                messages.error(request, 'Invalid product selection.')
                return redirect('products:menu')
        with transaction.atomic():
            order = Order.objects.create(
                customer_name=customer_name or 'Walk-in Customer',
                waiter=request.user,
                notes=notes
            )
            for product, qty, unit_price, subtotal in items:
                OrderItem.objects.create(
                    order=order, product=product,
                    quantity=qty, unit_price=unit_price,
                    subtotal=subtotal
                )
            order.total_amount = total
            order.save()
        for user in User.objects.filter(profile__role='counter'):
            Notification.objects.create(
                recipient=user,
                title='New Order',
                message=f'Order #{order.order_number} has been placed by {request.user.username}.',
                notification_type='info'
            )
        messages.success(request, f'Order #{order.order_number} placed successfully! Waiting for counter.')
        return redirect('orders:order_detail', order_id=order.id)
    return redirect('products:menu')

@login_required
def accept_order(request, order_id):
    if request.user.profile.role != 'counter':
        messages.error(request, 'Only counter attendants can accept orders.')
        return redirect('orders:counter_orders')
    order = get_object_or_404(Order, id=order_id)
    if order.status != 'pending':
        messages.error(request, 'Order has already been processed.')
        return redirect('orders:counter_orders')
    if order.counter_attendant:
        messages.warning(request, f'Order already accepted by {order.counter_attendant.username}.')
        return redirect('orders:counter_orders')
    order.counter_attendant = request.user
    order.save(update_fields=['counter_attendant'])
    if order.waiter:
        Notification.objects.create(
            recipient=order.waiter,
            title='Order Accepted',
            message=f'Order #{order.order_number} has been accepted by {request.user.username}.',
            notification_type='info'
        )
    messages.success(request, f'Order #{order.order_number} accepted! Now process the receipt.')
    return redirect('orders:process_receipt', order_id=order.id)

@login_required
def process_receipt(request, order_id):
    if request.user.profile.role != 'counter':
        messages.error(request, 'Only counter attendants can process receipts.')
        return redirect('orders:order_detail', order_id=order_id)
    order = get_object_or_404(Order.objects.prefetch_related('items__product'), id=order_id)
    if order.status != 'pending':
        messages.error(request, 'Order has already been processed.')
        return redirect('orders:counter_orders')
    if not order.counter_attendant:
        messages.error(request, 'You must accept this order first before processing the receipt.')
        return redirect('orders:counter_orders')
    receipt_generated = False
    receipt = None
    payment_method = ''
    if request.method == 'POST':
        action = request.POST.get('action', 'generate')
        if action == 'generate':
            payment_method = request.POST.get('payment_method', 'cash')
            with transaction.atomic():
                order.status = 'delivered'
                order.delivered_at = timezone.now()
                order.save()
                for item in order.items.all():
                    product = item.product
                    old_stock = product.stock
                    product.stock -= item.quantity
                    product.save()
                    InventoryLog.objects.create(
                        product=product, user=request.user, action='sale',
                        quantity_change=-item.quantity,
                        stock_before=old_stock, stock_after=product.stock,
                        notes=f'Order #{order.order_number}'
                    )
                receipt = Receipt.objects.create(order=order)
                Payment.objects.create(order=order, amount=order.total_amount, method=payment_method, status='completed')
                Sale.objects.create(
                    order=order, customer_name=order.customer_name,
                    waiter=order.waiter, total_amount=order.total_amount,
                    payment_method=payment_method
                )
            receipt_generated = True
            messages.success(request, f'Receipt #{receipt.receipt_number} generated!')
        elif action == 'send':
            order.receipt_sent = True
            order.save(update_fields=['receipt_sent'])
            if order.waiter:
                Notification.objects.create(
                    recipient=order.waiter,
                    title='Receipt Ready',
                    message=f'Receipt for Order #{order.order_number} is ready. You can view it now.',
                    notification_type='success'
                )
            messages.success(request, f'Receipt sent to {order.waiter.username}!')
            return redirect('orders:order_detail', order_id=order.id)
    context = {
        'order': order,
        'receipt_generated': receipt_generated,
        'receipt': receipt,
        'payment_method': payment_method,
        'receipt_sent': order.receipt_sent,
    }
    return render(request, 'orders/process_receipt.html', context)

@login_required
def order_detail(request, order_id):
    order = get_object_or_404(
        Order.objects.select_related('waiter', 'counter_attendant', 'receipt', 'payment')
        .prefetch_related('items__product'),
        id=order_id
    )
    return render(request, 'orders/order_detail.html', {'order': order})

@login_required
def order_list(request):
    status = request.GET.get('status', '')
    orders = Order.objects.all().select_related('waiter').prefetch_related('items__product')
    if status:
        orders = orders.filter(status=status)
    return render(request, 'orders/order_list.html', {'orders': orders})

@login_required
def waiter_orders(request):
    orders = Order.objects.filter(waiter=request.user).prefetch_related('items__product', 'receipt')
    return render(request, 'orders/waiter_orders.html', {'orders': orders})

@login_required
def counter_orders(request):
    status_filter = request.GET.get('status', '')
    if status_filter:
        orders = Order.objects.filter(status=status_filter).prefetch_related('items__product')
    else:
        orders = Order.objects.filter(status='pending').prefetch_related('items__product')
    return render(request, 'orders/counter_orders.html', {'orders': orders})

@login_required
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if order.status in ['delivered', 'cancelled']:
        messages.error(request, 'Cannot cancel this order.')
        return redirect('orders:order_detail', order_id=order.id)
    order.status = 'cancelled'
    order.save()
    messages.success(request, f'Order #{order.order_number} cancelled.')
    return redirect('orders:order_detail', order_id=order.id)
