from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponse
from django.template.loader import render_to_string
from .models import DailyReport
from sales.models import Sale
from orders.models import Order
from products.models import Product
from payments.models import Payment
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import date, timedelta
import json

def is_admin(user):
    return user.is_authenticated and user.profile.role == 'admin'

@login_required
@user_passes_test(is_admin)
def report_list(request):
    reports = DailyReport.objects.all()
    return render(request, 'reports/report_list.html', {'reports': reports})

@login_required
@user_passes_test(is_admin)
def generate_daily_report(request):
    today = date.today()
    orders = Order.objects.filter(created_at__date=today)
    sales = Sale.objects.filter(created_at__date=today)
    payments = Payment.objects.filter(paid_at__date=today)
    delivered = orders.filter(status='delivered').count()
    cancelled = orders.filter(status='cancelled').count()
    total_revenue = sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    payment_breakdown = {}
    for p in payments:
        payment_breakdown[p.method] = payment_breakdown.get(p.method, 0) + float(p.amount)
    best_seller = ''
    best_qty = 0
    from orders.models import OrderItem
    items = OrderItem.objects.filter(order__in=orders).values('product__name').annotate(
        total_qty=Sum('quantity')
    ).order_by('-total_qty')
    if items:
        best_seller = items[0]['product__name']
        best_qty = items[0]['total_qty']
    report, created = DailyReport.objects.get_or_create(
        report_date=today,
        defaults={
            'total_revenue': total_revenue,
            'total_orders': orders.count(),
            'delivered_orders': delivered,
            'cancelled_orders': cancelled,
            'best_selling_product': best_seller,
            'best_selling_qty': best_qty,
            'payment_breakdown': payment_breakdown,
        }
    )
    if not created:
        report.total_revenue = total_revenue
        report.total_orders = orders.count()
        report.delivered_orders = delivered
        report.cancelled_orders = cancelled
        report.best_selling_product = best_seller
        report.best_selling_qty = best_qty
        report.payment_breakdown = payment_breakdown
        report.save()
    return render(request, 'reports/report_detail.html', {'report': report})

@login_required
@user_passes_test(is_admin)
def report_detail(request, report_id):
    report = DailyReport.objects.get(id=report_id)
    return render(request, 'reports/report_detail.html', {'report': report})

@login_required
@user_passes_test(is_admin)
def analytics_view(request):
    return render(request, 'reports/analytics.html')

@login_required
@user_passes_test(is_admin)
def analytics_data(request):
    days = int(request.GET.get('days', 30))
    since = timezone.now() - timedelta(days=days)
    sales = Sale.objects.filter(created_at__gte=since)
    daily_sales = []
    for i in range(days):
        day = (timezone.now() - timedelta(days=days-i-1)).date()
        day_sales = sales.filter(created_at__date=day)
        total = day_sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        count = day_sales.count()
        daily_sales.append({'date': day.isoformat(), 'total': float(total), 'count': count})
    products = Product.objects.annotate(
        total_sold=Sum('orderitem__quantity')
    ).values('name', 'total_sold').order_by('-total_sold')[:10]
    best_products = [{'name': p['name'], 'sold': p['total_sold'] or 0} for p in products]
    orders_by_status = Order.objects.filter(created_at__gte=since).values('status').annotate(count=Count('id'))
    status_data = {s['status']: s['count'] for s in orders_by_status}
    waiter_perf = Order.objects.filter(
        delivered_at__gte=since, waiter__isnull=False
    ).values('waiter__username').annotate(
        orders=Count('id'),
        total=Sum('total_amount')
    ).order_by('-orders')
    performance = [{'waiter': w['waiter__username'], 'orders': w['orders'], 'total': float(w['total'] or 0)} for w in waiter_perf]
    total_revenue = sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    from django.http import JsonResponse
    return JsonResponse({
        'daily_sales': daily_sales,
        'best_products': best_products,
        'status_data': status_data,
        'waiter_performance': performance,
        'total_revenue': float(total_revenue),
        'total_orders': sales.count(),
    })
