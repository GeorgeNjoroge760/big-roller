from django.contrib import admin
from .models import Receipt

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ['receipt_number', 'order', 'generated_at']
    search_fields = ['receipt_number', 'order__order_number']
