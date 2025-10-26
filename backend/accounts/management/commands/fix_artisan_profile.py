"""
Management command para verificar y crear ArtisanProfile faltantes.
Útil cuando un usuario ARTISAN fue creado antes de implementar las señales.

Uso:
    python manage.py fix_artisan_profile
    python manage.py fix_artisan_profile --email user@example.com
"""
from django.core.management.base import BaseCommand
from accounts.models import User, UserRole
from artisans.models import ArtisanProfile, CraftType, MenorcaLocation


class Command(BaseCommand):
    help = 'Verifica y crea ArtisanProfile para usuarios ARTISAN que no lo tengan'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email del usuario específico a verificar',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        
        if email:
            # Verificar usuario específico
            try:
                user = User.objects.get(email=email)
                self.check_and_fix_user(user)
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'❌ Usuario con email {email} no encontrado')
                )
        else:
            # Verificar todos los usuarios ARTISAN
            artisan_users = User.objects.filter(role=UserRole.ARTISAN)
            
            if not artisan_users.exists():
                self.stdout.write(
                    self.style.WARNING('⚠️  No hay usuarios con role=ARTISAN')
                )
                return
            
            self.stdout.write(
                self.style.SUCCESS(f'🔍 Verificando {artisan_users.count()} artesanos...\n')
            )
            
            fixed_count = 0
            for user in artisan_users:
                if self.check_and_fix_user(user):
                    fixed_count += 1
            
            if fixed_count > 0:
                self.stdout.write(
                    self.style.SUCCESS(f'\n✅ {fixed_count} perfil(es) creado(s)')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS('\n✅ Todos los artesanos tienen perfil')
                )

    def check_and_fix_user(self, user: User) -> bool:
        """
        Verifica y corrige el perfil de un usuario.
        Retorna True si se creó un perfil, False si ya existía.
        """
        # Mostrar info del usuario
        self.stdout.write(f'\n📧 {user.email}')
        self.stdout.write(f'   Role: {user.get_role_display()}')
        self.stdout.write(f'   Username: {user.username}')
        self.stdout.write(f'   Aprobado: {"✅" if user.is_approved else "❌"}')
        
        # Verificar si ya tiene perfil
        if hasattr(user, 'artisan_profile'):
            profile = user.artisan_profile
            self.stdout.write(
                self.style.SUCCESS(
                    f'   ✅ Ya tiene perfil: {profile.display_name} (@{profile.slug})'
                )
            )
            return False
        
        # Verificar que sea artesano
        if user.role != UserRole.ARTISAN:
            self.stdout.write(
                self.style.WARNING(
                    f'   ⚠️  No es artesano (role={user.get_role_display()})'
                )
            )
            return False
        
        # Crear perfil
        self.stdout.write(
            self.style.WARNING('   ❌ No tiene ArtisanProfile. Creando...')
        )
        
        profile = ArtisanProfile.objects.create(
            user=user,
            slug=user.username,
            display_name=user.get_full_name() or user.username,
            craft_type=CraftType.OTHER,
            location=MenorcaLocation.OTHER,
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'   ✅ Perfil creado: {profile.display_name} (@{profile.slug})'
            )
        )
        
        return True

