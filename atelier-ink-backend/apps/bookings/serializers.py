from rest_framework import serializers
from django.utils import timezone
from .models import ConsultationSlot, SessionBlock, Booking
from apps.studio.serializers import ArtistListSerializer, ServiceSerializer


class ConsultationSlotSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source="artist.user.full_name", read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()

    class Meta:
        model = ConsultationSlot
        fields = [
            "id", "artist", "artist_name", "date", "start_time", "end_time",
            "duration_minutes", "status", "is_upcoming", "notes",
        ]
        read_only_fields = ["id", "status"]

    def validate(self, attrs):
        if attrs.get("date") and attrs["date"] < timezone.now().date():
            raise serializers.ValidationError({"date": "Cannot create slots in the past."})
        if attrs.get("start_time") and attrs.get("end_time"):
            if attrs["start_time"] >= attrs["end_time"]:
                raise serializers.ValidationError("Start time must be before end time.")
        return attrs


class SessionBlockSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source="artist.user.full_name", read_only=True)
    service_detail = ServiceSerializer(source="service", read_only=True)
    total_hours = serializers.ReadOnlyField()
    available_hours = serializers.ReadOnlyField()

    class Meta:
        model = SessionBlock
        fields = [
            "id", "artist", "artist_name", "service", "service_detail",
            "date", "start_time", "end_time",
            "total_hours", "available_hours", "booked_hours",
            "status", "deposit_required", "notes",
        ]
        read_only_fields = ["id", "booked_hours", "status"]

    def validate(self, attrs):
        if attrs.get("date") and attrs["date"] < timezone.now().date():
            raise serializers.ValidationError({"date": "Cannot create blocks in the past."})
        if attrs.get("start_time") and attrs.get("end_time"):
            if attrs["start_time"] >= attrs["end_time"]:
                raise serializers.ValidationError("Start time must be before end time.")
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.full_name", read_only=True)
    artist_name = serializers.CharField(source="artist.user.full_name", read_only=True)
    service_detail = ServiceSerializer(source="service", read_only=True)
    reference_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id", "client", "client_name", "artist", "artist_name",
            "service", "service_detail",
            "booking_type", "status",
            "consultation_slot", "session_block",
            "session_date", "session_start_time", "session_hours",
            "description", "reference_image", "reference_image_url", "placement",
            "quoted_price", "deposit_amount", "deposit_paid",
            "artist_notes", "cancellation_reason",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "client", "status", "deposit_paid",
            "artist_notes", "cancellation_reason", "created_at", "updated_at",
        ]

    def get_reference_image_url(self, obj):
        request = self.context.get("request")
        if obj.reference_image and request:
            return request.build_absolute_uri(obj.reference_image.url)
        return None

    def validate(self, attrs):
        booking_type = attrs.get("booking_type")
        if booking_type == Booking.BookingType.CONSULTATION:
            if not attrs.get("consultation_slot"):
                raise serializers.ValidationError(
                    {"consultation_slot": "Required for consultation bookings."}
                )
            slot = attrs["consultation_slot"]
            if slot.status != ConsultationSlot.Status.AVAILABLE:
                raise serializers.ValidationError(
                    {"consultation_slot": "This slot is no longer available."}
                )
        elif booking_type == Booking.BookingType.SESSION:
            if not attrs.get("session_block"):
                raise serializers.ValidationError(
                    {"session_block": "Required for session bookings."}
                )
            block = attrs["session_block"]
            hours = attrs.get("session_hours")
            if not hours:
                raise serializers.ValidationError(
                    {"session_hours": "Required for session bookings."}
                )
            if float(hours) > block.available_hours:
                raise serializers.ValidationError(
                    {"session_hours": f"Only {block.available_hours:.1f} hours available in this block."}
                )
        return attrs

    def create(self, validated_data):
        booking = super().create(validated_data)
        # Mark the consultation slot as booked
        if booking.consultation_slot:
            booking.consultation_slot.status = ConsultationSlot.Status.BOOKED
            booking.consultation_slot.save(update_fields=["status"])
        # Reserve hours on the session block
        if booking.session_block and booking.session_hours:
            block = booking.session_block
            block.booked_hours = float(block.booked_hours) + float(booking.session_hours)
            block.save(update_fields=["booked_hours"])
            block.recalculate_status()
        return booking


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    """Used by artists/admins to update booking status and add notes."""

    class Meta:
        model = Booking
        fields = ["status", "quoted_price", "deposit_amount", "artist_notes"]

    def validate_status(self, value):
        allowed = [
            Booking.Status.CONFIRMED,
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED,
            Booking.Status.NO_SHOW,
        ]
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid status. Choose from: {allowed}")
        return value


class CancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
