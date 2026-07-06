from django.urls import path

from . import views

app_name = "staff"

urlpatterns = [
    path("login/", views.staff_login, name="login"),
    path("logout/", views.staff_logout, name="logout"),
    path("", views.overview, name="overview"),
    path("bookings/", views.booking_list, name="booking-list"),
    path("bookings/<int:pk>/", views.booking_detail, name="booking-detail"),
    path("slots/consultations/", views.consultation_slots, name="consultation-slots"),
    path("slots/sessions/", views.session_blocks, name="session-blocks"),
    path("artists/", views.artists_list, name="artists"),
    path("services/", views.services_list, name="services"),
    path("login-history/", views.login_history, name="login-history"),
]
