"""
Tests completos para Orders app.

Cubre:
- Creación de pedidos (compras invitadas)
- Validaciones de stock y disponibilidad
- Reducción automática de stock
- Queries filtradas por artesano
- Signals de cancelación y restauración de stock
- Permisos según roles
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from accounts.models import UserRole
from artisans.models import ArtisanProfile, CraftType, MenorcaLocation
from shop.models import Product, ProductCategory
from .models import Order, OrderItem, OrderStatus

User = get_user_model()


class OrderModelTests(TestCase):
    """Tests para los modelos Order y OrderItem."""
    
    def setUp(self):
        """Configurar datos de prueba."""
        # Create artisan (signal creates ArtisanProfile automatically)
        self.artist_user = User.objects.create_user(
            email='artesano@mitaller.art',
            username='artesano',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        # El signal create_artisan_profile ya creó el perfil, solo lo obtenemos y configuramos
        self.artisan_profile = self.artist_user.artisan_profile
        self.artisan_profile.display_name = 'Taller Test'
        self.artisan_profile.craft_type = CraftType.CERAMICS
        self.artisan_profile.location = MenorcaLocation.CIUTADELLA
        self.artisan_profile.save()
        
        # Crear productos
        self.product1 = Product.objects.create(
            artisan=self.artist_user,
            name='Cerámica Azul',
            description='Pieza única',
            price=Decimal('50.00'),
            stock=10,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
        self.product2 = Product.objects.create(
            artisan=self.artist_user,
            name='Cerámica Verde',
            description='Pieza única',
            price=Decimal('30.00'),
            stock=5,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
    
    def test_order_number_generation(self):
        """Order number se genera automáticamente en formato correcto."""
        order = Order.objects.create(
            customer_email='comprador@test.com',
            customer_name='Test Comprador',
            shipping_address='Calle Test 123',
            shipping_city='Maó',
            shipping_postal_code='07701'
        )
        
        # Verificar formato ORD-YYYYMMDD-XXXXXX
        self.assertTrue(order.order_number.startswith('ORD-'))
        self.assertEqual(len(order.order_number), 19)  # ORD-20251012-AB12CD
    
    def test_order_str_representation(self):
        """__str__ retorna formato legible."""
        order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Juan Pérez',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701'
        )
        
        expected = f'Pedido {order.order_number} - Juan Pérez'
        self.assertEqual(str(order), expected)
    
    def test_order_formatted_total(self):
        """Property formatted_total retorna string correcto."""
        order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701',
            total_amount=Decimal('150.50')
        )
        
        self.assertEqual(order.formatted_total, '150.50 EUR')
    
    def test_orderitem_subtotal_calculation(self):
        """OrderItem calcula subtotal automáticamente."""
        order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701'
        )
        
        item = OrderItem.objects.create(
            order=order,
            product=self.product1,
            artisan=self.artist_user,
            product_name='Test Product',
            product_price=Decimal('25.00'),
            quantity=3
        )
        
        # Subtotal debe ser precio * cantidad
        expected_subtotal = Decimal('25.00') * 3
        self.assertEqual(item.subtotal, expected_subtotal)
    
    def test_orderitem_str_representation(self):
        """__str__ retorna formato legible."""
        order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701'
        )
        
        item = OrderItem.objects.create(
            order=order,
            product=self.product1,
            artisan=self.artist_user,
            product_name='Cerámica Test',
            product_price=Decimal('50.00'),
            quantity=2
        )
        
        expected = f'2x Cerámica Test (Pedido {order.order_number})'
        self.assertEqual(str(item), expected)


class OrderCreationTests(TestCase):
    """Tests para creación de pedidos via API."""
    
    def setUp(self):
        """Configurar datos de prueba y cliente API."""
        self.client = APIClient()
        
        # Create artisan with products (signal creates ArtisanProfile)
        self.artist_user = User.objects.create_user(
            email='artesano@mitaller.art',
            username='artesano',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        self.artisan_profile = self.artist_user.artisan_profile
        self.artisan_profile.display_name = 'Taller Test'
        self.artisan_profile.craft_type = CraftType.CERAMICS
        self.artisan_profile.location = MenorcaLocation.CIUTADELLA
        self.artisan_profile.save()
        
        self.product1 = Product.objects.create(
            artisan=self.artist_user,
            name='Cerámica Azul',
            description='Pieza única',
            price=Decimal('50.00'),
            stock=10,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
        self.product2 = Product.objects.create(
            artisan=self.artist_user,
            name='Cerámica Verde',
            description='Pieza única',
            price=Decimal('30.00'),
            stock=5,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test2.jpg',
            is_active=True
        )
    
    def test_create_order_as_guest(self):
        """Compradores invitados pueden crear pedidos sin autenticación."""
        order_data = {
            'customer_email': 'comprador@test.com',
            'customer_name': 'Juan Comprador',
            'customer_phone': '+34600000000',
            'shipping_address': 'Calle Test 123, 1º A',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'shipping_country': 'España',
            'items': [
                {
                    'product': self.product1.id,
                    'quantity': 2
                },
                {
                    'product': self.product2.id,
                    'quantity': 1
                }
            ],
            'notes': 'Por favor tocar el timbre'
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar datos del pedido
        order = Order.objects.get(customer_email='comprador@test.com')
        self.assertEqual(order.customer_name, 'Juan Comprador')
        self.assertEqual(order.status, OrderStatus.PENDING)
        self.assertEqual(order.items.count(), 2)
        
        # Verificar cálculo de total
        expected_total = (Decimal('50.00') * 2) + (Decimal('30.00') * 1)
        self.assertEqual(order.total_amount, expected_total)
    
    def test_stock_reduction_on_order_creation(self):
        """Stock se reduce automáticamente al crear pedido."""
        initial_stock_p1 = self.product1.stock
        initial_stock_p2 = self.product2.stock
        
        order_data = {
            'customer_email': 'test@test.com',
            'customer_name': 'Test',
            'shipping_address': 'Test',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'items': [
                {'product': self.product1.id, 'quantity': 3},
                {'product': self.product2.id, 'quantity': 2}
            ]
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Recargar productos y verificar stock
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        
        self.assertEqual(self.product1.stock, initial_stock_p1 - 3)
        self.assertEqual(self.product2.stock, initial_stock_p2 - 2)
    
    def test_product_snapshot_on_order_creation(self):
        """OrderItem captura snapshot de nombre y precio del producto."""
        order_data = {
            'customer_email': 'test@test.com',
            'customer_name': 'Test',
            'shipping_address': 'Test',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'items': [
                {'product': self.product1.id, 'quantity': 1}
            ]
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        order = Order.objects.first()
        item = order.items.first()
        
        # Verificar snapshot
        self.assertEqual(item.product_name, self.product1.name)
        self.assertEqual(item.product_price, self.product1.price)
        self.assertEqual(item.artisan, self.artist_user)
        
        # Cambiar producto y verificar que snapshot no cambia
        self.product1.name = 'Nuevo Título'
        self.product1.price = Decimal('999.99')
        self.product1.save()
        
        item.refresh_from_db()
        self.assertEqual(item.product_name, 'Cerámica Azul')  # Snapshot original
        self.assertEqual(item.product_price, Decimal('50.00'))  # Snapshot original


class OrderValidationTests(TestCase):
    """Tests para validaciones de pedidos."""
    
    def setUp(self):
        """Configurar datos de prueba."""
        self.client = APIClient()
        
        self.artist_user = User.objects.create_user(
            email='artesano@mitaller.art',
            username='artesano',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        # El signal create_artisan_profile ya creó el perfil, solo lo obtenemos y configuramos
        self.artisan_profile = self.artist_user.artisan_profile
        self.artisan_profile.display_name = 'Taller Test'
        self.artisan_profile.craft_type = CraftType.CERAMICS
        self.artisan_profile.location = MenorcaLocation.CIUTADELLA
        self.artisan_profile.save()
        
        self.product = Product.objects.create(
            artisan=self.artist_user,
            name='Producto Test',
            description='Test',
            price=Decimal('50.00'),
            stock=3,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
    
    def test_cannot_order_more_than_stock(self):
        """No se puede pedir más cantidad que stock disponible."""
        order_data = {
            'customer_email': 'test@test.com',
            'customer_name': 'Test',
            'shipping_address': 'Test',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'items': [
                {'product': self.product.id, 'quantity': 10}  # Stock solo 3
            ]
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Stock insuficiente', str(response.data))
    
    def test_cannot_order_unavailable_product(self):
        """No se pueden pedir productos no disponibles."""
        self.product.is_active = False
        self.product.save()
        
        order_data = {
            'customer_email': 'test@test.com',
            'customer_name': 'Test',
            'shipping_address': 'Test',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'items': [
                {'product': self.product.id, 'quantity': 1}
            ]
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Cuando un producto no está disponible (is_active=False o stock=0),
        # el queryset del serializer no lo incluye, por lo que DRF retorna error "no existe"
        self.assertIn('no existe', str(response.data).lower())
    
    def test_cannot_order_zero_quantity(self):
        """No se puede pedir cantidad 0 o negativa."""
        order_data = {
            'customer_email': 'test@test.com',
            'customer_name': 'Test',
            'shipping_address': 'Test',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'items': [
                {'product': self.product.id, 'quantity': 0}
            ]
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cannot_order_without_items(self):
        """No se puede crear pedido sin items."""
        order_data = {
            'customer_email': 'test@test.com',
            'customer_name': 'Test',
            'shipping_address': 'Test',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'items': []
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('al menos un producto', str(response.data))


class OrderQueryTests(TestCase):
    """Tests para queries y filtrado de pedidos según rol."""
    
    def setUp(self):
        """Configurar artesanos, productos y pedidos."""
        self.client = APIClient()
        
        # Artesano 1
        self.artist1_user = User.objects.create_user(
            email='artesano1@mitaller.art',
            username='artesano1',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        self.artist1_profile = self.artist1_user.artisan_profile
        self.artist1_profile.display_name = 'Taller 1'
        self.artist1_profile.craft_type = CraftType.CERAMICS
        self.artist1_profile.location = MenorcaLocation.CIUTADELLA
        self.artist1_profile.save()        
        self.product1 = Product.objects.create(
            artisan=self.artist1_user,
            name='Producto Artesano 1',
            description='Test',
            price=Decimal('50.00'),
            stock=10,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
        
        # Artesano 2
        self.artist2_user = User.objects.create_user(
            email='artesano2@mitaller.art',
            username='artesano2',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        self.artist2_profile = self.artist2_user.artisan_profile
        self.artist2_profile.display_name = 'Taller 2'
        self.artist2_profile.craft_type = CraftType.JEWELRY
        self.artist2_profile.location = MenorcaLocation.MAO
        self.artist2_profile.save()
        self.product2 = Product.objects.create(
            artisan=self.artist2_user,
            name='Producto Artesano 2',
            description='Test',
            price=Decimal('30.00'),
            stock=10,
            category=ProductCategory.JEWELRY,
            thumbnail_url='https://example.com/test2.jpg',
            is_active=True
        )
        
        # Admin
        self.admin_user = User.objects.create_superuser(
            email='admin@mitaller.art',
            username='admin',
            password='testpass123'
        )
        
        # Crear pedidos
        self.order1 = Order.objects.create(
            customer_email='comprador1@test.com',
            customer_name='Comprador 1',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701',
            total_amount=Decimal('50.00')
        )
        OrderItem.objects.create(
            order=self.order1,
            product=self.product1,
            artisan=self.artist1_user,
            product_name='Producto 1',
            product_price=Decimal('50.00'),
            quantity=1
        )
        
        self.order2 = Order.objects.create(
            customer_email='comprador2@test.com',
            customer_name='Comprador 2',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701',
            total_amount=Decimal('30.00')
        )
        OrderItem.objects.create(
            order=self.order2,
            product=self.product2,
            artisan=self.artist2_user,
            product_name='Producto 2',
            product_price=Decimal('30.00'),
            quantity=1
        )
    
    def test_artisan_sees_only_own_orders(self):
        """Artesanos solo ven pedidos con sus productos."""
        self.client.force_authenticate(user=self.artist1_user)
        
        response = self.client.get('/api/v1/orders/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(
            response.data['results'][0]['customer_email'],
            'comprador1@test.com'
        )
    
    def test_admin_sees_all_orders(self):
        """Admins ven todos los pedidos."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get('/api/v1/orders/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_unauthenticated_cannot_list_orders(self):
        """Usuarios no autenticados no pueden listar pedidos."""
        response = self.client.get('/api/v1/orders/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OrderArtistSalesTests(TestCase):
    """Tests para endpoint de ventas del artesano (my-sales)."""
    
    def setUp(self):
        """Configurar artesano con ventas."""
        self.client = APIClient()
        
        self.artist_user = User.objects.create_user(
            email='artesano@mitaller.art',
            username='artesano',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        # El signal create_artisan_profile ya creó el perfil, solo lo obtenemos y configuramos
        self.artisan_profile = self.artist_user.artisan_profile
        self.artisan_profile.display_name = 'Taller Test'
        self.artisan_profile.craft_type = CraftType.CERAMICS
        self.artisan_profile.location = MenorcaLocation.CIUTADELLA
        self.artisan_profile.save()
        
        self.product = Product.objects.create(
            artisan=self.artist_user,
            name='Producto Test',
            description='Test',
            price=Decimal('50.00'),
            stock=10,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
        
        # Crear pedido con venta
        order = Order.objects.create(
            customer_email='comprador@test.com',
            customer_name='Comprador Test',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701',
            total_amount=Decimal('100.00')
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            artisan=self.artist_user,
            product_name='Producto Test',
            product_price=Decimal('50.00'),
            quantity=2
        )
    
    def test_artisan_can_view_sales(self):
        """Artesanos pueden ver sus ventas."""
        self.client.force_authenticate(user=self.artist_user)
        
        response = self.client.get('/api/v1/orders/my-sales/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        sale = response.data['results'][0]
        self.assertEqual(sale['product_name'], 'Producto Test')
        self.assertEqual(sale['quantity'], 2)
    
    def test_non_artisan_cannot_view_sales(self):
        """No artesanos no pueden acceder a my-sales."""
        regular_user = User.objects.create_user(
            email='regular@test.com',
            username='regular',
            password='testpass123',
            role=UserRole.ADMIN
        )
        self.client.force_authenticate(user=regular_user)
        
        response = self.client.get('/api/v1/orders/my-sales/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class OrderSignalsTests(TestCase):
    """Tests para signals de restauración de stock."""
    
    def setUp(self):
        """Configurar artesano y producto."""
        self.artist_user = User.objects.create_user(
            email='artesano@mitaller.art',
            username='artesano',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        # El signal create_artisan_profile ya creó el perfil, solo lo obtenemos y configuramos
        self.artisan_profile = self.artist_user.artisan_profile
        self.artisan_profile.display_name = 'Taller Test'
        self.artisan_profile.craft_type = CraftType.CERAMICS
        self.artisan_profile.location = MenorcaLocation.CIUTADELLA
        self.artisan_profile.save()
        
        self.product = Product.objects.create(
            artisan=self.artist_user,
            name='Producto Test',
            description='Test',
            price=Decimal('50.00'),
            stock=10,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
    
    def test_stock_restored_on_orderitem_delete(self):
        """Stock se restaura al eliminar un OrderItem."""
        order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701'
        )
        
        item = OrderItem.objects.create(
            order=order,
            product=self.product,
            artisan=self.artist_user,
            product_name='Test',
            product_price=Decimal('50.00'),
            quantity=3
        )
        
        # Reducir stock manualmente (simular compra)
        self.product.stock -= 3
        self.product.save()
        
        initial_stock = self.product.stock
        
        # Eliminar item (debería restaurar stock)
        item.delete()
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock + 3)
    
    def test_stock_restored_on_order_cancellation(self):
        """Stock se restaura al cancelar un pedido."""
        # Crear pedido con stock inicial
        initial_stock = self.product.stock
        
        order = Order.objects.create(
            customer_email='test@test.com',
            customer_name='Test',
            shipping_address='Test',
            shipping_city='Maó',
            shipping_postal_code='07701'
        )
        
        OrderItem.objects.create(
            order=order,
            product=self.product,
            artisan=self.artist_user,
            product_name='Test',
            product_price=Decimal('50.00'),
            quantity=5
        )
        
        # Reducir stock manualmente (simulando compra)
        self.product.stock = initial_stock - 5
        self.product.save()
        
        # Cambiar estado a CANCELLED (debe restaurar stock)
        order.status = OrderStatus.CANCELLED
        order.save(update_fields=['status'])
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock)


class OrderAtomicTransactionTests(TestCase):
    """Tests para verificar transacciones atómicas."""
    
    def setUp(self):
        """Configurar datos de prueba."""
        self.client = APIClient()
        
        self.artist_user = User.objects.create_user(
            email='artesano@mitaller.art',
            username='artesano',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        self.artisan_profile = self.artist_user.artisan_profile
        self.artisan_profile.display_name = 'Taller Test'
        self.artisan_profile.craft_type = CraftType.CERAMICS
        self.artisan_profile.location = MenorcaLocation.CIUTADELLA
        self.artisan_profile.save()
        
        self.product1 = Product.objects.create(
            artisan=self.artist_user,
            name='Producto OK',
            description='Test',
            price=Decimal('50.00'),
            stock=10,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test.jpg',
            is_active=True
        )
        
        self.product2 = Product.objects.create(
            artisan=self.artist_user,
            name='Producto Sin Stock',
            description='Test',
            price=Decimal('30.00'),
            stock=1,
            category=ProductCategory.CERAMICS,
            thumbnail_url='https://example.com/test2.jpg',
            is_active=True
        )
    
    def test_rollback_on_insufficient_stock(self):
        """Si un item falla por stock, ningún producto se reduce (rollback)."""
        initial_stock_p1 = self.product1.stock
        initial_stock_p2 = self.product2.stock
        
        order_data = {
            'customer_email': 'test@test.com',
            'customer_name': 'Test',
            'shipping_address': 'Test',
            'shipping_city': 'Maó',
            'shipping_postal_code': '07701',
            'items': [
                {'product': self.product1.id, 'quantity': 2},  # OK
                {'product': self.product2.id, 'quantity': 10}  # FAIL - stock solo 1
            ]
        }
        
        response = self.client.post('/api/v1/orders/', order_data, format='json')
        
        # Debe fallar
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verificar que NO se creó el pedido
        self.assertEqual(Order.objects.count(), 0)
        
        # Verificar que NO se redujo stock de ningún producto (rollback)
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        
        self.assertEqual(self.product1.stock, initial_stock_p1)
        self.assertEqual(self.product2.stock, initial_stock_p2)

