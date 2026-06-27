from django.contrib import admin
from .models import ConsultationSlot, SessionBlock, Booking


@admin.register(ConsultationSlot)
class ConsultationSlotAdmin(admin.ModelAdmin):
    list_display = ["artist", "date", "start_time", "end_time", "status"]
    list_filter = ["status", "date", "artist"]
    search_fields = ["artist__user__first_name", "artist__user__last_name"]
    date_hierarchy = "date"


class BookingInline(admin.TabularInline):
    model = Booking
    extra = 0
    fields = ["client", "service", "session_hours", "status", "quoted_price"]
    readonly_fields = ["client", "created_at"]


@admin.register(SessionBlock)
class SessionBlockAdmin(admin.ModelAdmin):
    list_display = [
        "artist", "date", "start_time", "end_time",
        "total_hours", "booked_hours", "available_hours", "status",
    ]
    list_filter = ["status", "date", "artist"]
    search_fields = ["artist__user__first_name", "artist__user__last_name"]
    date_hierarchy = "date"
    inlines = [BookingInline]
    readonly_fields = ["booked_hours"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "id", "client", "artist", "booking_type", "status",
        "quoted_price", "deposit_paid", "created_at",
    ]
    list_filter = ["booking_type", "status", "deposit_paid"]
    search_fields = [
        "client__email", "client__first_name",
        "artist__user__first_name", "artist__user__last_name",
    ]
    readonly_fields = ["created_at", "updated_at"]
    date_hierarchy = "created_at"
    fieldsets = (
        ("Booking Info", {"fields": ("client", "artist", "service", "booking_type", "status")}),
        ("Slot / Block", {"fields": ("consultation_slot", "session_block", "session_date", "session_start_time", "session_hours")}),
        ("Client Details", {"fields": ("description", "reference_image", "placement")}),
        ("Pricing", {"fields": ("quoted_price", "deposit_amount", "deposit_paid")}),
        ("Notes", {"fields": ("artist_notes", "cancellation_reason")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
