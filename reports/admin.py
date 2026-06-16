from django.contrib import admin
from .models import DailyReport

@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    list_display = ['report_date', 'total_revenue', 'total_orders', 'delivered_orders', 'cancelled_orders']
    list_filter = ['report_date']
