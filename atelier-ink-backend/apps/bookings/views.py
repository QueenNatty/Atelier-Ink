from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import ConsultationSlot, SessionBlock, Booking
from .serializers import (
    ConsultationSlotSerializer,
    SessionBlockSerializer,
    BookingSerializer,
    BookingStatusUpdateSerializer,
    CancelBookingSerializer,
)
from apps.accounts.permissions import IsAdminUser, IsOwnerOrAdmin, IsArtistOwnerOrAdmin


class ConsultationSlotViewSet(viewsets.ModelViewSet):
    """
    Artists create/manage their consultation slots.
    Clients view available slots and book them via BookingViewSet.
    """
    serializer_class = ConsultationSlotSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["artist", "status", "date"]
    ordering_fields = ["date", "start_time"]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "available"]:
            return [AllowAny()]
        return [IsArtistOwnerOrAdmin()]

    def get_queryset(self):
        qs = ConsultationSlot.objects.select_related("artist__user")
        # Default: only show upcoming available slots to regular clients
        user = self.request.user
        if not user.is_authenticated:
            return qs.filter(status=ConsultationSlot.Status.AVAILABLE, date__gte=timezone.now().date())
        if user.is_artist and not user.is_admin_user:
            return qs.filter(artist__user=user)
        if not user.is_admin_user:
            return qs.filter(
                status=ConsultationSlot.Status.AVAILABLE,
                date__gte=timezone.now().date(),
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user.artist_profile)

    @action(detail=False, methods=["get"])
    def available(self, request):
        """Shortcut: available upcoming slots, optionally filtered by artist."""
        qs = ConsultationSlot.objects.filter(
            status=ConsultationSlot.Status.AVAILABLE,
            date__gte=timezone.now().date(),
        ).select_related("artist__user")
        artist_id = request.query_params.get("artist")
        if artist_id:
            qs = qs.filter(artist_id=artist_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class SessionBlockViewSet(viewsets.ModelViewSet):
    """
    Artists/admins manage multi-hour session blocks.
    Clients can view open blocks.
    """
    serializer_class = SessionBlockSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["artist", "status", "date", "service"]
    ordering_fields = ["date", "start_time"]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "available"]:
            return [AllowAny()]
        return [IsArtistOwnerOrAdmin()]

    def get_queryset(self):
        qs = SessionBlock.objects.select_related("artist__user", "service")
        user = self.request.user
        if user.is_artist and not user.is_admin_user:
            return qs.filter(artist__user=user)
        if not user.is_admin_user:
            return qs.filter(
                status=SessionBlock.Status.OPEN,
                date__gte=timezone.now().date(),
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user.artist_profile)

    @action(detail=False, methods=["get"])
    def available(self, request):
        """Open session blocks with remaining hours."""
        qs = SessionBlock.objects.filter(
            status=SessionBlock.Status.OPEN,
            date__gte=timezone.now().date(),
        ).select_related("artist__user", "service")
        artist_id = request.query_params.get("artist")
        service_id = request.query_params.get("service")
        if artist_id:
            qs = qs.filter(artist_id=artist_id)
        if service_id:
            qs = qs.filter(service_id=service_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    """
    Clients create bookings; artists/admins manage them.
    """
    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["booking_type", "status", "artist", "service"]
    ordering_fields = ["created_at", "session_date"]

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related(
            "client", "artist__user", "service",
            "consultation_slot", "session_block",
        )
        if user.is_admin_user:
            return qs
        if user.is_artist:
            return qs.filter(artist__user=user)
        # Clients only see their own
        return qs.filter(client=user)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(detail=True, methods=["patch"], permission_classes=[IsArtistOwnerOrAdmin])
    def update_status(self, request, pk=None):
        """Artists/admins update booking status, add notes, set price."""
        booking = self.get_object()
        serializer = BookingStatusUpdateSerializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(BookingSerializer(booking, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Client or admin cancels a booking."""
        booking = self.get_object()
        # Permission check — only owner or admin
        if not (request.user.is_admin_user or booking.client == request.user):
            return Response(
                {"detail": "You do not have permission to cancel this booking."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if booking.status in [Booking.Status.COMPLETED, Booking.Status.CANCELLED]:
            return Response(
                {"detail": f"Cannot cancel a booking with status '{booking.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking.cancel(reason=serializer.validated_data.get("reason", ""))
        return Response(BookingSerializer(booking, context={"request": request}).data)

    @action(detail=False, methods=["get"])
    def my_bookings(self, request):
        """Convenience endpoint: current user's bookings."""
        qs = Booking.objects.filter(client=request.user).select_related(
            "artist__user", "service", "consultation_slot", "session_block"
        )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
