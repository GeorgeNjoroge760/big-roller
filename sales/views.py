from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Sale
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

@login_required
def sale_list(request):
    sales = Sale.objects.all().select_related('order', 'waiter')
    return render(request, 'sales/sale_list.html', {'sales': sales})

@login_required
def sales_analytics_api(request):
    days = int(request.GET.get('days', 7))
    since = timezone.now() - timedelta(days=days)
    sales = Sale.objects.filter(created_at__gte=since)
    daily_data = sales.extra({'date': "date(created_at)"}).values('date').annotate(
        total=Sum('total_amount'), count=Count('id')
    ).order_by('date')
    return JsonResponse(list(daily_data), safe=False)
