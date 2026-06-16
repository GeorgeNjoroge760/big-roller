from django.db import models
from orders.models import Order

class Receipt(models.Model):
    receipt_number = models.CharField(max_length=20, unique=True, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='receipt')
    pdf_file = models.FileField(upload_to='receipts/', blank=True, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt #{self.receipt_number}"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            last = Receipt.objects.order_by('-id').first()
            next_id = (last.id + 1) if last else 1
            self.receipt_number = f"RCT-{next_id:05d}"
        super().save(*args, **kwargs)
