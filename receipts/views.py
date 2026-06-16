from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Receipt
from orders.models import Order
from xhtml2pdf import pisa
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

@login_required
def download_receipt_pdf(request, receipt_id):
    receipt = get_object_or_404(
        Receipt.objects.select_related('order__waiter', 'order__payment')
        .prefetch_related('order__items__product'),
        id=receipt_id
    )
    html = render_to_string('receipts/receipt_pdf.html', {'receipt': receipt})
    result = io.BytesIO()
    pdf = pisa.pisaDocument(io.BytesIO(html.encode('UTF-8')), dest=result)
    if pdf.err:
        return HttpResponse('PDF generation error', status=500)
    response = HttpResponse(result.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="receipt_{receipt.receipt_number}.pdf"'
    return response
