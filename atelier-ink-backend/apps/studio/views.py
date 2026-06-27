from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Service, Artist, WorkingHours, ArtistPortfolio
from .serializers import (
    ServiceSerializer,
    ArtistSerializer,
    ArtistListSerializer,
    WorkingHoursSerializer,
    ArtistPortfolioSerializer,
)
from apps.accounts.permissions import IsAdminOrReadOnly, IsArtistOwnerOrAdmin


class ServiceViewSet(viewsets.ModelViewSet):
    """CRUD for services. Public read, admin write."""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name", "description"]


class ArtistViewSet(viewsets.ModelViewSet):
    """
    list/retrieve: public
    create/update/delete: admin only
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_accepting_clients"]
    search_fields = ["user__first_name", "user__last_name", "bio"]

    def get_queryset(self):
        return Artist.objects.select_related("user").prefetch_related(
            "specialties", "working_hours", "portfolio_images"
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ArtistListSerializer
        return ArtistSerializer


class WorkingHoursViewSet(viewsets.ModelViewSet):
    """Manage an artist's regular weekly schedule."""
    serializer_class = WorkingHoursSerializer
    permission_classes = [IsArtistOwnerOrAdmin]

    def get_queryset(self):
        return WorkingHours.objects.filter(artist__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user.artist_profile)


class ArtistPortfolioViewSet(viewsets.ModelViewSet):
    """Portfolio images — artists manage their own, admins manage all."""
    serializer_class = ArtistPortfolioSerializer
    permission_classes = [IsArtistOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_admin_user:
            return ArtistPortfolio.objects.all()
        return ArtistPortfolio.objects.filter(artist__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user.artist_profile)
