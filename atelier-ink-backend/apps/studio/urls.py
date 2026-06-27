from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ArtistViewSet, WorkingHoursViewSet, ArtistPortfolioViewSet

router = DefaultRouter()
router.register("services", ServiceViewSet, basename="service")
router.register("artists", ArtistViewSet, basename="artist")
router.register("working-hours", WorkingHoursViewSet, basename="working-hours")
router.register("portfolio", ArtistPortfolioViewSet, basename="portfolio")

urlpatterns = [
    path("", include(router.urls)),
]
