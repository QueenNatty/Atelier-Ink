from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsultationSlotViewSet, SessionBlockViewSet, BookingViewSet

router = DefaultRouter()
router.register("consultation-slots", ConsultationSlotViewSet, basename="consultation-slot")
router.register("session-blocks", SessionBlockViewSet, basename="session-block")
router.register("", BookingViewSet, basename="booking")

urlpatterns = [
    path("", include(router.urls)),
]
