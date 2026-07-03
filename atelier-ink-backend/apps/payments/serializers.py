from rest_framework import serializers
from .models import PaystackTransaction


class PaystackTransactionSerializer(serializers.ModelSerializer):
    amount_naira = serializers.ReadOnlyField()

    class Meta:
        model = PaystackTransaction
        fields = [
            "id", "booking", "reference", "amount_kobo", "amount_naira",
            "status", "channel", "currency", "paid_at", "created_at",
        ]
        read_only_fields = fields
