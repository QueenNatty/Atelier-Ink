import hashlib
import hmac
import json

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.bookings.models import Booking
from .models import PaystackTransaction
from .paystack import initialize_transaction, verify_transaction, generate_reference
from .serializers import PaystackTransactionSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """
    Client calls this to start a deposit payment for a booking.
    Returns a Paystack authorization_url to redirect to.

    POST body: { "booking_id": 5 }
    """
    booking_id = request.data.get("booking_id")
    if not booking_id:
        return Response({"detail": "booking_id is required."}, status=400)

    try:
        booking = Booking.objects.get(id=booking_id, client=request.user)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=404)

    if booking.deposit_paid:
        return Response({"detail": "Deposit already paid for this booking."}, status=400)

    deposit_naira = float(booking.deposit_amount)
    if deposit_naira <= 0:
        return Response({"detail": "No deposit required for this booking."}, status=400)

    # Paystack uses kobo — multiply by 100
    amount_kobo = int(deposit_naira * 100)
    reference = generate_reference()

    try:
        result = initialize_transaction(
            email=request.user.email,
            amount_kobo=amount_kobo,
            reference=reference,
            metadata={
                "booking_id": booking.id,
                "user_id": request.user.id,
                "booking_type": booking.booking_type,
            },
        )
    except Exception as e:
        return Response({"detail": f"Payment gateway error: {str(e)}"}, status=502)

    # Save the pending transaction
    PaystackTransaction.objects.create(
        user=request.user,
        booking=booking,
        reference=reference,
        amount_kobo=amount_kobo,
        status=PaystackTransaction.Status.PENDING,
    )

    return Response({
        "authorization_url": result["data"]["authorization_url"],
        "reference": reference,
        "amount_naira": deposit_naira,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    After redirect back from Paystack, client sends the reference
    and we verify with Paystack's API.

    POST body: { "reference": "ATL-XXXXXXXXXXXX" }
    """
    reference = request.data.get("reference")
    if not reference:
        return Response({"detail": "reference is required."}, status=400)

    try:
        txn = PaystackTransaction.objects.get(reference=reference, user=request.user)
    except PaystackTransaction.DoesNotExist:
        return Response({"detail": "Transaction not found."}, status=404)

    if txn.status == PaystackTransaction.Status.SUCCESS:
        return Response({"detail": "Already verified.", "status": "success"})

    try:
        result = verify_transaction(reference)
    except Exception as e:
        return Response({"detail": f"Verification error: {str(e)}"}, status=502)

    data = result.get("data", {})
    paystack_status = data.get("status")

    if paystack_status == "success":
        txn.status = PaystackTransaction.Status.SUCCESS
        txn.paystack_id = str(data.get("id", ""))
        txn.channel = data.get("channel", "")
        txn.paid_at = timezone.now()
        txn.save()

        # Mark the booking deposit as paid
        booking = txn.booking
        booking.deposit_paid = True
        booking.status = Booking.Status.DEPOSIT_PAID
        booking.save(update_fields=["deposit_paid", "status", "updated_at"])

        return Response({
            "status": "success",
            "message": "Deposit payment confirmed!",
            "booking_id": booking.id,
            "amount_naira": txn.amount_naira,
        })

    # Not successful
    txn.status = PaystackTransaction.Status.FAILED
    txn.save(update_fields=["status"])
    return Response({"status": paystack_status, "detail": "Payment was not successful."}, status=400)


@csrf_exempt
def paystack_webhook(request):
    """
    Paystack sends POST events here (e.g. charge.success).
    We verify the signature then update our records.
    Set this URL in your Paystack dashboard under Settings > Webhooks.
    """
    if request.method != "POST":
        return HttpResponse(status=405)

    # Verify signature
    sig = request.headers.get("x-paystack-signature", "")
    secret = settings.PAYSTACK_SECRET_KEY.encode()
    computed = hmac.new(secret, request.body, hashlib.sha512).hexdigest()

    if not hmac.compare_digest(computed, sig):
        return HttpResponse("Invalid signature", status=400)

    try:
        event = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponse("Bad JSON", status=400)

    if event.get("event") == "charge.success":
        data = event["data"]
        reference = data.get("reference")
        try:
            txn = PaystackTransaction.objects.get(reference=reference)
            if txn.status != PaystackTransaction.Status.SUCCESS:
                txn.status = PaystackTransaction.Status.SUCCESS
                txn.paystack_id = str(data.get("id", ""))
                txn.channel = data.get("channel", "")
                txn.paid_at = timezone.now()
                txn.save()

                booking = txn.booking
                booking.deposit_paid = True
                booking.status = Booking.Status.DEPOSIT_PAID
                booking.save(update_fields=["deposit_paid", "status", "updated_at"])
        except PaystackTransaction.DoesNotExist:
            pass  # Unknown reference — ignore

    return HttpResponse(status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    """List the current user's payment history."""
    txns = PaystackTransaction.objects.filter(user=request.user)
    return Response(PaystackTransactionSerializer(txns, many=True).data)
