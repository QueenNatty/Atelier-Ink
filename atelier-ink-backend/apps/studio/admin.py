from django.contrib import admin
from .models import Service, Artist, WorkingHours, ArtistPortfolio


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "base_price", "min_duration_minutes", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["name"]
    list_editable = ["is_active", "base_price"]


class WorkingHoursInline(admin.TabularInline):
    model = WorkingHours
    extra = 0


class PortfolioInline(admin.TabularInline):
    model = ArtistPortfolio
    extra = 0
    readonly_fields = ["uploaded_at"]


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ["__str__", "is_accepting_clients", "years_experience"]
    list_filter = ["is_accepting_clients"]
    search_fields = ["user__first_name", "user__last_name", "user__email"]
    filter_horizontal = ["specialties"]
    inlines = [WorkingHoursInline, PortfolioInline]


@admin.register(WorkingHours)
class WorkingHoursAdmin(admin.ModelAdmin):
    list_display = ["artist", "day_of_week", "start_time", "end_time", "is_available"]
    list_filter = ["day_of_week", "is_available"]
