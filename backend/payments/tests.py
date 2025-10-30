"""
Tests para la app Payments.

Cubre:
- Onboarding de Stripe Connect para artesanos
- Creación de sesiones de checkout
- Procesamiento de webhooks de Stripe
- Actualización de estados de pagos y pedidos
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from unittest.mock import patch, MagicMock
import json

from accounts.models import User
from artisans.models import ArtisanProfile
from shop.models import Product
from orders.models import Order, OrderItem, OrderStatus
from .models import Payment, PaymentStatus, StripeAccountStatus


class StripeConnectOnboardingTests(TestCase):
    """
    Tests para el proceso de onboarding de Stripe Connect.
    """
    
    def setUp(self):
        """Configuración inicial para los tests."""
        # Crear usuario artesano
        self.user = User.objects.create_user(
            username='testartist',
            email='artist@test.com',
            password='testpass123',
            role='artisan'
        )
        
        # Obtener el perfil creado automáticamente por el signal
        self.artist = self.user.artisan_profile
        # Actualizar campos necesarios para tests
        self.artist.display_name = 'Test Artist'
        self.artist.craft_type = 'ceramics'
        self.artist.location = 'mao'
        self.artist.save()
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    @patch('stripe.Account.create')
    @patch('stripe.AccountLink.create')
    def test_start_onboarding_creates_stripe_account(self, mock_link, mock_account):
        """Test que el onboarding crea una cuenta de Stripe."""
        # Mock de respuestas de Stripe
        mock_account.return_value = MagicMock(id='acct_test123')
        mock_link.return_value = MagicMock(url='https://connect.stripe.com/setup/xxx')
        
        url = reverse('stripe-connect-onboarding')
        data = {
            'refresh_url': 'http://localhost:3000/onboarding/refresh',
            'success_url': 'http://localhost:3000/onboarding/success',
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('onboarding_url', response.data)
        
        # Verificar que se guardó el stripe_account_id
        self.artist.refresh_from_db()
        self.assertEqual(self.artist.stripe_account_id, 'acct_test123')
        
        # Verificar que se llamó a Stripe con los parámetros correctos
        mock_account.assert_called_once()
        call_kwargs = mock_account.call_args[1]
        self.assertEqual(call_kwargs['type'], 'express')
        self.assertEqual(call_kwargs['country'], 'ES')
        self.assertEqual(call_kwargs['email'], 'artist@test.com')
    
    def test_start_onboarding_requires_urls(self):
        """Test que el onboarding requiere refresh_url y success_url."""
        url = reverse('stripe-connect-onboarding')
        response = self.client.post(url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_onboarding_requires_artist(self):
        """Test que solo artesanos pueden hacer onboarding."""
        # Crear usuario normal (no artesano)
        normal_user = User.objects.create_user(
            username='normaluser',
            email='normal@test.com',
            password='testpass123',
            role='customer'
        )
        
        self.client.force_authenticate(user=normal_user)
        url = reverse('stripe-connect-onboarding')
        
        data = {
            'refresh_url': 'http://localhost:3000/onboarding/refresh',
            'success_url': 'http://localhost:3000/onboarding/success',
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    @patch('stripe.Account.retrieve')
    def test_account_status_updates_fields(self, mock_retrieve):
        """Test que account_status actualiza los campos del artesano."""
        # Configurar artesano con cuenta Stripe
        self.artist.stripe_account_id = 'acct_test123'
        self.artist.save()
        
        # Mock de respuesta de Stripe
        mock_account = MagicMock()
        mock_account.charges_enabled = True
        mock_account.payouts_enabled = True
        mock_account.details_submitted = True
        mock_retrieve.return_value = mock_account
        
        url = reverse('stripe-connect-account-status')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'active')
        self.assertTrue(response.data['charges_enabled'])
        self.assertTrue(response.data['payouts_enabled'])
        
        # Verificar que se actualizaron los campos
        self.artist.refresh_from_db()
        self.assertTrue(self.artist.stripe_charges_enabled)
        self.assertTrue(self.artist.stripe_payouts_enabled)
        self.assertTrue(self.artist.stripe_onboarding_completed)
        self.assertEqual(self.artist.stripe_account_status, StripeAccountStatus.ACTIVE)


class CheckoutSessionTests(TestCase):
    """
    Tests para la creación de sesiones de checkout.
    """
    
    def setUp(self):
        """Configuración inicial para los tests."""
        # Crear artesano con Stripe configurado
        self.user = User.objects.create_user(
            username='artisan',
            email='artist@test.com',
            password='test123',
            role='artisan'
        )
        
        # Obtener el perfil creado automáticamente por el signal
        self.artist = self.user.artisan_profile
        # Configurar para tests
        self.artist.display_name = 'Test Artist'
        self.artist.craft_type = 'ceramics'
        self.artist.location = 'mao'
        self.artist.stripe_account_id = 'acct_test123'
        self.artist.stripe_account_status = StripeAccountStatus.ACTIVE
        self.artist.stripe_charges_enabled = True
        self.artist.stripe_payouts_enabled = True
        self.artist.stripe_onboarding_completed = True
        self.artist.save()
        
        # Crear producto
        self.product = Product.objects.create(
            artisan=self.user,
            name='Test Product',
            description='Test description',
            price=Decimal('50.00'),
            stock=10,
        )
        
        # Crear orden
        self.order = Order.objects.create(
            customer_email='customer@test.com',
            customer_name='Test Customer',
            shipping_address='Test Street 123',
            shipping_city='Maó',
            shipping_postal_code='07700',
            total_amount=Decimal('50.00'),
        )
        
        # Crear item de orden
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            artisan=self.user,
            product_name=self.product.name,
            product_price=self.product.price,
            quantity=1,
            subtotal=Decimal('50.00'),
        )
        
        self.client = APIClient()
    
    @patch('stripe.PaymentIntent.create')
    def test_create_checkout_session_success(self, mock_create):
        """Test creación exitosa de sesión de checkout."""
        # Mock de PaymentIntent
        mock_intent = MagicMock()
        mock_intent.id = 'pi_test123'
        mock_intent.client_secret = 'pi_test123_secret_xxx'
        mock_create.return_value = mock_intent
        
        url = reverse('payment-create-checkout-session')
        data = {'order_id': self.order.id}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('payment_intent_id', response.data)
        self.assertIn('client_secret', response.data)
        self.assertIn('public_key', response.data)
        
        # Verificar que se creó el Payment
        payment = Payment.objects.get(order=self.order)
        self.assertEqual(payment.amount, Decimal('50.00'))
        self.assertEqual(payment.artisan, self.user)
        self.assertEqual(payment.status, PaymentStatus.PENDING)
        
        # Verificar cálculo de comisiones (10% default)
        self.assertEqual(payment.marketplace_fee, Decimal('5.00'))
        self.assertEqual(payment.artisan_amount, Decimal('45.00'))
    
    def test_create_checkout_requires_order_with_items(self):
        """Test que requiere un pedido con items."""
        # Crear orden sin items
        empty_order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Test',
            shipping_postal_code='12345',
        )
        
        url = reverse('payment-create-checkout-session')
        data = {'order_id': empty_order.id}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_checkout_requires_artist_with_stripe(self):
        """Test que el artesano debe tener Stripe configurado."""
        # Crear artesano sin Stripe
        user2 = User.objects.create_user(
            username='artist2',
            email='artist2@test.com',
            password='test123',
            role='artisan'
        )
        
        # Obtener el perfil creado automáticamente por el signal
        artist2 = user2.artisan_profile
        artist2.display_name = 'Artist 2'
        artist2.craft_type = 'ceramics'
        artist2.location = 'mao'
        artist2.save()
        
        product2 = Product.objects.create(
            artisan=user2,
            name='Product 2',
            price=Decimal('30.00'),
            stock=5,
        )
        
        order2 = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Test',
            shipping_postal_code='12345',
            total_amount=Decimal('30.00'),
        )
        
        OrderItem.objects.create(
            order=order2,
            product=product2,
            artisan=user2,
            product_name=product2.name,
            product_price=product2.price,
            quantity=1,
            subtotal=Decimal('30.00'),
        )
        
        url = reverse('payment-create-checkout-session')
        data = {'order_id': order2.id}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class StripeWebhookTests(TestCase):
    """
    Tests para el procesamiento de webhooks de Stripe.
    """
    
    def setUp(self):
        """Configuración inicial para los tests."""
        # Crear datos de prueba
        self.user = User.objects.create_user(
            username='artisan',
            email='artist@test.com',
            password='test123',
            role='artisan'
        )
        
        # Obtener el perfil creado automáticamente por el signal
        self.artist = self.user.artisan_profile
        self.artist.display_name = 'Test Artist'
        self.artist.craft_type = 'ceramics'
        self.artist.location = 'mao'
        self.artist.stripe_account_id = 'acct_test123'
        self.artist.save()
        
        self.order = Order.objects.create(
            customer_email='customer@test.com',
            customer_name='Test Customer',
            shipping_address='Test Street',
            shipping_city='Maó',
            shipping_postal_code='07700',
            total_amount=Decimal('100.00'),
        )
        
        self.payment = Payment.objects.create(
            order=self.order,
            artisan=self.user,
            amount=Decimal('100.00'),
            marketplace_fee=Decimal('10.00'),
            artisan_amount=Decimal('90.00'),
            stripe_payment_intent_id='pi_test123',
        )
        
        self.client = APIClient()
    
    @patch('stripe.Webhook.construct_event')
    def test_webhook_payment_succeeded(self, mock_construct):
        """Test procesamiento de webhook payment_intent.succeeded."""
        # Mock del evento
        mock_event = {
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': 'pi_test123',
                    'charges': {
                        'data': [
                            {
                                'id': 'ch_test123',
                                'transfer': 'tr_test123',
                            }
                        ]
                    }
                }
            }
        }
        mock_construct.return_value = mock_event
        
        url = reverse('stripe-webhook')
        response = self.client.post(
            url,
            data={},
            HTTP_STRIPE_SIGNATURE='test_signature',
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que se actualizó el Payment
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.SUCCEEDED)
        self.assertIsNotNone(self.payment.paid_at)
        self.assertEqual(self.payment.stripe_charge_id, 'ch_test123')
        self.assertEqual(self.payment.stripe_transfer_id, 'tr_test123')
        
        # Verificar que se actualizó el Order
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, PaymentStatus.SUCCEEDED)
        self.assertEqual(self.order.status, OrderStatus.PROCESSING)
    
    @patch('stripe.Webhook.construct_event')
    def test_webhook_payment_failed(self, mock_construct):
        """Test procesamiento de webhook payment_intent.payment_failed."""
        # Mock del evento
        mock_event = {
            'type': 'payment_intent.payment_failed',
            'data': {
                'object': {
                    'id': 'pi_test123',
                    'last_payment_error': {
                        'message': 'Card declined'
                    }
                }
            }
        }
        mock_construct.return_value = mock_event
        
        url = reverse('stripe-webhook')
        response = self.client.post(
            url,
            data={},
            HTTP_STRIPE_SIGNATURE='test_signature',
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que se actualizó el Payment
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.FAILED)
        self.assertEqual(self.payment.failure_message, 'Card declined')
        
        # Verificar que se actualizó el Order
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, PaymentStatus.FAILED)
    
    def test_webhook_requires_signature(self):
        """Test que el webhook requiere firma válida."""
        url = reverse('stripe-webhook')
        response = self.client.post(url, data={})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class PaymentModelTests(TestCase):
    """
    Tests para el modelo Payment.
    """
    
    def setUp(self):
        """Configuración inicial."""
        self.user = User.objects.create_user(
            username='artisan',
            email='artist@test.com',
            password='test123',
            role='artisan'
        )

        # Obtener el perfil creado automáticamente por el signal
        self.artist = self.user.artisan_profile
        self.artist.display_name = 'Test Artist'
        self.artist.craft_type = 'ceramics'
        self.artist.location = 'mao'
        self.artist.save()
        
        self.order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Test',
            shipping_postal_code='12345',
            total_amount=Decimal('100.00'),
        )
    
    def test_calculate_fees_default(self):
        """Test cálculo de comisiones con porcentaje default (10%)."""
        payment = Payment(
            order=self.order,
            artisan=self.user,
            amount=Decimal('100.00'),
        )
        
        payment.calculate_fees()
        
        self.assertEqual(payment.marketplace_fee, Decimal('10.00'))
        self.assertEqual(payment.artisan_amount, Decimal('90.00'))
    
    def test_calculate_fees_custom(self):
        """Test cálculo de comisiones con porcentaje custom."""
        payment = Payment(
            order=self.order,
            artisan=self.user,
            amount=Decimal('100.00'),
        )
        
        payment.calculate_fees(marketplace_fee_percent=Decimal('15.0'))
        
        self.assertEqual(payment.marketplace_fee, Decimal('15.00'))
        self.assertEqual(payment.artisan_amount, Decimal('85.00'))
    
    def test_formatted_properties(self):
        """Test properties formateadas."""
        payment = Payment.objects.create(
            order=self.order,
            artisan=self.user,
            amount=Decimal('100.00'),
            marketplace_fee=Decimal('10.00'),
            artisan_amount=Decimal('90.00'),
        )
        
        self.assertEqual(payment.formatted_amount, '100.00 EUR')
        self.assertEqual(payment.formatted_marketplace_fee, '10.00 EUR')
        self.assertEqual(payment.formatted_artisan_amount, '90.00 EUR')

