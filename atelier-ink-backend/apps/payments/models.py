from django.db import models
from apps.accounts.models import User
from apps.bookings.models import Booking


class PaystackTransaction(models.Model):
    """Records every Paystack payment attempt against a booking."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        ABANDONED = "abandoned", "Abandoned"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="transactions"
    )
    # Paystack reference — unique per transaction
    reference = models.CharField(max_length=100, unique=True)
    # Amount in Kobo (Paystack always works in the smallest currency unit)
    amount_kobo = models.PositiveIntegerField(help_text="Amount in Kobo (100 kobo = ₦1)")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    paystack_id = models.CharField(max_length=100, blank=True)
    channel = models.CharField(max_length=50, blank=True, help_text="card, bank_transfer, ussd…")
    currency = models.CharField(max_length=5, default="NGN")
    paid_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        naira = self.amount_kobo / 100
        return f"₦{naira:,.0f} — {self.reference} ({self.status})"

    @property
    def amount_naira(self):
        return self.amount_kobo / 100
