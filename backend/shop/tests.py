"""
Tests completos para la app shop.
Cubre modelos, serializers, permisos, views, validaciones y signals.
"""
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import User, UserRole
from artisans.models import ArtisanProfile, CraftType, MenorcaLocation
from .models import Product, ProductCategory


class ProductModelTestCase(TestCase):
    """
    Tests para el modelo Product.
    Valida creación, propiedades calculadas y representación.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        # Crear usuario artesano
        self.user = User.objects.create_user(
            email='artesano@test.com',
            username='artesano',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        
        # El signal crea automáticamente el ArtistProfile
        self.artisan_profile = self.user.artisan_profile
        
        # Configurar perfil del artesano
        self.artisan_profile.craft_type = CraftType.CERAMICS
        self.artisan_profile.location = MenorcaLocation.MAO
        self.artisan_profile.save()
    
    def test_create_product(self):
        """Test: Crear un producto básico."""
        product = Product.objects.create(
            artisan=self.user,
            name='Tazas de Cerámica - Pack de 4',
            description='Hermosas tazas hechas a mano',
            category=ProductCategory.CERAMICS,
            price=Decimal('23.50'),
            stock=12,
            thumbnail_url='https://res.cloudinary.com/test/tazas.jpg'
        )
        
        self.assertEqual(product.artisan, self.user)
        self.assertEqual(product.name, 'Tazas de Cerámica - Pack de 4')
        self.assertEqual(product.category, ProductCategory.CERAMICS)
        self.assertEqual(product.price, Decimal('23.50'))
        self.assertEqual(product.stock, 12)
        self.assertTrue(product.is_active)
        self.assertIsNotNone(product.created_at)
        self.assertIsNotNone(product.updated_at)
    
    def test_product_str_representation(self):
        """Test: Representación string de Product."""
        product = Product.objects.create(
            artisan=self.user,
            name='Collar de Plata',
            category=ProductCategory.JEWELRY,
            price=Decimal('45.00'),
            stock=5,
            thumbnail_url='https://res.cloudinary.com/test/collar.jpg'
        )
        expected = f'{self.artisan_profile.display_name} - Collar de Plata'
        self.assertEqual(str(product), expected)
    
    def test_is_available_property_active_with_stock(self):
        """Test: Producto disponible si está activo y tiene stock."""
        product = Product.objects.create(
            artisan=self.user,
            name='Producto Disponible',
            category=ProductCategory.WOOD,
            price=Decimal('30.00'),
            stock=10,
            is_active=True,
            thumbnail_url='https://res.cloudinary.com/test/product.jpg'
        )
        self.assertTrue(product.is_available)
    
    def test_is_available_property_active_no_stock(self):
        """Test: Producto NO disponible si está activo pero sin stock."""
        product = Product.objects.create(
            artisan=self.user,
            name='Producto Agotado',
            category=ProductCategory.WOOD,
            price=Decimal('30.00'),
            stock=0,
            is_active=True,
            thumbnail_url='https://res.cloudinary.com/test/product.jpg'
        )
        self.assertFalse(product.is_available)
    
    def test_is_available_property_inactive_with_stock(self):
        """Test: Producto NO disponible si está inactivo aunque tenga stock."""
        product = Product.objects.create(
            artisan=self.user,
            name='Producto Inactivo',
            category=ProductCategory.WOOD,
            price=Decimal('30.00'),
            stock=10,
            is_active=False,
            thumbnail_url='https://res.cloudinary.com/test/product.jpg'
        )
        self.assertFalse(product.is_available)
    
    def test_formatted_price_property(self):
        """Test: Propiedad formatted_price formatea correctamente."""
        product = Product.objects.create(
            artisan=self.user,
            name='Producto Test',
            category=ProductCategory.ACCESSORIES,
            price=Decimal('99.99'),
            stock=5,
            thumbnail_url='https://res.cloudinary.com/test/product.jpg'
        )
        self.assertEqual(product.formatted_price, '99.99 EUR')
    
    def test_product_with_images_gallery(self):
        """Test: Producto con galería de imágenes."""
        product = Product.objects.create(
            artisan=self.user,
            name='Producto con Galería',
            category=ProductCategory.CERAMICS,
            price=Decimal('50.00'),
            stock=3,
            thumbnail_url='https://res.cloudinary.com/test/main.jpg',
            images=[
                'https://res.cloudinary.com/test/gallery1.jpg',
                'https://res.cloudinary.com/test/gallery2.jpg',
                'https://res.cloudinary.com/test/gallery3.jpg',
            ]
        )
        self.assertEqual(len(product.images), 3)
        self.assertIsInstance(product.images, list)
    
    def test_product_ordering(self):
        """Test: Productos se ordenan por más recientes primero."""
        product1 = Product.objects.create(
            artisan=self.user,
            name='Producto 1',
            category=ProductCategory.CERAMICS,
            price=Decimal('10.00'),
            stock=1,
            thumbnail_url='https://res.cloudinary.com/test/p1.jpg'
        )
        product2 = Product.objects.create(
            artisan=self.user,
            name='Producto 2',
            category=ProductCategory.CERAMICS,
            price=Decimal('20.00'),
            stock=2,
            thumbnail_url='https://res.cloudinary.com/test/p2.jpg'
        )
        
        products = list(Product.objects.all())
        # Más reciente primero (product2)
        self.assertEqual(products[0].id, product2.id)
        self.assertEqual(products[1].id, product1.id)


class ProductAPITestCase(APITestCase):
    """
    Tests para la API REST de products.
    Valida endpoints, permisos, filtros y búsqueda.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.client = APIClient()
        
        # Crear artesano 1
        self.artist1_user = User.objects.create_user(
            email='artist1@test.com',
            username='artist1',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        self.artist1_profile = self.artist1_user.artisan_profile
        
        # Crear artesano 2
        self.artist2_user = User.objects.create_user(
            email='artist2@test.com',
            username='artist2',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        self.artist2_profile = self.artist2_user.artisan_profile
        
        # Crear admin (no artesano)
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='testpass123',
            role=UserRole.ADMIN
        )
        
        # Crear algunos productos para artist1
        self.product1 = Product.objects.create(
            artisan=self.artist1_user,
            name='Tazas de Cerámica',
            description='Pack de 4 tazas artesanales',
            category=ProductCategory.CERAMICS,
            price=Decimal('25.00'),
            stock=10,
            thumbnail_url='https://res.cloudinary.com/test/tazas.jpg',
            is_active=True
        )
        
        self.product2 = Product.objects.create(
            artisan=self.artist1_user,
            name='Collar de Plata',
            description='Collar único hecho a mano',
            category=ProductCategory.JEWELRY,
            price=Decimal('45.00'),
            stock=3,
            thumbnail_url='https://res.cloudinary.com/test/collar.jpg',
            is_active=True
        )
        
        # Producto sin stock (no debería aparecer en listado público)
        self.product3 = Product.objects.create(
            artisan=self.artist1_user,
            name='Producto Agotado',
            description='Sin stock',
            category=ProductCategory.WOOD,
            price=Decimal('30.00'),
            stock=0,
            thumbnail_url='https://res.cloudinary.com/test/agotado.jpg',
            is_active=True
        )
        
        # Producto inactivo (no debería aparecer en listado público)
        self.product4 = Product.objects.create(
            artisan=self.artist1_user,
            name='Producto Inactivo',
            description='No visible',
            category=ProductCategory.TEXTILES,
            price=Decimal('20.00'),
            stock=5,
            thumbnail_url='https://res.cloudinary.com/test/inactivo.jpg',
            is_active=False
        )
        
        # URL base
        self.list_url = reverse('product-list')
    
    def test_list_products_public(self):
        """Test: Listar productos sin autenticación (solo disponibles)."""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Solo deberían aparecer product1 y product2 (activos con stock)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_list_products_as_artist_sees_all_own(self):
        """Test: Artesano autenticado ve todos sus productos (incluidos inactivos)."""
        self.client.force_authenticate(user=self.artist1_user)
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Debería ver todos sus 4 productos
        self.assertEqual(len(response.data['results']), 4)
    
    def test_retrieve_product_public(self):
        """Test: Ver detalle de producto sin autenticación."""
        url = reverse('product-detail', kwargs={'pk': self.product1.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Tazas de Cerámica')
        self.assertIn('artisan', response.data)
        self.assertIn('is_available', response.data)
        self.assertIn('formatted_price', response.data)
    
    def test_create_product_unauthenticated(self):
        """Test: No se puede crear producto sin autenticación."""
        data = {
            'name': 'Nuevo Producto',
            'category': ProductCategory.CERAMICS,
            'price': '10.00',
            'stock': 5,
            'thumbnail_url': 'https://res.cloudinary.com/test/new.jpg'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_product_as_non_artist(self):
        """Test: Usuario no artesano (admin) no puede crear productos."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'name': 'Nuevo Producto',
            'category': ProductCategory.CERAMICS,
            'price': '10.00',
            'stock': 5,
            'thumbnail_url': 'https://res.cloudinary.com/test/new.jpg'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_product_as_artist(self):
        """Test: Artesano puede crear producto en su tienda."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'name': 'Cuenco de Madera',
            'description': 'Cuenco tallado a mano',
            'category': ProductCategory.WOOD,
            'price': '35.50',
            'stock': 8,
            'thumbnail_url': 'https://res.cloudinary.com/test/cuenco.jpg',
            'images': [
                'https://res.cloudinary.com/test/cuenco2.jpg',
                'https://res.cloudinary.com/test/cuenco3.jpg'
            ]
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Cuenco de Madera')
        # El artista se asigna automáticamente
        self.assertEqual(response.data['artisan']['id'], self.artist1_profile.id)
        self.assertTrue(response.data['is_available'])
    
    def test_update_own_product(self):
        """Test: Artesano puede actualizar su propio producto."""
        self.client.force_authenticate(user=self.artist1_user)
        
        url = reverse('product-detail', kwargs={'pk': self.product1.pk})
        data = {
            'price': '28.00',
            'stock': 15
        }
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['price'], '28.00')
        self.assertEqual(response.data['stock'], 15)
    
    def test_update_other_artist_product(self):
        """Test: Artesano NO puede actualizar producto de otro artesano."""
        self.client.force_authenticate(user=self.artist2_user)
        
        url = reverse('product-detail', kwargs={'pk': self.product1.pk})
        data = {'price': '100.00'}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_own_product(self):
        """Test: Artesano puede eliminar su propio producto."""
        self.client.force_authenticate(user=self.artist1_user)
        
        url = reverse('product-detail', kwargs={'pk': self.product1.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(pk=self.product1.pk).exists())
    
    def test_delete_other_artist_product(self):
        """Test: Artesano NO puede eliminar producto de otro."""
        self.client.force_authenticate(user=self.artist2_user)
        
        url = reverse('product-detail', kwargs={'pk': self.product1.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Product.objects.filter(pk=self.product1.pk).exists())
    
    def test_filter_by_artist(self):
        """Test: Filtrar productos por artista."""
        # Crear producto para artist2
        Product.objects.create(
            artisan=self.artist2_user,
            name='Producto de Artista 2',
            category=ProductCategory.LEATHER,
            price=Decimal('50.00'),
            stock=5,
            thumbnail_url='https://res.cloudinary.com/test/leather.jpg'
        )
        
        # Filtrar por artist1 (sin autenticación, solo ve disponibles)
        url = f'{self.list_url}?artisan={self.artist1_user.pk}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Solo products disponibles de artist1
        self.assertEqual(len(response.data['results']), 2)
    
    def test_filter_by_category(self):
        """Test: Filtrar productos por categoría."""
        url = f'{self.list_url}?category={ProductCategory.CERAMICS}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['category'], ProductCategory.CERAMICS)
    
    def test_filter_by_is_active(self):
        """Test: Filtrar productos activos (requiere autenticación)."""
        self.client.force_authenticate(user=self.artist1_user)
        
        url = f'{self.list_url}?is_active=false'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Debería ver su producto inactivo
        self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_search_products(self):
        """Test: Buscar productos por nombre o descripción."""
        url = f'{self.list_url}?search=cerámica'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_ordering_by_price(self):
        """Test: Ordenar productos por precio."""
        url = f'{self.list_url}?ordering=price'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar orden ascendente por precio
        prices = [Decimal(p['price']) for p in response.data['results']]
        self.assertEqual(prices, sorted(prices))
    
    def test_ordering_by_price_desc(self):
        """Test: Ordenar productos por precio descendente."""
        url = f'{self.list_url}?ordering=-price'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar orden descendente por precio
        prices = [Decimal(p['price']) for p in response.data['results']]
        self.assertEqual(prices, sorted(prices, reverse=True))
    
    def test_validation_price_negative(self):
        """Test: Validación de precio - no puede ser negativo."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'name': 'Producto Inválido',
            'category': ProductCategory.CERAMICS,
            'price': '-10.00',
            'stock': 5,
            'thumbnail_url': 'https://res.cloudinary.com/test/invalid.jpg'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)
    
    def test_validation_price_zero(self):
        """Test: Validación de precio - no puede ser cero."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'name': 'Producto Gratis',
            'category': ProductCategory.CERAMICS,
            'price': '0.00',
            'stock': 5,
            'thumbnail_url': 'https://res.cloudinary.com/test/gratis.jpg'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)
    
    def test_validation_stock_negative(self):
        """Test: Validación de stock - no puede ser negativo."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'name': 'Producto con Stock Negativo',
            'category': ProductCategory.CERAMICS,
            'price': '10.00',
            'stock': -5,
            'thumbnail_url': 'https://res.cloudinary.com/test/product.jpg'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock', response.data)
    
    def test_validation_images_not_list(self):
        """Test: Validación de images - debe ser lista."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'name': 'Producto Inválido',
            'category': ProductCategory.CERAMICS,
            'price': '10.00',
            'stock': 5,
            'thumbnail_url': 'https://res.cloudinary.com/test/product.jpg',
            'images': 'not-a-list'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('images', response.data)
    
    def test_validation_images_invalid_url(self):
        """Test: Validación de images - URLs deben ser válidas."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'name': 'Producto con URLs Inválidas',
            'category': ProductCategory.CERAMICS,
            'price': '10.00',
            'stock': 5,
            'thumbnail_url': 'https://res.cloudinary.com/test/product.jpg',
            'images': ['not-a-url', 'https://valid.com/image.jpg']
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('images', response.data)
    
    def test_validation_images_max_limit(self):
        """Test: Validación de images - máximo 10 imágenes."""
        self.client.force_authenticate(user=self.artist1_user)
        
        # Crear lista con 11 URLs válidas
        too_many_images = [
            f'https://res.cloudinary.com/test/image{i}.jpg'
            for i in range(11)
        ]
        
        data = {
            'name': 'Producto con Demasiadas Imágenes',
            'category': ProductCategory.CERAMICS,
            'price': '10.00',
            'stock': 5,
            'thumbnail_url': 'https://res.cloudinary.com/test/product.jpg',
            'images': too_many_images
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('images', response.data)


class ProductSignalsTestCase(TestCase):
    """
    Tests para signals relacionados con Products.
    Valida que los contadores en ArtistProfile se actualicen correctamente.
    """
    
    def setUp(self):
        """Configuración inicial."""
        self.user = User.objects.create_user(
            email='artist@test.com',
            username='artisan',
            password='testpass123',
            role=UserRole.ARTISAN
        )
        self.artisan_profile = self.user.artisan_profile
    
    def test_product_counter_increases_on_create(self):
        """Test: Contador total_products aumenta al crear producto."""
        initial_count = self.artisan_profile.total_products
        
        Product.objects.create(
            artisan=self.user,
            name='Nuevo Producto',
            category=ProductCategory.CERAMICS,
            price=Decimal('10.00'),
            stock=5,
            thumbnail_url='https://res.cloudinary.com/test/product.jpg'
        )
        
        self.artisan_profile.refresh_from_db()
        self.assertEqual(self.artisan_profile.total_products, initial_count + 1)
    
    def test_product_counter_decreases_on_delete(self):
        """Test: Contador total_products disminuye al eliminar producto."""
        # Crear producto
        product = Product.objects.create(
            artisan=self.user,
            name='Producto Temporal',
            category=ProductCategory.WOOD,
            price=Decimal('20.00'),
            stock=3,
            thumbnail_url='https://res.cloudinary.com/test/product.jpg'
        )
        
        self.artisan_profile.refresh_from_db()
        count_after_create = self.artisan_profile.total_products
        
        # Eliminar producto
        product.delete()
        
        self.artisan_profile.refresh_from_db()
        self.assertEqual(self.artisan_profile.total_products, count_after_create - 1)
    
    def test_product_counter_multiple_creates(self):
        """Test: Contador se actualiza correctamente con múltiples productos."""
        initial_count = self.artisan_profile.total_products
        
        # Crear 3 productos
        for i in range(3):
            Product.objects.create(
                artisan=self.user,
                name=f'Producto {i+1}',
                category=ProductCategory.ACCESSORIES,
                price=Decimal('15.00'),
                stock=2,
                thumbnail_url=f'https://res.cloudinary.com/test/product{i+1}.jpg'
            )
        
        self.artisan_profile.refresh_from_db()
        self.assertEqual(self.artisan_profile.total_products, initial_count + 3)
    
    def test_product_counter_update_no_change(self):
        """Test: Actualizar producto no afecta contador."""
        # Crear producto
        product = Product.objects.create(
            artisan=self.user,
            name='Producto Original',
            category=ProductCategory.JEWELRY,
            price=Decimal('50.00'),
            stock=1,
            thumbnail_url='https://res.cloudinary.com/test/product.jpg'
        )
        
        self.artisan_profile.refresh_from_db()
        count_after_create = self.artisan_profile.total_products
        
        # Actualizar producto (cambiar precio)
        product.price = Decimal('60.00')
        product.save()
        
        self.artisan_profile.refresh_from_db()
        # Contador no debería cambiar
        self.assertEqual(self.artisan_profile.total_products, count_after_create)
