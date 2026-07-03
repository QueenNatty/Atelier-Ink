"""
Paystack integration service.
Docs: https://paystack.com/docs/api/

Test cards (no real money):
  Card:  4084084084084081  Exp: any future  CVV: 408
  Bank:  Use test bank accounts in Paystack dashboard
"""
import uuid
import requests
from django.conf import settings


PAYSTACK_BASE = "https://api.paystack.co"


def _headers():
    return {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def initialize_transaction(email: str, amount_kobo: int, reference: str, metadata: dict = None):
    """
    Initialise a Paystack transaction.
    Returns the authorization_url to redirect the user to.
    amount_kobo: amount in kobo (multiply Naira by 100)
    """
    payload = {
        "email": email,
        "amount": amount_kobo,
        "reference": reference,
        "currency": "NGN",
        "callback_url": settings.PAYSTACK_CALLBACK_URL,
        "metadata": metadata or {},
    }
    response = requests.post(
        f"{PAYSTACK_BASE}/transaction/initialize",
        json=payload,
        headers=_headers(),
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def verify_transaction(reference: str):
    """
    Verify a transaction by reference.
    Call this from the webhook or after redirect callback.
    """
    response = requests.get(
        f"{PAYSTACK_BASE}/transaction/verify/{reference}",
        headers=_headers(),
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def generate_reference():
    """Generate a unique transaction reference."""
    return f"ATL-{uuid.uuid4().hex[:12].upper()}"
