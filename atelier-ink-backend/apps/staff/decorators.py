from functools import wraps

from django.contrib import messages
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect


def staff_required(view_func):
    """Allows only authenticated admins or artists. Clients get bounced
    straight back to the login screen with an explanation."""

    @login_required(login_url="staff:login")
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = request.user
        if not (user.is_admin_user or user.is_artist):
            messages.error(request, "This portal is for studio staff only.")
            auth_logout(request)
            return redirect("staff:login")
        return view_func(request, *args, **kwargs)

    return wrapper


def admin_required(view_func):
    """Allows only admins. Artists are redirected to the overview page."""

    @staff_required
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_admin_user:
            messages.error(request, "That section is admin-only.")
            return redirect("staff:overview")
        return view_func(request, *args, **kwargs)

    return wrapper
