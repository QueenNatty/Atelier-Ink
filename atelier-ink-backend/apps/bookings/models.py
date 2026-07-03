from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.accounts.models import User
from apps.studio.models import Artist, Service


class ConsultationSlot(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        BOOKED = "booked", "Booked"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="consultation_slots")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["artist", "date", "start_time"],
                name="unique_consultation_slot_per_artist",
            )
        ]

    def __str__(self):
        return f"{self.artist.user.full_name} — {self.date} {self.start_time:%H:%M}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time.")

    @property
    def duration_minutes(self):
        from datetime import datetime, date
        start = datetime.combine(date.today(), self.start_time)
        end = datetime.combine(date.today(), self.end_time)
        return int((end - start).total_seconds() / 60)

    @property
    def is_upcoming(self):
        return self.date >= timezone.now().date()


class SessionBlock(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        FULL = "full", "Fully Booked"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="session_blocks")
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    booked_hours = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    # Deposit in Naira
    deposit_required = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.artist.user.full_name} — {self.date} {self.start_time:%H:%M}–{self.end_time:%H:%M}"

    @property
    def total_hours(self):
        from datetime import datetime, date
        start = datetime.combine(date.today(), self.start_time)
        end = datetime.combine(date.today(), self.end_time)
        return (end - start).total_seconds() / 3600

    @property
    def available_hours(self):
        return self.total_hours - float(self.booked_hours)

    def recalculate_status(self):
        if float(self.booked_hours) >= self.total_hours:
            self.status = self.Status.FULL
        elif self.status == self.Status.FULL:
            self.status = self.Status.OPEN
        self.save(update_fields=["status"])


class Booking(models.Model):
    class BookingType(models.TextChoices):
        CONSULTATION = "consultation", "Consultation"
        SESSION = "session", "Session"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        DEPOSIT_PAID = "deposit_paid", "Deposit Paid"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No Show"

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="bookings")
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True)
    booking_type = models.CharField(max_length=20, choices=BookingType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    consultation_slot = models.OneToOneField(
        ConsultationSlot, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="booking"
    )
    session_block = models.ForeignKey(
        SessionBlock, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="bookings"
    )
    session_date = models.DateField(null=True, blank=True)
    session_start_time = models.TimeField(null=True, blank=True)
    session_hours = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)

    description = models.TextField(blank=True)
    placement = models.CharField(max_length=150, blank=True)

    # All prices in Naira
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_paid = models.BooleanField(default=False)

    artist_notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.pk} — {self.client.full_name} ({self.get_status_display()})"

    def cancel(self, reason=""):
        self.status = self.Status.CANCELLED
        self.cancellation_reason = reason
        self.save(update_fields=["status", "cancellation_reason", "updated_at"])
        if self.consultation_slot:
            self.consultation_slot.status = ConsultationSlot.Status.AVAILABLE
            self.consultation_slot.save(update_fields=["status"])
        if self.session_block and self.session_hours:
            self.session_block.booked_hours = max(
                0, float(self.session_block.booked_hours) - float(self.session_hours)
            )
            self.session_block.save(update_fields=["booked_hours"])
            self.session_block.recalculate_status()
