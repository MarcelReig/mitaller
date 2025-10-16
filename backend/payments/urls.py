"""
URLs para la app payments.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StripeConnectViewSet, PaymentViewSet, StripeWebhookView


# Router para ViewSets
router = DefaultRouter()
router.register(r'stripe-connect', StripeConnectViewSet, basename='stripe-connect')
router.register(r'payments', PaymentViewSet, basename='payment')

# URLs
urlpatterns = [
    # Webhook de Stripe (debe estar antes del router)
    path('webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    
    # Rutas del router
    path('', include(router.urls)),
]

