from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class InventoryLog(models.Model):
    ACTION_CHOICES = [
        ('add', 'Stock Added'),
        ('remove', 'Stock Removed'),
        ('update', 'Stock Updated'),
        ('sale', 'Sale Deduction'),
        ('adjustment', 'Manual Adjustment'),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    quantity_change = models.IntegerField()
    stock_before = models.PositiveIntegerField()
    stock_after = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.action} ({self.quantity_change})"
