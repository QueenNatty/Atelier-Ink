from django.contrib import admin
from .models import ConsultationSlot, SessionBlock, Booking


@admin.register(ConsultationSlot)
class ConsultationSlotAdmin(admin.ModelAdmin):
    list_display = ["artist", "date", "start_time", "end_time", "status"]
    list_filter = ["status", "date"]
    date_hierarchy = "date"


class BookingInline(admin.TabularInline):
    model = Booking
    extra = 0
    fields = ["client", "service", "session_hours", "status", "deposit_paid"]
    readonly_fields = ["client", "created_at"]


@admin.register(SessionBlock)
class SessionBlockAdmin(admin.ModelAdmin):
    list_display = ["artist", "date", "start_time", "end_time", "booked_hours", "status"]
    list_filter = ["status", "date"]
    date_hierarchy = "date"
    inlines = [BookingInline]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["id", "client", "artist", "booking_type", "status", "deposit_paid", "created_at"]
    list_filter = ["booking_type", "status", "deposit_paid"]
    search_fields = ["client__email", "artist__user__first_name"]
    readonly_fields = ["created_at", "updated_at"]
