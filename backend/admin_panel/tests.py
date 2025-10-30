from django.test import TestCase
from accounts.models import User
from artisans.models import ArtisanProfile
from works.models import Work
from .services import delete_artisan_cascade
from django.core.exceptions import ValidationError


class DeleteArtisanCascadeTests(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            username='test_artisan',
            email='test@example.com',
            role='artisan',
            is_approved=True
        )
        # ArtisanProfile is created automatically by signal
        self.profile = self.user.artisan_profile
        self.work = Work.objects.create(
            artisan=self.user,
            title='Test Work'
        )

    def test_delete_success(self):
        """Test successful deletion"""
        result = delete_artisan_cascade(str(self.user.id))

        self.assertTrue(result['success'])
        self.assertEqual(result['works_deleted'], 1)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

    def test_delete_with_completed_orders(self):
        """Test that fails if there are completed orders"""
        # TODO: Create Order with status='completed'
        # Verify that it raises ValidationError
        pass
