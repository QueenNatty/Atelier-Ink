from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Service, Artist, WorkingHours, ArtistPortfolio
from .serializers import (
    ServiceSerializer, ArtistSerializer,
    ArtistListSerializer, WorkingHoursSerializer, ArtistPortfolioSerializer,
)
from apps.accounts.permissions import IsAdminOrReadOnly, IsArtistOwnerOrAdmin


class ServiceViewSet(viewsets.ModelViewSet):
    """Public read — only active services shown. Admin write."""
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminOrReadOnly()]

    def get_queryset(self):
        # Public list only shows active services
        # Admin can filter to see inactive ones too
        qs = Service.objects.all()
        if self.action == "list":
            user = self.request.user
            if not (user.is_authenticated and user.is_admin_user):
                qs = qs.filter(is_active=True)
        return qs.order_by("category", "name")


class ArtistViewSet(viewsets.ModelViewSet):
    """
    Public read — all artists returned (frontend handles waitlist display).
    Admin write.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_accepting_clients"]
    search_fields = ["user__first_name", "user__last_name", "bio"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminOrReadOnly()]

    def get_queryset(self):
        return Artist.objects.select_related("user").prefetch_related(
            "specialties", "working_hours", "portfolio_images"
        ).order_by("user__first_name")

    def get_serializer_class(self):
        if self.action == "list":
            return ArtistListSerializer
        return ArtistSerializer


class WorkingHoursViewSet(viewsets.ModelViewSet):
    serializer_class = WorkingHoursSerializer
    permission_classes = [IsArtistOwnerOrAdmin]

    def get_queryset(self):
        return WorkingHours.objects.filter(artist__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user.artist_profile)


class ArtistPortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = ArtistPortfolioSerializer
    permission_classes = [IsArtistOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_admin_user:
            return ArtistPortfolio.objects.all()
        return ArtistPortfolio.objects.filter(artist__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user.artist_profile)
