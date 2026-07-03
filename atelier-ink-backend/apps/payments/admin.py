from django.contrib import admin
from .models import PaystackTransaction


@admin.register(PaystackTransaction)
class PaystackTransactionAdmin(admin.ModelAdmin):
    list_display = ["reference", "user", "amount_naira", "status", "channel", "paid_at", "created_at"]
    list_filter = ["status", "channel", "currency"]
    search_fields = ["reference", "user__email"]
    readonly_fields = ["reference", "amount_kobo", "paystack_id", "channel", "paid_at", "created_at"]

    def has_add_permission(self, request):
        return False
