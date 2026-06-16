from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.db import models
from .models import InventoryLog
from products.models import Product

def is_admin(user):
    return user.is_authenticated and user.profile.role == 'admin'

@login_required
@user_passes_test(is_admin)
def inventory_log(request):
    logs = InventoryLog.objects.all().select_related('product', 'user')
    return render(request, 'inventory/log.html', {'logs': logs})

@login_required
@user_passes_test(is_admin)
def low_stock_alerts(request):
    low_stock_products = Product.objects.filter(stock__lte=models.F('min_stock_level'))
    return render(request, 'inventory/low_stock.html', {'products': low_stock_products})

@login_required
def stock_alerts_api(request):
    products = Product.objects.filter(stock__lte=models.F('min_stock_level'))
    data = [{'id': p.id, 'name': p.name, 'stock': p.stock, 'min_level': p.min_stock_level} for p in products]
    return JsonResponse({'alerts': data, 'count': len(data)})
