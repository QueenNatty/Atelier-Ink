from rest_framework import serializers
from .models import Service, Artist, WorkingHours, ArtistPortfolio
from apps.accounts.serializers import UserSerializer


class ServiceSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Service
        fields = [
            "id", "name", "category", "category_display", "description",
            "base_price", "min_duration_minutes", "max_duration_minutes", "is_active",
        ]


class WorkingHoursSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source="get_day_of_week_display", read_only=True)

    class Meta:
        model = WorkingHours
        fields = ["id", "day_of_week", "day_name", "start_time", "end_time", "is_available"]


class ArtistPortfolioSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ArtistPortfolio
        fields = ["id", "image_url", "caption", "service", "is_featured", "uploaded_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ArtistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialties = ServiceSerializer(many=True, read_only=True)
    working_hours = WorkingHoursSerializer(many=True, read_only=True)
    portfolio_images = ArtistPortfolioSerializer(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()
    specialty_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Service.objects.all(),
        write_only=True, source="specialties", required=False,
    )

    class Meta:
        model = Artist
        fields = [
            "id", "user", "bio", "specialties", "specialty_ids",
            "instagram_handle", "avatar", "avatar_url",
            "is_accepting_clients", "years_experience",
            "working_hours", "portfolio_images",
        ]
        read_only_fields = ["id"]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class ArtistListSerializer(serializers.ModelSerializer):
    """Lighter serializer used in list views."""
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    specialty_names = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = [
            "id", "full_name", "bio", "specialty_names",
            "avatar_url", "is_accepting_clients", "years_experience",
        ]

    def get_specialty_names(self, obj):
        return [s.name for s in obj.specialties.filter(is_active=True)]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None
