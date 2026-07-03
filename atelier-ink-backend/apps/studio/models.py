from django.db import models
from apps.accounts.models import User


class Service(models.Model):
    class Category(models.TextChoices):
        TATTOO = "tattoo", "Tattoo"
        PIERCING = "piercing", "Piercing"
        CONSULTATION = "consultation", "Consultation"
        TOUCH_UP = "touch_up", "Touch-Up"
        REMOVAL = "removal", "Removal"

    name = models.CharField(max_length=150)
    category = models.CharField(max_length=30, choices=Category.choices)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)  # in Naira
    min_duration_minutes = models.PositiveIntegerField(default=30)
    max_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Artist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="artist_profile")
    bio = models.TextField(blank=True)
    specialties = models.ManyToManyField(Service, related_name="artists", blank=True)
    instagram_handle = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    is_accepting_clients = models.BooleanField(default=True)
    years_experience = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["user__first_name"]

    def __str__(self):
        return f"Artist: {self.user.full_name}"


class WorkingHours(models.Model):
    DAYS = [
        (0, "Monday"), (1, "Tuesday"), (2, "Wednesday"),
        (3, "Thursday"), (4, "Friday"), (5, "Saturday"), (6, "Sunday"),
    ]
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="working_hours")
    day_of_week = models.IntegerField(choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ["artist", "day_of_week"]
        ordering = ["artist", "day_of_week"]

    def __str__(self):
        day_name = dict(self.DAYS)[self.day_of_week]
        return f"{self.artist.user.full_name} — {day_name}"


class ArtistPortfolio(models.Model):
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="portfolio_images")
    image_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=255, blank=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_featured", "-uploaded_at"]

    def __str__(self):
        return f"{self.artist.user.full_name} — {self.caption or 'Portfolio image'}"
