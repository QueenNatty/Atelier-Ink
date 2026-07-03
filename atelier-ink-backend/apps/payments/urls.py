from django.urls import path
from .views import initiate_payment, verify_payment, paystack_webhook, my_transactions

urlpatterns = [
    path("initiate/", initiate_payment, name="payment-initiate"),
    path("verify/", verify_payment, name="payment-verify"),
    path("webhook/", paystack_webhook, name="payment-webhook"),
    path("my-transactions/", my_transactions, name="my-transactions"),
]
