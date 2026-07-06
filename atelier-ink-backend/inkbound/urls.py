from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path("", RedirectView.as_view(url="/staff/", permanent=False)),
    path("admin/", admin.site.urls),
    path("staff/", include("apps.staff.urls")),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/studio/", include("apps.studio.urls")),
    path("api/v1/bookings/", include("apps.bookings.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
]

admin.site.site_header = "Atelier Ink Admin"
admin.site.site_title = "Atelier Ink"
admin.site.index_title = "Studio Management"
