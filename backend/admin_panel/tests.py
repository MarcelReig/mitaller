from django.test import TestCase
from accounts.models import User
from artists.models import ArtistProfile
from works.models import Work
from .services import delete_artist_cascade
from django.core.exceptions import ValidationError


class DeleteArtistCascadeTests(TestCase):
    
    def setUp(self):
        self.user = User.objects.create(
            username='test_artist',
            email='test@example.com',
            role='artisan',
            is_approved=True
        )
        self.profile = ArtistProfile.objects.create(
            user=self.user,
            slug='test-artist'
        )
        self.work = Work.objects.create(
            artist=self.user,
            title='Test Work'
        )
    
    def test_delete_success(self):
        """Test eliminación exitosa"""
        result = delete_artist_cascade(str(self.user.id))
        
        self.assertTrue(result['success'])
        self.assertEqual(result['works_deleted'], 1)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())
    
    def test_delete_with_completed_orders(self):
        """Test que falla si hay pedidos completados"""
        # TODO: Crear Order con status='completed'
        # Verificar que lanza ValidationError
        pass
