from django.db import models

class DailyReport(models.Model):
    report_date = models.DateField(unique=True)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.PositiveIntegerField(default=0)
    delivered_orders = models.PositiveIntegerField(default=0)
    cancelled_orders = models.PositiveIntegerField(default=0)
    best_selling_product = models.CharField(max_length=200, blank=True)
    best_selling_qty = models.PositiveIntegerField(default=0)
    payment_breakdown = models.JSONField(default=dict)
    pdf_file = models.FileField(upload_to='reports/', blank=True, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        return f"Report - {self.report_date}"
