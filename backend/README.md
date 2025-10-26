# MiTaller Backend - Django 5 + DRF

Backend del marketplace multi-vendor de artesanos, construido con Django 5 y Django REST Framework.

## ⚠️ IMPORTANTE: Nomenclatura Artists vs Artisans

Este proyecto diferencia entre **ARTISANS** (artesanos con taller - FOCO ACTUAL) y **ARTISTS** (artistas visuales/performers - modelo futuro).

**Lectura obligatoria:** [ARTISTS_VS_ARTISANS.md](docs/ARTISTS_VS_ARTISANS.md)

**Regla simple:**
- 🛠️ **Productos, pedidos, tienda** → usar `artisan` y `ArtisanProfile` (app `artisans`)
- 🎨 **Servicios, encargos** (futuro) → usar `artist` y `ArtistProfile` (app `artists`)

## 📋 Stack Tecnológico

- **Django 5.0.1** - Framework web
- **Django REST Framework 3.14.0** - API REST
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación (djangorestframework-simplejwt)
- **Pillow** - Procesamiento de imágenes
- **django-cors-headers** - Manejo de CORS

## 🚀 Configuración Inicial

### 1. Crear entorno virtual

```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita `.env` con tus valores:

```env
SECRET_KEY=tu-clave-secreta-generada
DEBUG=True
DATABASE_URL=postgresql://usuario:password@localhost:5432/mitaller_dev
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Levantar PostgreSQL con Docker

```bash
docker-compose up -d
```

### 5. Ejecutar migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Crear superusuario

```bash
python manage.py createsuperuser
```

### 7. Ejecutar servidor de desarrollo

```bash
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

## 📁 Estructura del Proyecto

```
backend/
├── config/                 # Configuración del proyecto Django
│   ├── __init__.py
│   ├── settings.py        # Configuración principal
│   ├── urls.py            # Rutas principales
│   ├── wsgi.py            # WSGI para deployment
│   └── asgi.py            # ASGI para async
├── accounts/              # App de usuarios y autenticación
├── artisans/              # App de perfiles de artesanos (FOCO ACTUAL)
├── artists/               # App de perfiles de artistas (FUTURO)
├── works/                 # App de obras/portfolio
├── shop/                  # App de productos para venta
├── orders/                # App de pedidos y compras
├── payments/              # App de pagos y Stripe Connect
├── admin_panel/           # App de panel administrativo
├── profiles/              # Base abstracta para perfiles
├── manage.py              # CLI de Django
├── requirements.txt       # Dependencias Python
├── env.example            # Ejemplo de variables de entorno
├── .gitignore            # Archivos ignorados por Git
└── docker-compose.yml     # PostgreSQL container
```

**⚠️ Nota importante:** El proyecto diferencia entre **Artisans** (artesanos con taller que venden productos) y **Artists** (artistas visuales/performers, modelo futuro). Ver [ARTISTS_VS_ARTISANS.md](docs/ARTISTS_VS_ARTISANS.md) para detalles.

## 🔑 Endpoints JWT Disponibles

- `POST /api/v1/auth/token/` - Obtener access y refresh token
- `POST /api/v1/auth/token/refresh/` - Renovar access token
- `POST /api/v1/auth/token/verify/` - Verificar token

## 📝 Configuraciones Importantes

### Django Settings (config/settings.py)

- **INSTALLED_APPS**: Incluye las 4 apps locales + DRF + CORS
- **DATABASES**: Configurado con PostgreSQL usando `dj-database-url`
- **REST_FRAMEWORK**: Autenticación JWT, paginación de 20 items
- **SIMPLE_JWT**: Access tokens de 1h, refresh tokens de 7 días con rotación
- **CORS**: Configurado para `http://localhost:3000` (frontend Next.js)
- **MEDIA_ROOT**: `/media/` para uploads de imágenes
- **STATIC_ROOT**: `/staticfiles/` para archivos estáticos

### CORS Configuration

Por defecto permite requests desde `http://localhost:3000`. Para producción, actualiza `CORS_ALLOWED_ORIGINS` en `.env`:

```env
CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

## 🔐 Seguridad

- ⚠️ **Cambiar `SECRET_KEY`** en producción usando una clave aleatoria
- ⚠️ **`DEBUG=False`** en producción
- ⚠️ Configurar `ALLOWED_HOSTS` con tus dominios de producción
- ⚠️ Usar HTTPS en producción
- ⚠️ Configurar variables de entorno seguras

## 👤 Custom User Model

✅ **Implementado** - Ver [USER_MODEL_GUIDE.md](accounts/USER_MODEL_GUIDE.md)

El proyecto usa un Custom User model simplificado:

- **Email como login** (no username)
- **2 roles**: ARTISAN (artesano) y ADMIN
- **Aprobación manual** para artesanos antes de vender
- **Compradores NO se registran** (compran como invitados)

### Crear usuarios

```bash
# Crear superusuario
DJANGO_SUPERUSER_PASSWORD=admin123 python manage.py createsuperuser \
  --email admin@mitaller.com \
  --username admin \
  --noinput

# El username es obligatorio y único para cada usuario
```

### Properties útiles del User

```python
user.is_artisan  # True si es artesano
user.is_admin    # True si es admin
user.can_sell    # True si puede vender (artesano aprobado o admin)
```

## 📦 Apps Implementadas

### ✅ Completadas

1. **accounts**: Sistema de autenticación con JWT
   - Custom User model (email como login)
   - Roles: ARTISAN, ADMIN
   - Registro y login de artesanos

2. **artisans**: Perfiles públicos de artesanos
   - ArtisanProfile con taller y ubicación
   - API pública para listados
   - Integración con Stripe Connect

3. **shop**: Productos para venta
   - Product model con precio y stock
   - API CRUD con permisos
   - Integración Cloudinary para imágenes

4. **orders**: Sistema de pedidos
   - Compras sin registro (guest checkout)
   - Reducción automática de stock
   - Vistas filtradas por artesano

5. **works**: Portfolio/obras artísticas
   - Work model para colecciones de imágenes
   - API pública
   - Cloudinary para galería

6. **payments**: Integración Stripe Connect
   - Onboarding de artesanos
   - Payment model para historial
   - Webhooks de Stripe

### 🔮 Futuras

7. **artists**: Perfiles de artistas (no artesanos)
   - Para artistas visuales/performers
   - Modelo de negocio diferente (servicios vs productos)
   - Ver [ARTISTS_VS_ARTISANS.md](docs/ARTISTS_VS_ARTISANS.md)

## 🧪 Testing

El proyecto incluye tests unitarios completos para el Custom User model.

```bash
# Ejecutar todos los tests
python manage.py test

# Ejecutar tests de accounts con verbose
python manage.py test accounts -v 2

# Ejecutar un test específico
python manage.py test accounts.tests.UserModelTests.test_artisan_approval
```

**Tests disponibles**:
- ✅ 18 tests para User model y CustomUserManager
- Cobertura completa de roles, aprobaciones y permisos

## 📄 Admin de Django

Accede al admin en `http://localhost:8000/admin/` con tu superusuario.

### Gestión de Artesanos

El admin incluye acciones personalizadas para aprobar artesanos:

1. **Filtros disponibles**: Role, Aprobación, Activo, Fecha de registro
2. **Búsqueda**: Por email, nombre o apellidos
3. **Acciones masivas**:
   - ✅ Aprobar artesanos seleccionados
   - ❌ Desaprobar artesanos seleccionados

Los artesanos necesitan aprobación manual antes de poder crear productos y vender.

## 🐳 Docker

El archivo `docker-compose.yml` ya está configurado para PostgreSQL. Para levantar toda la aplicación con Docker, se necesitará crear un `Dockerfile` (próximo paso).

## 📚 Recursos

- [Django 5 Docs](https://docs.djangoproject.com/en/5.0/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [PostgreSQL](https://www.postgresql.org/docs/)


# Developtment

```bash
cd /Users/marcelreig/Code/side-project/mitaller/backend
source venv/bin/activate
python manage.py runserver
```