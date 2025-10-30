"""
Tests completos para la app works.
Cubre modelos, serializers, permisos, views y funcionalidad de reordenamiento.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import User, UserRole
from artisans.models import ArtisanProfile, CraftType, MenorcaLocation
from .models import Work, WorkCategory


class WorkModelTestCase(TestCase):
    """
    Tests para el modelo Work.
    Valida creación, auto-ordenamiento y propiedades calculadas.
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
    
    def test_create_work(self):
        """Test: Crear una obra básica."""
        work = Work.objects.create(
            artisan=self.user,
            title='Jarrón de Cerámica',
            description='Hermoso jarrón hecho a mano',
            category=WorkCategory.CERAMICS,
            thumbnail_url='https://res.cloudinary.com/test/image1.jpg'
        )
        
        self.assertEqual(work.artisan, self.user)
        self.assertEqual(work.title, 'Jarrón de Cerámica')
        self.assertEqual(work.category, WorkCategory.CERAMICS)
        self.assertIsNotNone(work.created_at)
        self.assertIsNotNone(work.updated_at)
    
    def test_auto_display_order(self):
        """Test: display_order se calcula automáticamente."""
        # Crear primera obra (display_order = 0)
        work1 = Work.objects.create(
            artisan=self.user,
            title='Obra 1',
            thumbnail_url='https://res.cloudinary.com/test/image1.jpg'
        )
        # Debería auto-asignarse display_order = 1
        self.assertEqual(work1.display_order, 1)
        
        # Crear segunda obra
        work2 = Work.objects.create(
            artisan=self.user,
            title='Obra 2',
            thumbnail_url='https://res.cloudinary.com/test/image2.jpg'
        )
        # Debería auto-asignarse display_order = 2
        self.assertEqual(work2.display_order, 2)
        
        # Crear tercera obra
        work3 = Work.objects.create(
            artisan=self.user,
            title='Obra 3',
            thumbnail_url='https://res.cloudinary.com/test/image3.jpg'
        )
        # Debería auto-asignarse display_order = 3
        self.assertEqual(work3.display_order, 3)
    
    def test_manual_display_order(self):
        """Test: Puedo especificar display_order manualmente."""
        work = Work.objects.create(
            artisan=self.user,
            title='Obra Manual',
            thumbnail_url='https://res.cloudinary.com/test/image.jpg',
            display_order=99
        )
        # NO debería auto-calcularse
        self.assertEqual(work.display_order, 99)
    
    def test_total_images_property(self):
        """Test: Propiedad total_images calcula correctamente."""
        # Sin galería adicional
        work = Work.objects.create(
            artisan=self.user,
            title='Obra Simple',
            thumbnail_url='https://res.cloudinary.com/test/image.jpg'
        )
        self.assertEqual(work.total_images, 1)  # Solo thumbnail
        
        # Con galería de 3 imágenes
        work.images = [
            'https://res.cloudinary.com/test/image2.jpg',
            'https://res.cloudinary.com/test/image3.jpg',
            'https://res.cloudinary.com/test/image4.jpg',
        ]
        work.save()
        self.assertEqual(work.total_images, 4)  # 1 thumbnail + 3 galería
    
    def test_work_str_representation(self):
        """Test: Representación string de Work."""
        work = Work.objects.create(
            artisan=self.user,
            title='Jarrón Azul',
            thumbnail_url='https://res.cloudinary.com/test/image.jpg'
        )
        expected = f'{self.artisan_profile.display_name} - Jarrón Azul'
        self.assertEqual(str(work), expected)
    
    def test_work_ordering(self):
        """Test: Obras se ordenan correctamente por display_order."""
        # Crear obras con diferentes órdenes
        work3 = Work.objects.create(
            artisan=self.user,
            title='Obra 3',
            thumbnail_url='https://res.cloudinary.com/test/image.jpg',
            display_order=3
        )
        work1 = Work.objects.create(
            artisan=self.user,
            title='Obra 1',
            thumbnail_url='https://res.cloudinary.com/test/image.jpg',
            display_order=1
        )
        work2 = Work.objects.create(
            artisan=self.user,
            title='Obra 2',
            thumbnail_url='https://res.cloudinary.com/test/image.jpg',
            display_order=2
        )
        
        # Obtener obras ordenadas
        works = list(Work.objects.all())
        
        # Deben estar en orden: work1, work2, work3
        self.assertEqual(works[0].display_order, 1)
        self.assertEqual(works[1].display_order, 2)
        self.assertEqual(works[2].display_order, 3)


class WorkAPITestCase(APITestCase):
    """
    Tests para la API REST de works.
    Valida endpoints, permisos, filtros y reordenamiento.
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
        
        # Crear algunas obras para artist1
        self.work1 = Work.objects.create(
            artisan=self.artist1_user,
            title='Cerámica Azul',
            description='Hermosa cerámica',
            category=WorkCategory.CERAMICS,
            thumbnail_url='https://res.cloudinary.com/test/ceramic.jpg',
            display_order=1
        )
        
        self.work2 = Work.objects.create(
            artisan=self.artist1_user,
            title='Joyería Artesanal',
            description='Collar único',
            category=WorkCategory.JEWELRY,
            thumbnail_url='https://res.cloudinary.com/test/jewelry.jpg',
            display_order=2,
            is_featured=True
        )
        
        # URL base
        self.list_url = reverse('work-list')
    
    def test_list_works_public(self):
        """Test: Listar obras sin autenticación (público)."""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_retrieve_work_public(self):
        """Test: Ver detalle de obra sin autenticación."""
        url = reverse('work-detail', kwargs={'pk': self.work1.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Cerámica Azul')
        self.assertIn('artisan', response.data)
    
    def test_create_work_unauthenticated(self):
        """Test: No se puede crear obra sin autenticación."""
        data = {
            'title': 'Nueva Obra',
            'thumbnail_url': 'https://res.cloudinary.com/test/new.jpg'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_work_as_non_artist(self):
        """Test: Usuario no artesano (admin) no puede crear obras."""
        self.client.force_authenticate(user=self.admin_user)
        
        data = {
            'title': 'Nueva Obra',
            'thumbnail_url': 'https://res.cloudinary.com/test/new.jpg'
        }
        response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_work_as_artist(self):
        """Test: Artesano puede crear obra en su portfolio."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'title': 'Nueva Escultura',
            'description': 'Escultura en madera',
            'category': WorkCategory.SCULPTURE,
            'thumbnail_url': 'https://res.cloudinary.com/test/sculpture.jpg',
            'images': [
                'https://res.cloudinary.com/test/sculpture2.jpg',
                'https://res.cloudinary.com/test/sculpture3.jpg'
            ]
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Nueva Escultura')
        # El artista se asigna automáticamente
        self.assertEqual(response.data['artisan']['id'], self.artist1_profile.id)
        # display_order se auto-calcula (debería ser 3)
        self.assertEqual(response.data['display_order'], 3)
    
    def test_update_own_work(self):
        """Test: Artesano puede actualizar su propia obra."""
        self.client.force_authenticate(user=self.artist1_user)
        
        url = reverse('work-detail', kwargs={'pk': self.work1.pk})
        data = {
            'title': 'Cerámica Azul Actualizada',
            'is_featured': True
        }
        response = self.client.patch(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Cerámica Azul Actualizada')
        self.assertTrue(response.data['is_featured'])
    
    def test_update_other_artist_work(self):
        """Test: Artesano NO puede actualizar obra de otro artesano."""
        self.client.force_authenticate(user=self.artist2_user)

        url = reverse('work-detail', kwargs={'pk': self.work1.pk})
        data = {'title': 'Intento de Hackeo'}
        response = self.client.patch(url, data)

        # 404 porque el queryset filtra por artisan, no existe en el queryset de artist2
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_delete_own_work(self):
        """Test: Artesano puede eliminar su propia obra."""
        self.client.force_authenticate(user=self.artist1_user)
        
        url = reverse('work-detail', kwargs={'pk': self.work1.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Work.objects.filter(pk=self.work1.pk).exists())
    
    def test_delete_other_artist_work(self):
        """Test: Artesano NO puede eliminar obra de otro."""
        self.client.force_authenticate(user=self.artist2_user)

        url = reverse('work-detail', kwargs={'pk': self.work1.pk})
        response = self.client.delete(url)

        # 404 porque el queryset filtra por artisan, no existe en el queryset de artist2
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Work.objects.filter(pk=self.work1.pk).exists())
    
    def test_filter_by_artist(self):
        """Test: Filtrar obras por artista."""
        # Crear obra para artist2
        Work.objects.create(
            artisan=self.artist2_user,
            title='Obra de Artista 2',
            thumbnail_url='https://res.cloudinary.com/test/work.jpg'
        )
        
        # Filtrar por artist1
        url = f'{self.list_url}?artisan={self.artist1_user.pk}'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Solo works de artist1
    
    def test_filter_by_category(self):
        """Test: Filtrar obras por categoría."""
        url = f'{self.list_url}?category={WorkCategory.CERAMICS}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['category'], WorkCategory.CERAMICS)
    
    def test_filter_by_featured(self):
        """Test: Filtrar obras destacadas."""
        url = f'{self.list_url}?is_featured=true'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertTrue(response.data['results'][0]['is_featured'])
    
    def test_search_works(self):
        """Test: Buscar obras por título o descripción."""
        url = f'{self.list_url}?search=cerámica'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_reorder_works(self):
        """Test: Reordenar obras mediante endpoint custom."""
        self.client.force_authenticate(user=self.artist1_user)
        
        # Crear una tercera obra
        work3 = Work.objects.create(
            artisan=self.artist1_user,
            title='Obra 3',
            thumbnail_url='https://res.cloudinary.com/test/work3.jpg',
            display_order=3
        )
        
        # Nuevo orden: work2, work3, work1
        url = reverse('work-reorder')
        data = {
            'order': [self.work2.pk, work3.pk, self.work1.pk]
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar nuevo orden
        self.work1.refresh_from_db()
        self.work2.refresh_from_db()
        work3.refresh_from_db()
        
        self.assertEqual(self.work2.display_order, 1)
        self.assertEqual(work3.display_order, 2)
        self.assertEqual(self.work1.display_order, 3)
    
    def test_reorder_works_other_artist(self):
        """Test: No se pueden reordenar obras de otro artesano."""
        self.client.force_authenticate(user=self.artist2_user)

        url = reverse('work-reorder')
        data = {
            'order': [self.work1.pk, self.work2.pk]
        }
        response = self.client.put(url, data, format='json')

        # 404 porque las obras no pertenecen a artist2
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_validation_images_not_list(self):
        """Test: Validación de images - debe ser lista."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'title': 'Obra Inválida',
            'thumbnail_url': 'https://res.cloudinary.com/test/work.jpg',
            'images': 'not-a-list'  # Error: string en vez de lista
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('images', response.data)
    
    def test_validation_images_invalid_url(self):
        """Test: Validación de images - URLs deben ser válidas."""
        self.client.force_authenticate(user=self.artist1_user)
        
        data = {
            'title': 'Obra Inválida',
            'thumbnail_url': 'https://res.cloudinary.com/test/work.jpg',
            'images': ['not-a-url', 'https://valid.com/image.jpg']
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('images', response.data)


class WorkSignalsTestCase(TestCase):
    """
    Tests para signals relacionados con Works.
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
    
    def test_work_counter_increases_on_create(self):
        """Test: Contador total_works aumenta al crear obra."""
        initial_count = self.artisan_profile.total_works
        
        Work.objects.create(
            artisan=self.user,
            title='Nueva Obra',
            thumbnail_url='https://res.cloudinary.com/test/work.jpg'
        )
        
        self.artisan_profile.refresh_from_db()
        self.assertEqual(self.artisan_profile.total_works, initial_count + 1)
    
    def test_work_counter_decreases_on_delete(self):
        """Test: Contador total_works disminuye al eliminar obra."""
        # Crear obra
        work = Work.objects.create(
            artisan=self.user,
            title='Obra Temporal',
            thumbnail_url='https://res.cloudinary.com/test/work.jpg'
        )
        
        self.artisan_profile.refresh_from_db()
        count_after_create = self.artisan_profile.total_works
        
        # Eliminar obra
        work.delete()
        
        self.artisan_profile.refresh_from_db()
        self.assertEqual(self.artisan_profile.total_works, count_after_create - 1)
