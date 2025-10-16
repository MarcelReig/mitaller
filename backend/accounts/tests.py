from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import User, UserRole


class UserModelTests(TestCase):
    """Tests para el modelo User personalizado."""
    
    def test_create_artisan_default_role(self):
        """Test: Crear usuario con role por defecto (ARTISAN)."""
        user = User.objects.create_user(
            email='artisan@test.com',
            username='artisan',
            password='test123',
            first_name='Juan',
            last_name='Pérez'
        )
        self.assertEqual(user.role, UserRole.ARTISAN)
        self.assertFalse(user.is_approved)
        self.assertFalse(user.is_staff)
    
    def test_create_artisan_not_approved_by_default(self):
        """Test: Los artesanos NO están aprobados por defecto."""
        artisan = User.objects.create_user(
            email='artisan@test.com',
            username='artisan2',
            password='test123',
            first_name='Juan',
            last_name='Pérez',
            role=UserRole.ARTISAN
        )
        self.assertFalse(artisan.is_approved)
        self.assertFalse(artisan.can_sell)
    
    def test_artisan_approval(self):
        """Test: Artesano puede vender después de ser aprobado."""
        artisan = User.objects.create_user(
            email='artisan@test.com',
            username='artisan3',
            password='test123',
            first_name='Juan',
            last_name='Pérez'
        )
        self.assertFalse(artisan.can_sell)
        
        # Aprobar artesano
        artisan.is_approved = True
        artisan.save()
        
        self.assertTrue(artisan.can_sell)
    
    def test_create_admin_auto_approved(self):
        """Test: Los admins se auto-aprueban al guardar."""
        admin = User.objects.create_user(
            email='admin@test.com',
            username='admin1',
            password='admin123',
            first_name='María',
            last_name='González',
            role=UserRole.ADMIN
        )
        # El método save() auto-aprueba admins
        admin.save()
        
        self.assertTrue(admin.is_approved)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.can_sell)
    
    def test_create_superuser(self):
        """Test: Crear superusuario con todos los permisos."""
        superuser = User.objects.create_superuser(
            email='super@test.com',
            username='superuser',
            password='super123',
            first_name='Super',
            last_name='User'
        )
        self.assertEqual(superuser.role, UserRole.ADMIN)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_approved)
        self.assertTrue(superuser.can_sell)
    
    def test_email_is_unique(self):
        """Test: El email debe ser único."""
        User.objects.create_user(
            email='test@test.com',
            username='user1',
            password='test123',
            first_name='User',
            last_name='One'
        )
        
        # Intentar crear otro usuario con el mismo email debe fallar
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='test@test.com',
                username='user2',
                password='test456',
                first_name='User',
                last_name='Two'
            )
    
    def test_email_normalization(self):
        """Test: El email se normaliza correctamente."""
        user = User.objects.create_user(
            email='Test@EXAMPLE.COM',
            username='testuser',
            password='test123',
            first_name='Test',
            last_name='User'
        )
        # El dominio debe estar en minúsculas
        self.assertEqual(user.email, 'Test@example.com')
    
    def test_user_properties(self):
        """Test: Properties is_artisan, is_admin funcionan correctamente."""
        artisan = User.objects.create_user(
            email='artisan@test.com',
            username='artisan4',
            password='test123',
            first_name='Art',
            last_name='Isan',
            role=UserRole.ARTISAN
        )
        self.assertTrue(artisan.is_artisan)
        self.assertFalse(artisan.is_admin)
        
        admin = User.objects.create_user(
            email='admin@test.com',
            username='admin2',
            password='admin123',
            first_name='Ad',
            last_name='Min',
            role=UserRole.ADMIN
        )
        self.assertFalse(admin.is_artisan)
        self.assertTrue(admin.is_admin)
    
    def test_get_full_name(self):
        """Test: get_full_name() retorna nombre completo."""
        user = User.objects.create_user(
            email='test@test.com',
            username='juan',
            password='test123',
            first_name='Juan',
            last_name='Pérez'
        )
        self.assertEqual(user.get_full_name(), 'Juan Pérez')
    
    def test_get_full_name_empty_returns_email(self):
        """Test: get_full_name() retorna email si no hay nombre."""
        user = User.objects.create_user(
            email='test@test.com',
            username='testuser2',
            password='test123'
        )
        self.assertEqual(user.get_full_name(), 'test@test.com')
    
    def test_get_short_name(self):
        """Test: get_short_name() retorna el nombre."""
        user = User.objects.create_user(
            email='test@test.com',
            username='testuser3',
            password='test123',
            first_name='Juan'
        )
        self.assertEqual(user.get_short_name(), 'Juan')
    
    def test_str_representation(self):
        """Test: __str__() retorna el email."""
        user = User.objects.create_user(
            email='test@test.com',
            username='testuser4',
            password='test123'
        )
        self.assertEqual(str(user), 'test@test.com')
    
    def test_admin_can_sell_without_approval(self):
        """Test: Los admins pueden vender sin aprobación."""
        admin = User.objects.create_user(
            email='admin@test.com',
            username='admin3',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role=UserRole.ADMIN
        )
        # Incluso antes de save(), los admins deberían poder vender
        admin.save()
        self.assertTrue(admin.can_sell)
    
    def test_change_role_to_admin_auto_approves(self):
        """Test: Cambiar role a ADMIN auto-aprueba al usuario."""
        user = User.objects.create_user(
            email='user@test.com',
            username='usertest',
            password='test123',
            first_name='User',
            last_name='Test',
            role=UserRole.ARTISAN
        )
        self.assertFalse(user.is_approved)
        
        # Cambiar a admin
        user.role = UserRole.ADMIN
        user.save()
        
        self.assertTrue(user.is_approved)
        self.assertTrue(user.is_staff)


class CustomUserManagerTests(TestCase):
    """Tests para el CustomUserManager."""
    
    def test_create_user_requires_email(self):
        """Test: create_user requiere email."""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                email='',
                password='test123'
            )
    
    def test_create_superuser_must_be_admin(self):
        """Test: create_superuser debe tener role ADMIN."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='super@test.com',
                username='super1',
                password='super123',
                first_name='Super',
                last_name='User',
                role=UserRole.ARTISAN  # Esto debe fallar
            )
    
    def test_create_superuser_must_have_is_staff_true(self):
        """Test: create_superuser debe tener is_staff=True."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='super@test.com',
                username='super2',
                password='super123',
                first_name='Super',
                last_name='User',
                is_staff=False  # Esto debe fallar
            )
    
    def test_create_superuser_must_have_is_superuser_true(self):
        """Test: create_superuser debe tener is_superuser=True."""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='super@test.com',
                username='super3',
                password='super123',
                first_name='Super',
                last_name='User',
                is_superuser=False  # Esto debe fallar
            )

