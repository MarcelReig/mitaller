"""
Views para la gestión de pagos con Stripe Connect.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
import stripe
from django.conf import settings
import logging

from .models import Payment, PaymentStatus
from .serializers import PaymentSerializer, CheckoutSessionSerializer
from orders.models import OrderStatus


# Configurar API key de Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Logger para debugging
logger = logging.getLogger(__name__)


class IsArtist(permissions.BasePermission):
    """
    Permiso custom para verificar que el usuario es artesano.
    
    Verifica que el usuario autenticado tiene un artist_profile asociado.
    """
    
    def has_permission(self, request, view):
        """Verifica si el usuario es artesano."""
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'artist_profile')
        )


class StripeConnectViewSet(viewsets.ViewSet):
    """
    ViewSet para gestionar el onboarding de Stripe Connect.
    
    Permite a los artesanos:
    - Iniciar el proceso de onboarding en Stripe
    - Refrescar el link de onboarding si expiró
    - Verificar el estado de su cuenta Stripe
    
    Endpoints:
    - POST /api/v1/payments/stripe-connect/start-onboarding/ - Inicia onboarding
    - POST /api/v1/payments/stripe-connect/refresh-onboarding/ - Refresca link
    - GET /api/v1/payments/stripe-connect/account-status/ - Verifica estado
    """
    
    permission_classes = [permissions.IsAuthenticated, IsArtist]
    
    @action(detail=False, methods=['post'], url_path='start-onboarding')
    def onboarding(self, request):
        """
        Inicia el proceso de onboarding de Stripe Connect.
        
        Flow:
        1. Verificar que el artesano no haya completado onboarding
        2. Crear cuenta Express en Stripe (o usar existente)
        3. Crear AccountLink para onboarding
        4. Retornar URL de onboarding
        
        Body params:
            refresh_url (str): URL donde redirigir si el link expira
            success_url (str): URL donde redirigir tras completar onboarding
            
        Returns:
            200: {'onboarding_url': 'https://connect.stripe.com/...'}
            400: Si ya completó onboarding o faltan parámetros
        """
        artist = request.user.artist_profile
        
        # Verificar si ya completó onboarding
        if artist.stripe_onboarding_completed and artist.can_receive_payments:
            return Response(
                {'error': 'Ya has completado el proceso de verificación en Stripe.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener URLs de redirección
        refresh_url = request.data.get('refresh_url')
        success_url = request.data.get('success_url')
        
        if not refresh_url or not success_url:
            return Response(
                {'error': 'Se requieren refresh_url y success_url.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Crear cuenta Express si no existe
            if not artist.stripe_account_id:
                account = stripe.Account.create(
                    type='express',
                    country='ES',
                    email=request.user.email,
                    capabilities={
                        'card_payments': {'requested': True},
                        'transfers': {'requested': True},
                    },
                )
                
                artist.stripe_account_id = account.id
                artist.save()
                
                logger.info(f"Created Stripe account {account.id} for artist {artist.id}")
            
            # Crear AccountLink para onboarding
            account_link = stripe.AccountLink.create(
                account=artist.stripe_account_id,
                refresh_url=refresh_url,
                return_url=success_url,
                type='account_onboarding',
            )
            
            # Guardar URL de onboarding (temporal, expira en pocas horas)
            artist.stripe_onboarding_url = account_link.url
            artist.save()
            
            logger.info(f"Created onboarding link for artist {artist.id}")
            
            return Response({
                'onboarding_url': account_link.url,
            })
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error during onboarding: {str(e)}")
            return Response(
                {'error': f'Error al crear cuenta en Stripe: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='refresh-onboarding')
    def refresh_onboarding(self, request):
        """
        Refresca el link de onboarding si expiró.
        
        Body params:
            refresh_url (str): URL donde redirigir si el link expira
            return_url (str): URL donde redirigir tras completar
            
        Returns:
            200: {'onboarding_url': 'https://connect.stripe.com/...'}
            400: Si no tiene cuenta Stripe
        """
        artist = request.user.artist_profile
        
        if not artist.stripe_account_id:
            return Response(
                {'error': 'No tienes una cuenta de Stripe. Inicia el proceso primero.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        refresh_url = request.data.get('refresh_url')
        return_url = request.data.get('return_url')
        
        if not refresh_url or not return_url:
            return Response(
                {'error': 'Se requieren refresh_url y return_url.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Crear nuevo AccountLink
            account_link = stripe.AccountLink.create(
                account=artist.stripe_account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type='account_onboarding',
            )
            
            artist.stripe_onboarding_url = account_link.url
            artist.save()
            
            logger.info(f"Refreshed onboarding link for artist {artist.id}")
            
            return Response({
                'onboarding_url': account_link.url,
            })
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error refreshing onboarding: {str(e)}")
            return Response(
                {'error': f'Error al refrescar link: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='account-status')
    def account_status(self, request):
        """
        Verifica el estado de la cuenta Stripe del artesano.
        
        Consulta Stripe para obtener el estado actual y actualiza
        los campos en ArtistProfile.
        
        Returns:
            200: {
                'status': 'active',
                'charges_enabled': True,
                'payouts_enabled': True,
                'details_submitted': True
            }
        """
        artist = request.user.artist_profile
        
        if not artist.stripe_account_id:
            return Response({
                'status': 'pending',
                'charges_enabled': False,
                'payouts_enabled': False,
                'details_submitted': False,
            })
        
        try:
            # Obtener estado actual desde Stripe
            account = stripe.Account.retrieve(artist.stripe_account_id)
            
            # Actualizar campos en ArtistProfile
            artist.stripe_charges_enabled = account.charges_enabled
            artist.stripe_payouts_enabled = account.payouts_enabled
            
            # Actualizar estado según capabilities
            if account.charges_enabled and account.payouts_enabled:
                artist.stripe_account_status = 'active'
                artist.stripe_onboarding_completed = True
            elif account.details_submitted:
                # Submitted pero aún no activo (en revisión)
                artist.stripe_account_status = 'pending'
            else:
                artist.stripe_account_status = 'pending'
            
            artist.save()
            
            logger.info(f"Updated account status for artist {artist.id}")
            
            return Response({
                'status': artist.stripe_account_status,
                'charges_enabled': artist.stripe_charges_enabled,
                'payouts_enabled': artist.stripe_payouts_enabled,
                'details_submitted': account.details_submitted,
            })
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error checking account status: {str(e)}")
            return Response(
                {'error': f'Error al verificar estado: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver pagos.
    
    - Artesanos ven solo sus propios pagos
    - Admins ven todos los pagos
    - Otros usuarios no ven nada
    
    Endpoints:
    - GET /api/v1/payments/payments/ - Lista pagos (filtrados por usuario)
    - GET /api/v1/payments/payments/:id/ - Detalle de pago
    - POST /api/v1/payments/payments/create-checkout-session/ - Crear sesión checkout
    """
    
    queryset = Payment.objects.select_related('order', 'artist').all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['artist', 'status']
    
    def get_queryset(self):
        """
        Filtra pagos según el usuario.
        
        - Artesanos ven solo sus pagos
        - Admins ven todos
        - Otros usuarios ven lista vacía
        """
        user = self.request.user
        
        if user.is_staff or user.is_superuser:
            return self.queryset
        
        if hasattr(user, 'artist_profile'):
            return self.queryset.filter(artist=user.artist_profile)
        
        # Otros usuarios no ven nada
        return Payment.objects.none()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def create_checkout_session(self, request):
        """
        Crea una sesión de checkout para un pedido.
        
        Este endpoint es público (AllowAny) porque los compradores
        son invitados sin cuenta.
        
        Body params:
            order_id (int): ID del pedido a pagar
            
        Returns:
            201: {
                'payment_intent_id': 'pi_xxx',
                'client_secret': 'pi_xxx_secret_xxx',
                'public_key': 'pk_test_xxx',
                'payment_id': 123
            }
            400: Si el pedido no es válido
        """
        serializer = CheckoutSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        logger.info(f"Created checkout session for order {request.data.get('order_id')}")
        
        return Response(result, status=status.HTTP_201_CREATED)


class StripeWebhookView(APIView):
    """
    Endpoint para recibir webhooks de Stripe.
    
    Stripe envía eventos cuando ocurren acciones importantes:
    - payment_intent.succeeded: Pago completado
    - payment_intent.payment_failed: Pago fallido
    - charge.refunded: Pago reembolsado
    
    IMPORTANTE: Verifica la firma del webhook para seguridad.
    Los webhooks son la única fuente de verdad confiable para
    estados de pago (no confiar en confirmaciones del frontend).
    
    Endpoint:
    - POST /api/v1/payments/webhook/stripe/
    """
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Procesa eventos de webhooks de Stripe.
        
        Flow:
        1. Obtener payload y signature
        2. Verificar firma con webhook secret
        3. Procesar evento según tipo
        4. Actualizar Payment y Order
        5. Retornar 200 (Stripe reintenta si falla)
        """
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        if not sig_header:
            logger.warning("Webhook received without signature")
            return Response(
                {'error': 'Missing signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verificar firma del webhook
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
            
            logger.info(f"Webhook received: {event['type']}")
            
        except ValueError as e:
            # Payload inválido
            logger.error(f"Invalid payload: {str(e)}")
            return Response(
                {'error': 'Invalid payload'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.SignatureVerificationError as e:
            # Firma inválida
            logger.error(f"Invalid signature: {str(e)}")
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Procesar evento según tipo
        event_type = event['type']
        event_data = event['data']['object']
        
        if event_type == 'payment_intent.succeeded':
            self._handle_payment_succeeded(event_data)
            
        elif event_type == 'payment_intent.payment_failed':
            self._handle_payment_failed(event_data)
        
        # Retornar 200 para confirmar recepción
        return Response({'status': 'received'}, status=status.HTTP_200_OK)
    
    def _handle_payment_succeeded(self, payment_intent):
        """
        Maneja el evento de pago exitoso.
        
        Actualiza:
        - Payment.status = SUCCEEDED
        - Payment.paid_at = now
        - Payment.stripe_charge_id = charge_id
        - Order.payment_status = SUCCEEDED
        - Order.status = PROCESSING (si estaba PENDING)
        """
        payment_intent_id = payment_intent['id']
        
        try:
            payment = Payment.objects.select_related('order').get(
                stripe_payment_intent_id=payment_intent_id
            )
            
            # Actualizar Payment
            payment.status = PaymentStatus.SUCCEEDED
            payment.paid_at = timezone.now()
            
            # Guardar charge_id si existe
            if payment_intent.get('charges') and payment_intent['charges']['data']:
                payment.stripe_charge_id = payment_intent['charges']['data'][0]['id']
                
                # Guardar transfer_id si existe
                charge = payment_intent['charges']['data'][0]
                if charge.get('transfer'):
                    payment.stripe_transfer_id = charge['transfer']
            
            payment.save()
            
            # Actualizar Order
            order = payment.order
            order.payment_status = PaymentStatus.SUCCEEDED
            
            # Si estaba pendiente, cambiar a procesando
            if order.status == OrderStatus.PENDING:
                order.status = OrderStatus.PROCESSING
            
            order.save()
            
            logger.info(
                f"Payment {payment.id} succeeded for order {order.order_number}"
            )
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for PaymentIntent {payment_intent_id}")
    
    def _handle_payment_failed(self, payment_intent):
        """
        Maneja el evento de pago fallido.
        
        Actualiza:
        - Payment.status = FAILED
        - Payment.failure_message = reason
        - Order.payment_status = FAILED
        """
        payment_intent_id = payment_intent['id']
        
        try:
            payment = Payment.objects.select_related('order').get(
                stripe_payment_intent_id=payment_intent_id
            )
            
            # Actualizar Payment
            payment.status = PaymentStatus.FAILED
            
            # Extraer mensaje de error
            if payment_intent.get('last_payment_error'):
                payment.failure_message = payment_intent['last_payment_error'].get(
                    'message', 'Unknown error'
                )
            
            payment.save()
            
            # Actualizar Order
            order = payment.order
            order.payment_status = PaymentStatus.FAILED
            order.save()
            
            logger.warning(
                f"Payment {payment.id} failed for order {order.order_number}: "
                f"{payment.failure_message}"
            )
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for PaymentIntent {payment_intent_id}")

