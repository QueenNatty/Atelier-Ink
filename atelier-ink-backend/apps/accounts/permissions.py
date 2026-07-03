from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin_user


class IsArtistOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_artist or request.user.is_admin_user
        )

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        artist = getattr(obj, "artist", None)
        if artist:
            return artist.user == request.user
        return False


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_user:
            return True
        client = getattr(obj, "client", None)
        if client:
            return client == request.user
        return obj == request.user
