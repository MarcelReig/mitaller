# 👤 Custom User Model - Guía de Uso

## 📝 Resumen

Custom User model simplificado para marketplace de artesanos con las siguientes características:

- ✅ **Email como identificador principal** (no username)
- ✅ **Solo 2 roles**: ARTISAN (artesano) y ADMIN
- ✅ **Aprobación manual** para artesanos antes de poder vender
- ✅ **Compradores NO se registran** (compran como invitados)

## 🏗️ Arquitectura del Modelo

### UserRole (TextChoices)

```python
class UserRole(models.TextChoices):
    ARTISAN = 'artisan', 'Artesano'
    ADMIN = 'admin', 'Administrador'
```

### User Model

**Campos principales:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `email` | EmailField | Identificador único para login |
| `username` | CharField | Nombre único para la URL del perfil (max 50 chars) |
| `first_name` | CharField | Nombre del usuario |
| `last_name` | CharField | Apellidos del usuario |
| `role` | CharField | ARTISAN o ADMIN |
| `is_approved` | BooleanField | Aprobación manual (solo artesanos) |
| `is_active` | BooleanField | Si el usuario está activo |
| `is_staff` | BooleanField | Acceso al admin de Django |
| `date_joined` | DateTimeField | Fecha de registro |
| `updated_at` | DateTimeField | Última actualización |

**Properties útiles:**

- `is_artisan`: Verifica si el usuario es artesano
- `is_admin`: Verifica si el usuario es admin
- `can_sell`: Verifica si puede vender (artesano aprobado o admin)

## 🚀 Uso en Código

### Crear un artesano

```python
from accounts.models import User, UserRole

# Crear artesano (por defecto NO aprobado)
artisan = User.objects.create_user(
    email='artisan@example.com',
    username='juan_artesano',
    password='secure_password',
    first_name='Juan',
    last_name='Pérez',
    role=UserRole.ARTISAN
)

# El artesano no puede vender hasta que sea aprobado
print(artisan.can_sell)  # False

# Aprobar artesano
artisan.is_approved = True
artisan.save()

print(artisan.can_sell)  # True
```

### Crear un admin

```python
# Crear admin (auto-aprobado, con permisos de staff)
admin = User.objects.create_user(
    email='admin@example.com',
    username='maria_admin',
    password='secure_password',
    first_name='María',
    last_name='González',
    role=UserRole.ADMIN
)

# Los admins se auto-aprueban y tienen permisos de staff
print(admin.is_approved)  # True
print(admin.is_staff)  # True
print(admin.can_sell)  # True
```

### Crear un superusuario (CLI)

```bash
cd backend
source venv/bin/activate

# Método interactivo
python manage.py createsuperuser

# Método no-interactivo
DJANGO_SUPERUSER_PASSWORD=tu_password python manage.py createsuperuser \
  --email admin@mitaller.com \
  --username admin \
  --noinput
```

### Verificar permisos en views

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_product(request):
    """Solo usuarios que pueden vender pueden crear productos."""
    
    if not request.user.can_sell:
        return Response(
            {'error': 'No tienes permiso para vender. Espera aprobación.'},
            status=403
        )
    
    # Lógica para crear producto...
    return Response({'message': 'Producto creado'})
```

### Filtrar artesanos pendientes de aprobación

```python
# Obtener artesanos pendientes de aprobación
pending_artisans = User.objects.filter(
    role=UserRole.ARTISAN,
    is_approved=False
)

# Obtener artesanos aprobados
approved_artisans = User.objects.filter(
    role=UserRole.ARTISAN,
    is_approved=True
)
```

## 🔧 Django Admin

### Acciones disponibles

En el admin de Django (`/admin/accounts/user/`), puedes:

1. **Ver lista de usuarios** con filtros por:
   - Role (ARTISAN / ADMIN)
   - Estado de aprobación
   - Estado activo
   - Fecha de registro

2. **Acciones masivas**:
   - ✅ **Aprobar artesanos seleccionados**: Aprueba múltiples artesanos de una vez
   - ❌ **Desaprobar artesanos seleccionados**: Revoca la aprobación

3. **Búsqueda** por email, nombre o apellidos

### Acceder al admin

```bash
# Iniciar servidor
python manage.py runserver

# Visitar: http://localhost:8000/admin/
# Login con: admin@mitaller.com / tu_password
```

## 🔐 Autenticación JWT

El modelo está configurado con Django REST Framework SimpleJWT:

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'USER_ID_FIELD': 'id',
    # ...
}
```

### Endpoints JWT

```bash
# Obtener tokens
POST /api/v1/auth/token/
{
    "email": "artisan@example.com",
    "password": "secure_password"
}

# Refresh token
POST /api/v1/auth/token/refresh/
{
    "refresh": "your_refresh_token"
}

# Verificar token
POST /api/v1/auth/token/verify/
{
    "token": "your_access_token"
}
```

## 📊 Workflow de Registro de Artesanos

1. **Artesano se registra** → `is_approved=False`
2. **Admin revisa perfil** en Django Admin
3. **Admin aprueba** → `is_approved=True`
4. **Artesano puede crear productos y vender**

## ⚠️ Consideraciones Importantes

1. **Los compradores NO se registran**: Las órdenes de compra se crean con datos de invitado (email, nombre, dirección de envío) sin crear cuentas.

2. **Cambio de role**: Si cambias un ARTISAN a ADMIN, se auto-aprobará y obtendrá permisos de staff automáticamente.

3. **Migraciones**: Este modelo está configurado como `AUTH_USER_MODEL = 'accounts.User'` en `settings.py`. Debe estar configurado **ANTES** de la primera migración.

4. **Password reset**: Necesitarás implementar vistas de reset de contraseña usando el email como identificador.

## 🧪 Testing

```python
from django.test import TestCase
from accounts.models import User, UserRole

class UserModelTests(TestCase):
    
    def test_create_artisan(self):
        """Test crear artesano sin aprobación."""
        user = User.objects.create_user(
            email='test@example.com',
            password='test123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.role, UserRole.ARTISAN)
        self.assertFalse(user.is_approved)
        self.assertFalse(user.can_sell)
    
    def test_create_admin(self):
        """Test crear admin auto-aprobado."""
        admin = User.objects.create_user(
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role=UserRole.ADMIN
        )
        self.assertTrue(admin.is_approved)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.can_sell)
    
    def test_artisan_approval(self):
        """Test aprobación de artesano."""
        artisan = User.objects.create_user(
            email='artisan@example.com',
            password='pass123',
            first_name='Art',
            last_name='Isan'
        )
        self.assertFalse(artisan.can_sell)
        
        artisan.is_approved = True
        artisan.save()
        
        self.assertTrue(artisan.can_sell)
```

## 🔗 Próximos Pasos

1. **Crear serializers** para registro y perfil de usuario
2. **Implementar endpoints** de registro/login/perfil
3. **Agregar validaciones** de email único
4. **Implementar notificaciones** por email cuando un artesano sea aprobado
5. **Crear modelo de perfil de artesano** (en app `artists/`) vinculado con `OneToOneField` al User

---

**Fecha de creación**: 2025-10-11  
**Django Version**: 5.0.1  
**DRF Version**: 3.14.0

