from django.db import models
from django.contrib.auth.models import User
from orders.models import Order

class Sale(models.Model):
    sale_number = models.CharField(max_length=20, unique=True, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='sale')
    customer_name = models.CharField(max_length=200, blank=True)
    waiter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sales')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Sale #{self.sale_number}"

    def save(self, *args, **kwargs):
        if not self.sale_number:
            last = Sale.objects.order_by('-id').first()
            next_id = (last.id + 1) if last else 1
            self.sale_number = f"SAL-{next_id:05d}"
        super().save(*args, **kwargs)
