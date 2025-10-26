# App Artisans - Perfiles Públicos de Artesanos

## ⚠️ IMPORTANTE: Nomenclatura

Esta app se llama **`artisans`** y gestiona **artesanos con taller físico** que venden productos tangibles.

**NO confundir con `artists`** (modelo futuro para artistas visuales/performers).  
Ver [ARTISTS_VS_ARTISANS.md](../docs/ARTISTS_VS_ARTISANS.md) para la diferencia completa.

## Descripción General

La app `artisans` gestiona los **perfiles públicos de artesanos** en la plataforma MiTaller. Cada artesano registrado en la plataforma (usuarios con `role=ARTISAN`) tiene automáticamente un perfil público que los compradores pueden ver.

## Arquitectura

### Relación User ↔ ArtisanProfile

```
User (accounts)           ArtisanProfile (artisans)
┌─────────────┐          ┌──────────────────┐
│ id          │──1:1────→│ user_id          │
│ email       │          │ slug (único)     │
│ username    │          │ display_name     │
│ role        │          │ craft_type       │
│ is_approved │          │ location         │
└─────────────┘          │ bio              │
                         │ avatar           │
                         │ instagram        │
                         │ stripe_account_id│
                         └──────────────────┘
```

**Relación 1:1:**
- Un `User` con `role=ARTISAN` tiene **un** `ArtisanProfile`
- Los usuarios `ADMIN` **no tienen** `ArtisanProfile`
- La relación se define con `OneToOneField` con `related_name='artisan_profile'`

### Creación Automática con Signals

El perfil de artesano se crea **automáticamente** cuando se registra un nuevo usuario artesano:

```python
# En artisans/signals.py
@receiver(post_save, sender=User)
def create_artisan_profile(sender, instance, created, **kwargs):
    """
    Signal que detecta cuando se crea un User con role=ARTISAN
    y crea automáticamente su ArtisanProfile.
    """
```

**Flujo de creación:**

1. Usuario se registra → `POST /api/v1/auth/register/`
2. Se crea `User` con `role=ARTISAN`
3. Signal `post_save` detecta la creación
4. Se crea `ArtisanProfile` con valores por defecto:
   - `slug`: generado desde `username`
   - `display_name`: `get_full_name()` o `username`
   - `craft_type`: `OTHER` (artesano lo completa después)
   - `location`: `OTHER` (artesano lo completa después)

## Modelos

### 1. CraftType (TextChoices)

Define los tipos de artesanía disponibles:

| Valor | Label | Descripción |
|-------|-------|-------------|
| `ceramics` | Cerámica | Alfarería, cerámica artística |
| `jewelry` | Joyería | Bisutería, orfebrería |
| `leather` | Marroquinería | Trabajos en cuero |
| `textiles` | Textiles | Tejidos, bordados |
| `wood` | Madera | Carpintería artística |
| `glass` | Vidrio | Soplado de vidrio, vitrales |
| `other` | Otro | Otros tipos de artesanía |

### 2. MenorcaLocation (TextChoices)

Define los municipios de Menorca donde pueden ubicarse los talleres:

| Valor | Label |
|-------|-------|
| `mao` | Maó |
| `ciutadella` | Ciutadella |
| `alaior` | Alaior |
| `es_castell` | Es Castell |
| `ferreries` | Ferreries |
| `es_mercadal` | Es Mercadal |
| `es_migjorn` | Es Migjorn Gran |
| `sant_lluis` | Sant Lluís |
| `other` | Otro |

### 3. ArtisanProfile (Model)

Perfil público del artesano con toda la información visible para compradores.

#### Campos Principales

**Identificación:**
- `user`: OneToOneField a User (CASCADE)
- `slug`: URL única del artesano (`/artistas/{slug}/`)
- `display_name`: Nombre público (max 150 chars)

**Información del Taller:**
- `bio`: Biografía/descripción (TextField, opcional)
- `craft_type`: Tipo de artesanía (choices de CraftType)
- `location`: Ubicación en Menorca (choices de MenorcaLocation)

**Imágenes:**
- `avatar`: Foto de perfil (`artisans/avatars/`)
- `cover_image`: Imagen de portada (`artisans/covers/`)

**Contacto y Redes:**
- `website`: Sitio web personal (opcional)
- `instagram`: Usuario de Instagram sin @ (opcional)
- `phone`: Teléfono de contacto (opcional)

**Stripe Connect:**
- `stripe_account_id`: ID de cuenta Stripe (para pagos futuros)
- `stripe_onboarding_completed`: Booleano de onboarding completado

**Estadísticas Públicas:**
- `total_works`: Número de obras en portfolio
- `total_products`: Número de productos en venta
- `is_featured`: Si está destacado en la home

**Timestamps:**
- `created_at`: Fecha de creación (auto)
- `updated_at`: Última actualización (auto)

#### Properties y Métodos

```python
# Property: Ubicación completa formateada
@property
def full_location(self) -> str:
    return f'Taller en {self.get_location_display()}, Menorca'
    # Ejemplo: "Taller en Maó, Menorca"

# Property: URL completa de Instagram
@property
def instagram_url(self) -> str | None:
    if self.instagram:
        return f'https://instagram.com/{self.instagram}'
    return None

# Método: URL pública del perfil
def get_absolute_url(self) -> str:
    return f'/artistas/{self.slug}/'
    # Ejemplo: "/artistas/juan-ceramista/"

# Override save: Auto-genera slug único
def save(self, *args, **kwargs):
    if not self.slug:
        # Genera slug desde username
        # Si hay conflicto, agrega -1, -2, etc.
```

#### Índices y Ordenamiento

**Índices en BD:**
- `slug` (búsquedas por URL)
- `location` (filtros por ubicación)
- `craft_type` (filtros por tipo)
- `[-is_featured, -created_at]` (ordenamiento optimizado)

**Ordenamiento por defecto:**
```python
ordering = ['-is_featured', '-created_at']
```
1. Artesanos destacados primero
2. Luego por fecha de creación (más recientes primero)

## API REST

### Endpoints Públicos

La API de artesanos es **pública** (sin autenticación requerida):

```
GET /api/v1/artisans/              → Lista de artesanos
GET /api/v1/artisans/{slug}/       → Detalle de un artesano
```

### ViewSet: ArtisanProfileViewSet

```python
class ArtisanProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ArtisanProfile.objects.all()
    lookup_field = 'slug'  # Buscar por slug, no por ID
    permission_classes = [AllowAny]  # Acceso público
```

**Características:**

- **Solo lectura** (`ReadOnlyModelViewSet`)
- **Lookup por slug** (no por ID numérico)
- **Sin autenticación** requerida
- **Búsqueda de texto** en `display_name`, `bio`, `craft_type`, `location`
- **Filtros exactos** por `craft_type`, `location`, `is_featured`
- **Ordenamiento** por `created_at`, `display_name`

#### Ejemplos de Uso

**Listar todos los artesanos:**
```http
GET /api/v1/artisans/
```

**Buscar ceramistas:**
```http
GET /api/v1/artisans/?search=cerámica
```

**Filtrar por tipo de artesanía:**
```http
GET /api/v1/artisans/?craft_type=ceramics
```

**Filtrar por ubicación:**
```http
GET /api/v1/artisans/?location=mao
```

**Solo artesanos destacados:**
```http
GET /api/v1/artisans/?is_featured=true
```

**Ordenar por nombre:**
```http
GET /api/v1/artisans/?ordering=display_name
```

**Ver perfil específico:**
```http
GET /api/v1/artisans/juan-ceramista/
```

### Serializers

#### ArtisanProfileListSerializer

Usado en **listados** (`GET /api/v1/artisans/`):

```json
{
  "slug": "juan-ceramista",
  "display_name": "Juan Pérez",
  "craft_type": "ceramics",
  "location": "mao",
  "avatar": "/media/artisans/avatars/juan.jpg",
  "total_works": 15,
  "total_products": 8,
  "is_featured": true
}
```

**Campos incluidos:** Solo info esencial para tarjetas/previews.

#### ArtisanProfileSerializer

Usado en **detalles** (`GET /api/v1/artisans/{slug}/`):

```json
{
  "id": 1,
  "user": {
    "email": "juan@example.com",
    "username": "juan_ceramista"
  },
  "slug": "juan-ceramista",
  "display_name": "Juan Pérez",
  "bio": "Artesano ceramista con 20 años de experiencia...",
  "craft_type": "ceramics",
  "location": "mao",
  "avatar": "/media/artisans/avatars/juan.jpg",
  "cover_image": "/media/artisans/covers/juan-cover.jpg",
  "website": "https://juanceramista.com",
  "instagram": "juan_ceramista",
  "instagram_url": "https://instagram.com/juan_ceramista",
  "full_location": "Taller en Maó, Menorca",
  "total_works": 15,
  "total_products": 8,
  "is_featured": true,
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Campos incluidos:** Toda la información pública del artesano.

## Admin de Django

### ArtisanProfileAdmin

Panel de administración para gestionar perfiles:

**Listado:**
- Columnas: `display_name`, `user`, `craft_type`, `location`, `is_featured`, `total_works`, `total_products`, `created_at`

**Filtros:**
- `craft_type` (Cerámica, Joyería, etc.)
- `location` (Maó, Ciutadella, etc.)
- `is_featured` (Destacado sí/no)
- `stripe_onboarding_completed` (Stripe completado sí/no)

**Búsqueda:**
- Por `display_name`, `user__email`, `user__username`, `slug`

**Campos readonly:**
- `slug` (auto-generado)
- `created_at`, `updated_at` (timestamps)
- `total_works`, `total_products` (calculados por otras apps)
- `stripe_account_id` (gestionado por Stripe)

**Acciones personalizadas:**

1. **Destacar artesanos:** Marca `is_featured=True` en seleccionados
2. **Quitar destaque:** Marca `is_featured=False` en seleccionados

**Fieldsets organizados:**
- Información Básica (user, display_name, slug)
- Taller (craft_type, location, bio)
- Imágenes (avatar, cover_image)
- Contacto y Redes (website, instagram, phone)
- Stripe (stripe_account_id, stripe_onboarding_completed)
- Estadísticas (total_works, total_products, is_featured)
- Metadata (created_at, updated_at)

## Flujo Completo de Uso

### 1. Registro de Artesano

```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "email": "maria@example.com",
  "username": "maria_joyera",
  "password": "Secure123",
  "password_confirm": "Secure123",
  "first_name": "María",
  "last_name": "García"
}
```

**Respuesta:**
```json
{
  "id": 5,
  "email": "maria@example.com",
  "username": "maria_joyera",
  "first_name": "María",
  "last_name": "García",
  "role": "artisan",
  "is_approved": false,
  "can_sell": false
}
```

**Behind the scenes:**
1. Se crea `User` con `role=ARTISAN`
2. Signal detecta la creación
3. Se crea `ArtistProfile` automáticamente:
   - `slug`: `"maria_joyera"`
   - `display_name`: `"María García"`
   - `craft_type`: `"other"`
   - `location`: `"other"`

### 2. Acceso al Perfil Público

Los compradores pueden ver el perfil inmediatamente:

```http
GET /api/v1/artisans/maria-joyera/
```

**Respuesta:**
```json
{
  "id": 5,
  "user": {
    "email": "maria@example.com",
    "username": "maria_joyera"
  },
  "slug": "maria-joyera",
  "display_name": "María García",
  "bio": "",
  "craft_type": "other",
  "location": "other",
  "avatar": null,
  "cover_image": null,
  "website": null,
  "instagram": null,
  "instagram_url": null,
  "full_location": "Taller en Otro, Menorca",
  "total_works": 0,
  "total_products": 0,
  "is_featured": false,
  "created_at": "2025-01-20T14:30:00Z"
}
```

### 3. Actualización del Perfil (futuro)

En futuras iteraciones, los artesanos podrán actualizar su perfil:

```http
PATCH /api/v1/artisans/me/
Authorization: Bearer <token>
Content-Type: application/json

{
  "craft_type": "jewelry",
  "location": "ciutadella",
  "bio": "Joyera artesanal especializada en plata menorquina",
  "instagram": "maria_joyera_menorca",
  "phone": "+34 971 123 456"
}
```

**Nota:** Este endpoint aún no está implementado. Por ahora, los artesanos pueden solicitar cambios al admin.

## Testing

Ejecutar los tests de la app artisans:

```bash
python manage.py test artisans
```

**Tests incluidos:**
1. ✅ Creación automática de ArtisanProfile al registrar artesano
2. ✅ Properties del modelo (`full_location`, `can_receive_payments`, etc.)
3. ✅ Unicidad de slugs
4. ✅ Admins NO reciben ArtisanProfile
5. ✅ Ordenamiento del queryset (destacados primero)
6. ✅ API pública funcional

## Integración con Otras Apps

### Con `accounts`

- Depende de `User` model
- Usa `UserRole.ARTISAN` para filtrar
- El signal escucha creaciones de `User`

### Con `works` (futuro)

- El campo `total_works` se actualizará cuando se creen/eliminen obras
- Signal desde `works` app incrementará/decrementará contador

### Con `shop` (futuro)

- El campo `total_products` se actualizará con productos en venta
- Signal desde `shop` app gestionará el contador

### Con Stripe Connect (futuro)

- Los campos `stripe_account_id` y `stripe_onboarding_completed`
- Permitirán pagos directos a cuentas de artesanos
- Onboarding gestionado por flow de Stripe

## Próximos Pasos

1. **Endpoint de actualización de perfil** (`PATCH /api/v1/artisans/me/`)
2. **Upload de imágenes** (avatar y cover_image con Cloudinary)
3. **Mejoras en onboarding de Stripe Connect**
4. **Dashboard de artesano** con estadísticas de ventas
5. **Panel de artesano** en frontend para gestionar perfil
6. **Página pública** `/artesanos/{slug}/` en Next.js

## Migraciones

```bash
# Generar migraciones
python manage.py makemigrations artisans

# Aplicar migraciones
python manage.py migrate artisans
```

**Migración inicial:** `0001_initial.py`
- Crea tabla `artisans_artisanprofile`
- Define índices optimizados
- Establece relación 1:1 con User

## Dependencias

```txt
# En requirements.txt
django-filter==23.5  # Para filtros en ViewSet
Pillow==10.2.0      # Para ImageField (avatar, cover_image)
```

## Configuración Necesaria

### En `config/settings.py`

```python
INSTALLED_APPS = [
    # ...
    'artists',  # App de perfiles de artesanos
    'django_filters',  # Para filtros en API
]

# Media files (para imágenes de artesanos)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### En `config/urls.py`

```python
urlpatterns = [
    path('api/v1/artisans/', include('artisans.urls')),
]

# Servir media files en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## Seguridad y Permisos

- **API pública:** Cualquiera puede ver perfiles (sin autenticación)
- **Solo lectura:** No se pueden crear/editar perfiles via API pública
- **Creación automática:** Solo via signal al registrar artesano
- **Actualización:** Solo via admin de Django (por ahora)
- **Email visible:** El email del artesano es visible en la API pública (decisión de negocio para contacto)

## Notas de Implementación

### ¿Por qué OneToOneField?

- Un artesano tiene **exactamente un** perfil público
- No tiene sentido tener múltiples perfiles
- Simplifica queries: `user.artist_profile` (no `user.artist_profiles.first()`)

### ¿Por qué Signals?

- Desacopla la creación del perfil del registro de usuario
- La app `accounts` no necesita conocer `artists`
- Fácil de deshabilitar/modificar sin tocar `accounts`
- Sigue principio de responsabilidad única

### ¿Por qué slug en vez de ID?

- URLs amigables: `/artesanos/juan-ceramista/` vs `/artesanos/1/`
- SEO mejorado
- Más profesional y memorable
- Se auto-genera desde username

### ¿Por qué API pública?

- Los compradores necesitan ver artesanos **sin registrarse**
- El modelo de negocio es B2C (compradores son invitados)
- Solo artesanos y admins tienen cuenta
- Permite crawlers/SEO indexar perfiles

---

**Desarrollado para MiTaller** - Marketplace de artesanía menorquina

