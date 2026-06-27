from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/studio/", include("apps.studio.urls")),
    path("api/v1/bookings/", include("apps.bookings.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize admin header
admin.site.site_header = "Inkbound Studio Admin"
admin.site.site_title = "Inkbound"
admin.site.index_title = "Studio Management"
