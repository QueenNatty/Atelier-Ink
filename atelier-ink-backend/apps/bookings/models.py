from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.accounts.models import User
from apps.studio.models import Artist, Service


class ConsultationSlot(models.Model):
    """
    A short fixed-length slot (e.g. 30 min) for free consultations.
    Artists define these; clients book them.
    """

    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        BOOKED = "booked", "Booked"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    artist = models.ForeignKey(
        Artist, on_delete=models.CASCADE, related_name="consultation_slots"
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.AVAILABLE
    )
    notes = models.TextField(blank=True, help_text="Internal artist notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        # An artist cannot have overlapping consultation slots
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
    """
    A multi-hour work session block that an artist blocks out for tattoo/
    piercing appointments. Can span several hours; divided into segments
    that map to individual Bookings.
    """

    class Status(models.TextChoices):
        OPEN = "open", "Open"          # Block exists, slots available
        FULL = "full", "Fully Booked"  # All hours assigned
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    artist = models.ForeignKey(
        Artist, on_delete=models.CASCADE, related_name="session_blocks"
    )
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, blank=True
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    # How many hours are already reserved (denormalised for query speed)
    booked_hours = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN
    )
    deposit_required = models.DecimalField(
        max_digits=8, decimal_places=2, default=0,
        help_text="Deposit amount required to reserve this block"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return (
            f"{self.artist.user.full_name} — {self.date} "
            f"{self.start_time:%H:%M}–{self.end_time:%H:%M}"
        )

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time.")

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
        """Update status based on booked hours."""
        if float(self.booked_hours) >= self.total_hours:
            self.status = self.Status.FULL
        elif self.status == self.Status.FULL:
            self.status = self.Status.OPEN
        self.save(update_fields=["status"])


class Booking(models.Model):
    """
    A client's booking — either against a ConsultationSlot or
    a portion of a SessionBlock.
    """

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

    # ── Who & What ────────────────────────────────────────────────────────────
    client = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="bookings"
    )
    artist = models.ForeignKey(
        Artist, on_delete=models.CASCADE, related_name="bookings"
    )
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True
    )

    booking_type = models.CharField(max_length=20, choices=BookingType.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    # ── Slot / Block Link ─────────────────────────────────────────────────────
    consultation_slot = models.OneToOneField(
        ConsultationSlot, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="booking"
    )
    session_block = models.ForeignKey(
        SessionBlock, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="bookings"
    )

    # ── Session Timing (for session bookings within a block) ──────────────────
    session_date = models.DateField(null=True, blank=True)
    session_start_time = models.TimeField(null=True, blank=True)
    session_hours = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True,
        help_text="Number of hours reserved within the session block"
    )

    # ── Client Details ────────────────────────────────────────────────────────
    description = models.TextField(
        blank=True, help_text="Client's description of what they want"
    )
    reference_image = models.CharField(
        max_length=255, blank=True
    )
    placement = models.CharField(
        max_length=150, blank=True, help_text="Body placement for tattoo/piercing"
    )

    # ── Pricing ───────────────────────────────────────────────────────────────
    quoted_price = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    deposit_amount = models.DecimalField(
        max_digits=8, decimal_places=2, default=0
    )
    deposit_paid = models.BooleanField(default=False)

    # ── Internal ──────────────────────────────────────────────────────────────
    artist_notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Booking #{self.pk} — {self.client.full_name} "
            f"with {self.artist.user.full_name} ({self.get_status_display()})"
        )

    def clean(self):
        if self.booking_type == self.BookingType.CONSULTATION and not self.consultation_slot:
            raise ValidationError("Consultation bookings must have a slot.")
        if self.booking_type == self.BookingType.SESSION and not self.session_block:
            raise ValidationError("Session bookings must have a session block.")

    def confirm(self):
        self.status = self.Status.CONFIRMED
        self.save(update_fields=["status", "updated_at"])

    def cancel(self, reason=""):
        self.status = self.Status.CANCELLED
        self.cancellation_reason = reason
        self.save(update_fields=["status", "cancellation_reason", "updated_at"])
        # Free up the slot/block
        if self.consultation_slot:
            self.consultation_slot.status = ConsultationSlot.Status.AVAILABLE
            self.consultation_slot.save(update_fields=["status"])
        if self.session_block and self.session_hours:
            self.session_block.booked_hours = max(
                0, float(self.session_block.booked_hours) - float(self.session_hours)
            )
            self.session_block.save(update_fields=["booked_hours"])
            self.session_block.recalculate_status()
