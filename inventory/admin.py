from django.contrib import admin
from .models import InventoryLog

@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ['product', 'action', 'quantity_change', 'stock_before', 'stock_after', 'user', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['product__name', 'notes']
