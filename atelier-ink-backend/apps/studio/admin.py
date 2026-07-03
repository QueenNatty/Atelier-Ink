from django.contrib import admin
from .models import Service, Artist, WorkingHours, ArtistPortfolio


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "base_price", "min_duration_minutes", "is_active"]
    list_filter = ["category", "is_active"]
    list_editable = ["is_active", "base_price"]


class WorkingHoursInline(admin.TabularInline):
    model = WorkingHours
    extra = 0


class PortfolioInline(admin.TabularInline):
    model = ArtistPortfolio
    extra = 0


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ["__str__", "is_accepting_clients", "years_experience"]
    list_filter = ["is_accepting_clients"]
    filter_horizontal = ["specialties"]
    inlines = [WorkingHoursInline, PortfolioInline]
