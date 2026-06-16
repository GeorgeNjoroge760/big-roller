from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Receipt
from orders.models import Order
import io

@login_required
def receipt_detail(request, receipt_id):
    receipt = get_object_or_404(
        Receipt.objects.select_related('order__waiter', 'order__payment')
        .prefetch_related('order__items__product'),
        id=receipt_id
    )
    return render(request, 'receipts/receipt_detail.html', {'receipt': receipt})

@login_required
def receipt_list(request):
    receipts = Receipt.objects.select_related('order', 'order__waiter').all().order_by('-generated_at')
    return render(request, 'receipts/receipt_list.html', {'receipts': receipts})

@login_required
def generate_receipt(request, order_id):
    order = get_object_or_404(Order.objects.prefetch_related('items__product'), id=order_id)
    receipt, created = Receipt.objects.get_or_create(order=order)
    return render(request, 'receipts/receipt_detail.html', {'receipt': receipt})
