from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """Admins can write; everyone else (including anonymous) can read."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin_user


class IsArtistOwnerOrAdmin(BasePermission):
    """An artist can manage their own resources; admins can manage all."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_artist or request.user.is_admin_user
        )

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        # obj might be WorkingHours, ArtistPortfolio, etc.
        artist = getattr(obj, "artist", None)
        if artist:
            return artist.user == request.user
        return False


class IsAdminUser(BasePermission):
    """Only studio admins."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class IsOwnerOrAdmin(BasePermission):
    """The object owner or an admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        client = getattr(obj, "client", None)
        if client:
            return client == request.user
        return obj == request.user
