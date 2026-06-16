from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta, date
from orders.models import Order
from sales.models import Sale
from products.models import Product
from payments.models import Payment
from notifications.models import Notification

def is_admin(user):
    return user.is_authenticated and user.profile.role == 'admin'

def is_waiter(user):
    return user.is_authenticated and user.profile.role == 'waiter'

def is_counter(user):
    return user.is_authenticated and user.profile.role == 'counter'

@login_required
def home(request):
    role = request.user.profile.role
    if role == 'admin':
        return redirect('dashboards:admin_dashboard')
    elif role == 'waiter':
        return redirect('dashboards:waiter_dashboard')
    elif role == 'counter':
        return redirect('dashboards:counter_dashboard')
    return redirect('users:login')

@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    today = date.today()
    today_orders = Order.objects.filter(created_at__date=today)
    today_sales = Sale.objects.filter(created_at__date=today)
    total_revenue_today = today_sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    pending_orders = Order.objects.filter(status='pending').count()
    low_stock = Product.objects.filter(stock__lte=F('min_stock_level')).count()
    total_products = Product.objects.count()
    recent_orders = Order.objects.all()[:5]
    orders_by_status = Order.objects.values('status').annotate(count=Count('id'))
    status_counts = {s['status']: s['count'] for s in orders_by_status}
    week_ago = timezone.now() - timedelta(days=7)
    weekly_sales = Sale.objects.filter(created_at__gte=week_ago).aggregate(
        total=Sum('total_amount'), count=Count('id')
    )
    context = {
        'total_revenue_today': total_revenue_today,
        'pending_orders': pending_orders,
        'low_stock': low_stock,
        'total_products': total_products,
        'recent_orders': recent_orders,
        'status_counts': status_counts,
        'today_orders_count': today_orders.count(),
        'weekly_sales': weekly_sales,
    }
    return render(request, 'dashboards/admin_dashboard.html', context)

@login_required
@user_passes_test(is_waiter)
def waiter_dashboard(request):
    pending = Order.objects.filter(status='pending').count()
    my_orders = Order.objects.filter(waiter=request.user).order_by('-created_at')
    active = my_orders.exclude(status__in=['delivered', 'cancelled']).count()
    my_orders_active = my_orders.exclude(status__in=['delivered', 'cancelled'])[:5]
    my_orders_completed = my_orders.filter(status='delivered')[:5]
    receipts_ready = my_orders.filter(status='delivered').count()
    total_sales = my_orders.filter(status='delivered').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    context = {
        'pending': pending,
        'active': active,
        'receipts_ready': receipts_ready,
        'total_sales': total_sales,
        'my_orders_active': my_orders_active,
        'my_orders_completed': my_orders_completed,
    }
    return render(request, 'dashboards/waiter_dashboard.html', context)

@login_required
@user_passes_test(is_counter)
def counter_dashboard(request):
    pending = Order.objects.filter(status='pending').count()
    completed_today = Order.objects.filter(
        status='delivered', delivered_at__date=date.today()
    ).count()
    unaccepted = Order.objects.filter(status='pending', counter_attendant__isnull=True)[:10]
    accepted = Order.objects.filter(status='pending', counter_attendant__isnull=False)[:10]
    processed = Order.objects.filter(
        status='delivered', counter_attendant=request.user
    ).prefetch_related('items__product', 'receipt')[:10]
    context = {
        'pending': pending,
        'completed_today': completed_today,
        'unaccepted': unaccepted,
        'accepted': accepted,
        'processed': processed,
    }
    return render(request, 'dashboards/counter_dashboard.html', context)
