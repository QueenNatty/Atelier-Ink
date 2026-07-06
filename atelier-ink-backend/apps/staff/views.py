from django.contrib import messages
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from apps.accounts.models import LoginHistory
from apps.bookings.models import Booking, ConsultationSlot, SessionBlock
from apps.studio.models import Artist, Service

from .decorators import admin_required, staff_required
from .forms import ConsultationSlotForm, ServiceForm, SessionBlockForm, StaffLoginForm


# ---------------------------------------------------------------- auth -----

def staff_login(request):
    if request.user.is_authenticated and (request.user.is_admin_user or request.user.is_artist):
        return redirect("staff:overview")

    form = StaffLoginForm(request=request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        auth_login(request, form.get_user())
        next_url = request.POST.get("next") or request.GET.get("next")
        return redirect(next_url or "staff:overview")

    return render(request, "staff/login.html", {"form": form, "next": request.GET.get("next", "")})


@staff_required
def staff_logout(request):
    auth_logout(request)
    messages.success(request, "You've been logged out.")
    return redirect("staff:login")


# ------------------------------------------------------------ overview -----

@staff_required
def overview(request):
    user = request.user
    bookings = Booking.objects.all() if user.is_admin_user else Booking.objects.filter(artist__user=user)
    today = timezone.now().date()

    if user.is_admin_user:
        consult_today = ConsultationSlot.objects.filter(date=today, status=ConsultationSlot.Status.BOOKED)
        session_today = SessionBlock.objects.filter(date=today).exclude(status=SessionBlock.Status.CANCELLED)
    else:
        consult_today = ConsultationSlot.objects.filter(
            date=today, status=ConsultationSlot.Status.BOOKED, artist__user=user
        )
        session_today = SessionBlock.objects.filter(date=today, artist__user=user).exclude(
            status=SessionBlock.Status.CANCELLED
        )

    stats = {
        "total": bookings.count(),
        "pending": bookings.filter(status=Booking.Status.PENDING).count(),
        "confirmed": bookings.filter(
            status__in=[Booking.Status.CONFIRMED, Booking.Status.DEPOSIT_PAID]
        ).count(),
        "today_consultations": consult_today.count(),
        "today_sessions": session_today.count(),
    }
    recent_bookings = bookings.select_related("client", "artist__user", "service").order_by("-created_at")[:8]

    return render(request, "staff/overview.html", {"stats": stats, "recent_bookings": recent_bookings})


# ------------------------------------------------------------ bookings -----

@staff_required
def booking_list(request):
    user = request.user
    qs = Booking.objects.select_related("client", "artist__user", "service")
    if not user.is_admin_user:
        qs = qs.filter(artist__user=user)

    status = request.GET.get("status", "")
    q = request.GET.get("q", "")
    if status:
        qs = qs.filter(status=status)
    if q:
        qs = qs.filter(
            Q(client__first_name__icontains=q)
            | Q(client__last_name__icontains=q)
            | Q(client__email__icontains=q)
            | Q(placement__icontains=q)
        )

    return render(request, "staff/booking_list.html", {
        "bookings": qs.order_by("-created_at")[:200],
        "status_choices": Booking.Status.choices,
        "current_status": status,
        "query": q,
    })


@staff_required
def booking_detail(request, pk):
    user = request.user
    qs = Booking.objects.select_related(
        "client", "artist__user", "service", "consultation_slot", "session_block"
    )
    if not user.is_admin_user:
        qs = qs.filter(artist__user=user)
    booking = get_object_or_404(qs, pk=pk)

    if request.method == "POST":
        action = request.POST.get("action")

        if action == "confirm" and booking.status == Booking.Status.PENDING:
            booking.status = Booking.Status.CONFIRMED
            booking.save(update_fields=["status", "updated_at"])
            messages.success(request, "Booking confirmed.")

        elif action == "mark_deposit_paid":
            booking.deposit_paid = True
            if booking.status == Booking.Status.CONFIRMED:
                booking.status = Booking.Status.DEPOSIT_PAID
            booking.save(update_fields=["deposit_paid", "status", "updated_at"])
            messages.success(request, "Deposit marked as paid.")

        elif action == "complete" and booking.status != Booking.Status.CANCELLED:
            booking.status = Booking.Status.COMPLETED
            booking.save(update_fields=["status", "updated_at"])
            messages.success(request, "Booking marked as completed.")

        elif action == "no_show":
            booking.status = Booking.Status.NO_SHOW
            booking.save(update_fields=["status", "updated_at"])
            messages.warning(request, "Booking marked as a no-show.")

        elif action == "cancel":
            if booking.status in [Booking.Status.COMPLETED, Booking.Status.CANCELLED]:
                messages.error(request, f"Cannot cancel a {booking.get_status_display().lower()} booking.")
            else:
                booking.cancel(reason=request.POST.get("cancellation_reason", ""))
                messages.success(request, "Booking cancelled.")

        elif action == "save_notes":
            booking.artist_notes = request.POST.get("artist_notes", "")
            booking.save(update_fields=["artist_notes", "updated_at"])
            messages.success(request, "Notes saved.")

        return redirect("staff:booking-detail", pk=booking.pk)

    return render(request, "staff/booking_detail.html", {"booking": booking})


# ------------------------------------------------------------- slots -------

def _artist_profile_or_none(user):
    return getattr(user, "artist_profile", None)


@staff_required
def consultation_slots(request):
    user = request.user
    if not user.is_admin_user and _artist_profile_or_none(user) is None:
        messages.error(request, "Your artist profile hasn't been set up yet — ask an admin.")
        return redirect("staff:overview")

    qs = ConsultationSlot.objects.select_related("artist__user")
    if not user.is_admin_user:
        qs = qs.filter(artist__user=user)

    if request.method == "POST":
        if request.POST.get("action") == "cancel":
            slot = get_object_or_404(qs, pk=request.POST.get("slot_id"))
            if slot.status == ConsultationSlot.Status.AVAILABLE:
                slot.status = ConsultationSlot.Status.CANCELLED
                slot.save(update_fields=["status"])
                messages.success(request, "Slot cancelled.")
            else:
                messages.error(request, "Only unbooked slots can be cancelled here.")
            return redirect("staff:consultation-slots")

        form = ConsultationSlotForm(request.POST, user=user)
        if form.is_valid():
            slot = form.save(commit=False)
            if not user.is_admin_user:
                slot.artist = user.artist_profile
            slot.save()
            messages.success(request, "Consultation slot added.")
            return redirect("staff:consultation-slots")
    else:
        form = ConsultationSlotForm(user=user)

    return render(request, "staff/consultation_slots.html", {
        "slots": qs.filter(date__gte=timezone.now().date()).order_by("date", "start_time")[:100],
        "form": form,
    })


@staff_required
def session_blocks(request):
    user = request.user
    if not user.is_admin_user and _artist_profile_or_none(user) is None:
        messages.error(request, "Your artist profile hasn't been set up yet — ask an admin.")
        return redirect("staff:overview")

    qs = SessionBlock.objects.select_related("artist__user", "service")
    if not user.is_admin_user:
        qs = qs.filter(artist__user=user)

    if request.method == "POST":
        if request.POST.get("action") == "cancel":
            block = get_object_or_404(qs, pk=request.POST.get("block_id"))
            block.status = SessionBlock.Status.CANCELLED
            block.save(update_fields=["status"])
            messages.success(request, "Session block cancelled.")
            return redirect("staff:session-blocks")

        form = SessionBlockForm(request.POST, user=user)
        if form.is_valid():
            block = form.save(commit=False)
            if not user.is_admin_user:
                block.artist = user.artist_profile
            block.save()
            messages.success(request, "Session block added.")
            return redirect("staff:session-blocks")
    else:
        form = SessionBlockForm(user=user)

    return render(request, "staff/session_blocks.html", {
        "blocks": qs.filter(date__gte=timezone.now().date()).order_by("date", "start_time")[:100],
        "form": form,
    })


# ---------------------------------------------------------- admin-only -----

@admin_required
def artists_list(request):
    if request.method == "POST":
        artist = get_object_or_404(Artist, pk=request.POST.get("artist_id"))
        artist.is_accepting_clients = not artist.is_accepting_clients
        artist.save(update_fields=["is_accepting_clients"])
        messages.success(request, f"Updated availability for {artist.user.full_name}.")
        return redirect("staff:artists")

    artists = Artist.objects.select_related("user").prefetch_related("specialties")
    return render(request, "staff/artists.html", {"artists": artists})


@admin_required
def services_list(request):
    if request.method == "POST":
        action = request.POST.get("action")
        if action == "toggle":
            service = get_object_or_404(Service, pk=request.POST.get("service_id"))
            service.is_active = not service.is_active
            service.save(update_fields=["is_active"])
            messages.success(request, f'Updated "{service.name}".')
            return redirect("staff:services")

        form = ServiceForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Service added.")
            return redirect("staff:services")
    else:
        form = ServiceForm()

    services = Service.objects.all().order_by("category", "name")
    return render(request, "staff/services.html", {"services": services, "form": form})


@staff_required
def login_history(request):
    user = request.user
    qs = LoginHistory.objects.select_related("user")
    if not user.is_admin_user:
        qs = qs.filter(user=user)
    return render(request, "staff/login_history.html", {"entries": qs[:100]})
