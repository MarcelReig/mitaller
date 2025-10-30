"""
Tests for artisans app.
Verifies ArtisanProfile functionality, signals, and public API.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import UserRole
from .models import ArtisanProfile, CraftType, MenorcaLocation

User = get_user_model()


class ArtisanProfileModelTest(TestCase):
    """
    Tests for ArtisanProfile model.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        self.user = User.objects.create_user(
            email='test_artist@example.com',
            username='test_artist',
            password='Test1234',
            first_name='Test',
            last_name='Artist',
            role=UserRole.ARTISAN
        )
    
    def test_artisan_profile_created_automatically(self):
        """
        Test que verifica que se crea ArtisanProfile automáticamente
        cuando se crea un User con role=ARTISAN.
        """
        self.assertTrue(hasattr(self.user, 'artisan_profile'))
        self.assertIsNotNone(self.user.artisan_profile)
    
    def test_artisan_profile_default_values(self):
        """
        Test que verifica los valores por defecto del perfil.
        """
        profile = self.user.artisan_profile
        
        self.assertEqual(profile.slug, self.user.username)
        self.assertEqual(profile.display_name, self.user.get_full_name())
        self.assertEqual(profile.craft_type, CraftType.OTHER)
        self.assertEqual(profile.location, MenorcaLocation.OTHER)
        self.assertEqual(profile.total_works, 0)
        self.assertEqual(profile.total_products, 0)
        self.assertFalse(profile.is_featured)
    
    def test_artisan_profile_slug_unique(self):
        """
        Test que verifica que los slugs son únicos.
        """
        # Crear segundo usuario
        user2 = User.objects.create_user(
            email='test_artist2@example.com',
            username='test_artist2',
            password='Test1234',
            role=UserRole.ARTISAN
        )
        
        profile1 = self.user.artisan_profile
        profile2 = user2.artisan_profile
        
        self.assertNotEqual(profile1.slug, profile2.slug)
    
    def test_full_location_property(self):
        """
        Test que verifica la property full_location.
        """
        profile = self.user.artisan_profile
        profile.location = MenorcaLocation.MAO
        profile.save()
        
        expected = 'Taller en Maó, Menorca'
        self.assertEqual(profile.full_location, expected)
    
    def test_instagram_url_property(self):
        """
        Test que verifica la property instagram_url.
        """
        profile = self.user.artisan_profile
        profile.instagram = 'test_artist'
        profile.save()
        
        expected = 'https://instagram.com/test_artist'
        self.assertEqual(profile.instagram_url, expected)
    
    def test_instagram_url_none_when_empty(self):
        """
        Test que verifica que instagram_url es None si no hay instagram.
        """
        profile = self.user.artisan_profile
        self.assertIsNone(profile.instagram_url)
    
    def test_get_absolute_url(self):
        """
        Test que verifica el método get_absolute_url.
        """
        profile = self.user.artisan_profile
        expected = f'/artesanos/{profile.slug}/'
        self.assertEqual(profile.get_absolute_url(), expected)
    
    def test_str_representation(self):
        """
        Test que verifica el método __str__.
        """
        profile = self.user.artisan_profile
        self.assertEqual(str(profile), profile.display_name)


class ArtisanProfileSignalTest(TestCase):
    """
    Tests para los signals de ArtisanProfile.
    """
    
    def test_admin_user_no_profile(self):
        """
        Test que verifica que los usuarios ADMIN no reciben ArtisanProfile.
        """
        admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='Admin1234',
            role=UserRole.ADMIN
        )
        
        with self.assertRaises(ArtisanProfile.DoesNotExist):
            _ = admin.artisan_profile


class ArtisanProfileAPITest(APITestCase):
    """
    Tests para la API pública de ArtisanProfile.
    """
    
    def setUp(self):
        """Configuración inicial para cada test."""
        # Crear usuarios artesanos
        self.user1 = User.objects.create_user(
            email='artist1@example.com',
            username='artist1',
            password='Test1234',
            first_name='Artist',
            last_name='One',
            role=UserRole.ARTISAN
        )
        
        self.user2 = User.objects.create_user(
            email='artist2@example.com',
            username='artist2',
            password='Test1234',
            first_name='Artist',
            last_name='Two',
            role=UserRole.ARTISAN
        )
        
        # Actualizar perfiles
        self.profile1 = self.user1.artisan_profile
        self.profile1.craft_type = CraftType.CERAMICS
        self.profile1.location = MenorcaLocation.MAO
        self.profile1.save()
        
        self.profile2 = self.user2.artisan_profile
        self.profile2.craft_type = CraftType.JEWELRY
        self.profile2.location = MenorcaLocation.CIUTADELLA
        self.profile2.is_featured = True
        self.profile2.save()
    
    def test_list_artists(self):
        """
        Test que verifica el listado de artistas.
        """
        response = self.client.get('/api/v1/artisans/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # DRF puede retornar lista directa o dict con 'results' si hay paginación
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 2)
        else:
            self.assertIn('results', response.data)
            self.assertEqual(len(response.data['results']), 2)
    
    def test_retrieve_artist_by_slug(self):
        """
        Test que verifica el detalle de un artista por slug.
        """
        response = self.client.get(f'/api/v1/artisans/{self.profile1.slug}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['slug'], self.profile1.slug)
        self.assertEqual(response.data['display_name'], self.profile1.display_name)
    
    def test_filter_by_craft_type(self):
        """
        Test que verifica el filtro por tipo de artesanía.
        """
        response = self.client.get(f'/api/v1/artisans/?craft_type={CraftType.CERAMICS}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Manejar respuesta paginada o lista directa
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['craft_type'], CraftType.CERAMICS)
    
    def test_filter_by_location(self):
        """
        Test que verifica el filtro por ubicación.
        """
        response = self.client.get(f'/api/v1/artisans/?location={MenorcaLocation.MAO}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Manejar respuesta paginada o lista directa
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['location'], MenorcaLocation.MAO)
    
    def test_filter_by_is_featured(self):
        """
        Test que verifica el filtro por destacados.
        """
        response = self.client.get('/api/v1/artisans/?is_featured=true')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Manejar respuesta paginada o lista directa
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        self.assertEqual(len(data), 1)
        self.assertTrue(data[0]['is_featured'])
    
    def test_search_artists(self):
        """
        Test que verifica la búsqueda de artistas.
        """
        response = self.client.get('/api/v1/artisans/?search=Artist One')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Manejar respuesta paginada o lista directa
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        self.assertGreaterEqual(len(data), 1)
    
    def test_ordering_featured_first(self):
        """
        Test que verifica que los destacados aparecen primero.
        """
        response = self.client.get('/api/v1/artisans/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Manejar respuesta paginada o lista directa
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        
        # El primero debe ser el destacado
        if len(data) > 0:
            self.assertTrue(data[0]['is_featured'])
    
    def test_api_is_public(self):
        """
        Test que verifica que la API es pública (sin autenticación).
        """
        # No se envía token de autenticación
        response = self.client.get('/api/v1/artisans/')
        
        # Debe funcionar sin autenticación
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_api_is_readonly(self):
        """
        Test que verifica que la API es de solo lectura.
        """
        # Intentar crear perfil via POST
        response = self.client.post('/api/v1/artisans/', {
            'display_name': 'New Artist',
            'craft_type': CraftType.WOOD,
        })
        
        # Debe fallar (método no permitido)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
