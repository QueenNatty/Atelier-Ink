from django import forms
from django.contrib.auth import authenticate

from apps.bookings.models import ConsultationSlot, SessionBlock
from apps.studio.models import Artist, Service


class StaffLoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={"placeholder": "you@atelierink.studio", "autofocus": True})
    )
    password = forms.CharField(widget=forms.PasswordInput(attrs={"placeholder": "••••••••"}))

    def __init__(self, *args, request=None, **kwargs):
        self.request = request
        self.user_cache = None
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned = super().clean()
        email = cleaned.get("email")
        password = cleaned.get("password")
        if email and password:
            user = authenticate(self.request, email=email, password=password)
            if user is None:
                raise forms.ValidationError("Incorrect email or password.")
            if not user.is_active:
                raise forms.ValidationError("This account has been deactivated.")
            if not (user.is_admin_user or user.is_artist):
                raise forms.ValidationError(
                    "This portal is for studio staff only. Clients should use the main site."
                )
            self.user_cache = user
        return cleaned

    def get_user(self):
        return self.user_cache


class ConsultationSlotForm(forms.ModelForm):
    class Meta:
        model = ConsultationSlot
        fields = ["artist", "date", "start_time", "end_time", "notes"]
        widgets = {
            "date": forms.DateInput(attrs={"type": "date"}),
            "start_time": forms.TimeInput(attrs={"type": "time"}),
            "end_time": forms.TimeInput(attrs={"type": "time"}),
            "notes": forms.Textarea(attrs={"rows": 2, "placeholder": "Optional notes"}),
        }

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        if user and not user.is_admin_user:
            self.fields.pop("artist")
        else:
            self.fields["artist"].queryset = Artist.objects.select_related("user")


class SessionBlockForm(forms.ModelForm):
    class Meta:
        model = SessionBlock
        fields = ["artist", "service", "date", "start_time", "end_time", "deposit_required", "notes"]
        widgets = {
            "date": forms.DateInput(attrs={"type": "date"}),
            "start_time": forms.TimeInput(attrs={"type": "time"}),
            "end_time": forms.TimeInput(attrs={"type": "time"}),
            "notes": forms.Textarea(attrs={"rows": 2, "placeholder": "Optional notes"}),
        }

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["service"].queryset = Service.objects.filter(is_active=True)
        self.fields["service"].required = False
        if user and not user.is_admin_user:
            self.fields.pop("artist")
        else:
            self.fields["artist"].queryset = Artist.objects.select_related("user")


class ServiceForm(forms.ModelForm):
    class Meta:
        model = Service
        fields = [
            "name", "category", "description", "base_price",
            "min_duration_minutes", "max_duration_minutes", "is_active",
        ]
        widgets = {"description": forms.Textarea(attrs={"rows": 2})}
