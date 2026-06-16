from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Payment
from orders.models import Order

@login_required
def payment_list(request):
    payments = Payment.objects.all().select_related('order')
    return render(request, 'payments/payment_list.html', {'payments': payments})

@login_required
def record_payment(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if hasattr(order, 'payment'):
        messages.info(request, 'Payment already recorded.')
        return redirect('receipts:generate_receipt', order_id=order.id)
    if request.method == 'POST':
        method = request.POST.get('method', 'cash')
        amount = request.POST.get('amount', order.total_amount)
        Payment.objects.create(
            order=order, amount=amount, method=method, status='completed'
        )
        messages.success(request, 'Payment recorded successfully.')
        return redirect('receipts:generate_receipt', order_id=order.id)
    return render(request, 'payments/payment_form.html', {'order': order})
