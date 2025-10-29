# 🎨 MiTaller.art - Snapshot del Proyecto para Claude Web

> **Última actualización:** 2025-10-28
> **Versión del snapshot:** 2.0.0
> **Estado del proyecto:** En desarrollo activo (Fase 3 - Frontend en progreso)
> **Tipo de proyecto:** Monorepo (Backend Django + Frontend Next.js)

## 📝 Changelog del Snapshot

### v2.0.0 (2025-10-28) - Enfoque Monorepo

**Nuevas secciones añadidas:**
- ✅ **Arquitectura del Monorepo:** Árbol completo del proyecto (2 niveles)
- ✅ **Comunicación FE ↔ BE:** Diagrama detallado del flujo JWT + refresh token
- ✅ **Configuración de Axios:** Código de interceptors y manejo de tokens
- ✅ **Tabla de Endpoints:** Mapeo completo de endpoints con su consumo en frontend
- ✅ **Verificación de Tipos:** Comparación backend serializers vs frontend types
- ✅ **Estrategia de Deploy:** Railway (backend) + Vercel (frontend) separados
- ✅ **Decisiones Arquitectónicas del Monorepo:** 5 decisiones clave con justificación
- ✅ **Checklist de Consistencia:** Proceso para verificar sync FE/BE semanalmente

**Mejoras:**
- 🔄 Archivos frecuentes ahora separados por módulo (Backend/Frontend)
- 🔄 Re-sync crítico destacado para tipos TypeScript
- 🔄 Errores comunes a detectar en inconsistencias FE/BE

**Estado de verificación:**
- ✅ Tipos verificados y alineados (User, Artisan, Work, Product, Order)
- ✅ Endpoints documentados con mapeo a API services del frontend
- ❌ NO se detectaron inconsistencias entre frontend y backend

### v1.0.0 (2025-10-28) - Snapshot Inicial

- Catálogo de 91 archivos representativos
- Resumen ejecutivo del proyecto
- Modelo de datos simplificado
- Flujos críticos (3 principales)
- Decisiones técnicas de features

---

## 🏗️ ARQUITECTURA DEL MONOREPO

### Estructura Simplificada (2 niveles)

```
mitaller/
├── 📁 backend/                    # Django REST API
│   ├── accounts/                  # Custom User + Auth JWT
│   ├── artisans/                  # Perfiles de artesanos
│   ├── works/                     # Portfolio (obras)
│   ├── shop/                      # Productos para venta
│   ├── orders/                    # Sistema de pedidos
│   ├── payments/                  # Stripe Connect
│   ├── admin_panel/               # Panel administrativo
│   ├── profiles/                  # Base abstract models
│   ├── config/                    # Settings Django
│   ├── docs/                      # Docs específicas backend
│   ├── scripts/                   # Utilidades y scripts
│   ├── tests/                     # Tests unitarios
│   ├── requirements.txt           # Dependencias Python
│   ├── docker-compose.yml         # PostgreSQL container
│   └── manage.py
│
├── 📁 frontend/                   # Next.js 15 App Router
│   ├── src/
│   │   ├── app/                   # Routes (App Router)
│   │   │   ├── (public)/          # Rutas públicas
│   │   │   ├── (dashboard)/       # Dashboard artesano (protegido)
│   │   │   └── (auth)/            # Login/Registro
│   │   ├── components/            # Componentes React
│   │   │   ├── ui/                # shadcn/ui base
│   │   │   ├── artisans/          # Artesanos
│   │   │   ├── works/             # Portfolio
│   │   │   ├── products/          # Tienda
│   │   │   ├── layout/            # Layout (Navbar, Footer)
│   │   │   └── dashboard/         # Dashboard UI
│   │   ├── stores/                # Zustand state management
│   │   │   ├── authStore.ts       # Autenticación global
│   │   │   └── cartStore.ts       # Carrito de compras
│   │   ├── lib/                   # Utilities
│   │   │   ├── axios.ts           # HTTP client configurado
│   │   │   ├── cloudinary.ts      # Signed uploads
│   │   │   └── api/               # API services
│   │   └── types/                 # TypeScript definitions
│   │       ├── user.ts            # User, AuthResponse
│   │       ├── artisan.ts         # Artisan types
│   │       ├── work.ts            # Work types
│   │       ├── product.ts         # Product types
│   │       └── order.ts           # Order types
│   ├── public/                    # Imágenes estáticas
│   ├── docs/                      # Docs específicas frontend
│   ├── package.json               # Dependencias npm
│   ├── tsconfig.json              # Config TypeScript
│   ├── next.config.ts             # Config Next.js
│   └── tailwind.config.ts         # Config Tailwind
│
├── 📁 docs/                       # Documentación general
│   ├── architecture/              # Diseño técnico
│   ├── auth/                      # Sistema JWT completo
│   ├── features/                  # Features específicas
│   ├── troubleshooting/           # Problemas resueltos
│   ├── phases/                    # Documentación por fases
│   ├── maintenance/               # Refactorización/limpieza
│   └── README.md                  # Índice de docs
│
├── 📄 README.md                   # Overview del proyecto
├── 📄 ROADMAP.md                  # Plan de desarrollo
├── 📄 START_HERE.md               # Guía rápida de inicio
├── 📄 CONTEXT_FOR_CLAUDE.md       # Este archivo (snapshot)
├── 📄 .cursorrules                # Convenciones de código
└── 📄 .gitignore                  # Archivos ignorados
```

**Características clave:**
- ✅ **Monorepo separado** (no monorepo tool como Turborepo/Nx)
- ✅ Backend y frontend **completamente independientes**
- ✅ Comunicación vía **REST API** en `/api/v1/`
- ✅ Deploy **separado** (Railway + Vercel)
- ✅ Base de datos **PostgreSQL** en Docker (desarrollo)

---

## 🔄 COMUNICACIÓN FRONTEND ↔ BACKEND

### Protocolo: REST API

**Backend:** Django REST Framework expone endpoints en `/api/v1/`
**Frontend:** Next.js consume API vía Axios con interceptors

### Flujo de Autenticación (JWT)

```
┌─────────────┐                    ┌─────────────┐
│   FRONTEND  │                    │   BACKEND   │
│  (Next.js)  │                    │   (Django)  │
└─────────────┘                    └─────────────┘
      │                                    │
      │  POST /api/v1/auth/login/          │
      │  { email, password }               │
      ├───────────────────────────────────>│
      │                                    │
      │  200 OK                            │
      │  { access, refresh, user }         │
      │<───────────────────────────────────┤
      │                                    │
      │  Guarda tokens en cookies:         │
      │  - token (1h)                      │
      │  - refresh_token (7 días)          │
      │                                    │
      │  GET /api/v1/artisans/             │
      │  Header: Authorization: Bearer {token}
      ├───────────────────────────────────>│
      │                                    │
      │  200 OK { results: [...] }         │
      │<───────────────────────────────────┤
      │                                    │
      │  (Token expira después de 1h)      │
      │                                    │
      │  GET /api/v1/products/             │
      │  Header: Authorization: Bearer {expired_token}
      ├───────────────────────────────────>│
      │                                    │
      │  401 Unauthorized                  │
      │<───────────────────────────────────┤
      │                                    │
      │  Interceptor detecta 401           │
      │  POST /api/v1/auth/token/refresh/  │
      │  { refresh: refresh_token }        │
      ├───────────────────────────────────>│
      │                                    │
      │  200 OK                            │
      │  { access: new_token, refresh: new_refresh }
      │<───────────────────────────────────┤
      │                                    │
      │  Actualiza cookies                 │
      │  Reintenta request original        │
      │  GET /api/v1/products/             │
      │  Header: Authorization: Bearer {new_token}
      ├───────────────────────────────────>│
      │                                    │
      │  200 OK { results: [...] }         │
      │<───────────────────────────────────┤
```

### Configuración de Axios (frontend/src/lib/axios.ts)

**Features clave:**
- ✅ **Base URL dinámica:** `process.env.NEXT_PUBLIC_API_URL` (localhost en dev, Railway en prod)
- ✅ **JWT automático:** Interceptor añade `Authorization: Bearer {token}` en cada request
- ✅ **Refresh automático:** Si recibe 401, intenta refresh y reintenta request original
- ✅ **Manejo de errores:** Toast notifications con mensajes de error
- ✅ **Cookies seguras:** Tokens guardados en cookies (no localStorage)

**Código simplificado:**
```typescript
// frontend/src/lib/axios.ts
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:8000
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: añadir JWT
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: refresh token si 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh token
      const refreshToken = Cookies.get('refresh_token');
      const { data } = await axios.post('/api/v1/auth/token/refresh/', {
        refresh: refreshToken,
      });

      // Actualizar tokens
      Cookies.set('token', data.access);
      Cookies.set('refresh_token', data.refresh);

      // Reintentar request original
      error.config.headers.Authorization = `Bearer ${data.access}`;
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Endpoints Principales

| Módulo | Endpoints | Frontend consume en |
|--------|-----------|---------------------|
| **Auth** | `POST /api/v1/auth/login/`<br>`POST /api/v1/auth/register/`<br>`POST /api/v1/auth/logout/`<br>`GET /api/v1/auth/me/`<br>`POST /api/v1/auth/token/refresh/` | `stores/authStore.ts`<br>`app/(auth)/*/page.tsx` |
| **Artisans** | `GET /api/v1/artisans/`<br>`GET /api/v1/artisans/{slug}/`<br>`POST /api/v1/artisans/`<br>`PUT /api/v1/artisans/{slug}/` | `lib/api/artisans.ts`<br>`app/(public)/artesanos/**` |
| **Works** | `GET /api/v1/works/`<br>`POST /api/v1/works/`<br>`PUT /api/v1/works/{id}/`<br>`DELETE /api/v1/works/{id}/` | `lib/api/works.ts`<br>`app/(dashboard)/dashboard/obras/**` |
| **Products** | `GET /api/v1/shop/products/`<br>`POST /api/v1/shop/products/`<br>`GET /api/v1/shop/cloudinary-signature/` | `components/products/**`<br>`app/(dashboard)/dashboard/productos/**` |
| **Orders** | `POST /api/v1/orders/`<br>`GET /api/v1/orders/me/` | `components/checkout/**` |
| **Payments** | `POST /api/v1/payments/create-checkout/`<br>`POST /api/v1/payments/webhook/` | `lib/stripe.ts` |
| **Admin** | `GET /api/v1/admin/artisans/pending/`<br>`POST /api/v1/admin/artisans/{id}/approve/` | `lib/api/admin.ts`<br>`app/(dashboard)/admin/**` |

### Consistencia de Tipos Frontend ↔ Backend

**✅ TIPOS VERIFICADOS Y ALINEADOS**

Comparación User type (ejemplo):

**Backend (accounts/serializers.py):**
```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'is_approved', 'is_active', 'can_sell',
            'has_artisan_profile', 'artisan_slug', 'artisan_profile',
            'date_joined',
        )
```

**Frontend (types/user.ts):**
```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_approved?: boolean;
  is_active: boolean;
  can_sell?: boolean;
  has_artisan_profile?: boolean;
  artisan_slug?: string | null;
  artisan_profile?: ArtisanProfile;
  date_joined?: string;
}
```

**✅ Campos coinciden perfectamente**

Mismo proceso de verificación aplicado a:
- ✅ Artisan types (artisan.ts ↔ artisans/serializers.py)
- ✅ Work types (work.ts ↔ works/serializers.py)
- ✅ Product types (product.ts ↔ shop/serializers.py)
- ✅ Order types (order.ts ↔ orders/serializers.py)

**❌ NO SE DETECTARON INCONSISTENCIAS**

---

## 🚀 ESTRATEGIA DE DEPLOY (SEPARADO)

### Backend → Railway

**Config:**
- **Servicio:** Django REST API
- **Base de datos:** PostgreSQL (Railway addon)
- **Variables de entorno:**
  - `SECRET_KEY`, `DATABASE_URL`
  - `CLOUDINARY_*`, `STRIPE_*`
  - `CORS_ALLOWED_ORIGINS=https://mitaller.art`
  - `DEBUG=False`, `ALLOWED_HOSTS=api.mitaller.art`
- **Buildpack:** Python (requirements.txt)
- **Start command:** `gunicorn config.wsgi:application`
- **Port:** 8000
- **Domain:** `api.mitaller.art` (custom domain)

### Frontend → Vercel

**Config:**
- **Framework:** Next.js 15
- **Build command:** `npm run build`
- **Output directory:** `.next`
- **Variables de entorno:**
  - `NEXT_PUBLIC_API_URL=https://api.mitaller.art`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx`
- **Domain:** `mitaller.art` (custom domain)

### Ventajas del Deploy Separado

1. **Escalabilidad independiente:** Backend puede escalar separado del frontend
2. **Tecnologías específicas:** Railway optimizado para Django, Vercel para Next.js
3. **Costos:** Next.js en Vercel es gratis (hobby plan), Django en Railway ~$5/mes
4. **CI/CD:** Deploy automático en cada push (Railway: main branch, Vercel: production)

### Desarrollo Local

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python manage.py runserver  # http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev  # http://localhost:3000
```

**Comunicación local:** Frontend apunta a `http://localhost:8000` vía `NEXT_PUBLIC_API_URL`

---

## 📋 RESUMEN EJECUTIVO (300 palabras)

**MiTaller.art** es un marketplace SaaS B2C para artesanos menorquines que venden productos artesanales físicos (cerámica, joyería, madera, textiles, etc.). El proyecto conecta tradición artesanal con tecnología moderna.

### Stack Tecnológico

**Backend (Django REST API):**
- Django 5.2.7 + Django REST Framework 3.16.1
- PostgreSQL 15 (base de datos)
- JWT authentication (djangorestframework-simplejwt)
- Cloudinary para gestión de imágenes
- Stripe Connect para pagos marketplace (comisión 10%)
- Sentry para monitoreo de errores
- Deploy: Railway

**Frontend (Next.js 15):**
- Next.js 15.5.4 con App Router y React 19
- TypeScript strict mode
- Tailwind CSS 4 + shadcn/ui (componentes)
- Zustand para state management (auth + cart)
- TanStack Query para data fetching
- Axios para HTTP requests
- Cloudinary para uploads directos
- Deploy: Vercel

### Arquitectura

**Patrón:** Monorepo con backend y frontend separados
- Backend: RESTful API versionada (`/api/v1/`)
- Frontend: Server Components por defecto, Client Components solo para interactividad
- Auth: JWT con access token (1h) y refresh token (7 días con rotación)
- Imágenes: Cloudinary con signed uploads desde cliente
- Pagos: Stripe Connect Express (marketplace model)

**Modelo de Negocio:**
- Comisión fija: 10% por venta (configurable en settings.py)
- Aprobación manual de artesanos antes de vender
- Compradores sin registro (guest checkout)
- Artesanos gestionan productos, inventario y perfil público

**URLs públicas:**
- Homepage: `/`
- Perfil artesano: `/artesanos/{slug}/`
- Tienda: `/productos/`
- Dashboard artesano: `/dashboard/` (protegido)

### Áreas Críticas de Escalabilidad

1. **Cloudinary signed uploads:** Sistema de tokens temporales para uploads seguros sin exponer API secrets
2. **Stripe Connect:** Onboarding asíncrono de artesanos y webhooks para sincronizar estado de cuentas
3. **Inventario:** Reducción automática de stock en OrderItem.save() (potencial race condition con alto tráfico)
4. **Autenticación:** Blacklist de refresh tokens requiere Redis en producción para escalar
5. **Imágenes:** Todas las URLs son de Cloudinary (no almacenamiento local) para independencia del servidor

### Convenciones de Código Importantes

**Python:**
- PEP 8 estricto, type hints siempre que sea posible
- Custom User model con role-based permissions
- Slugs únicos auto-generados desde username
- Manejo robusto de errores con try-except específicos

**TypeScript:**
- Strict mode habilitado
- Path aliases: `@/components/*`, `@/lib/*`, `@/types/*`
- Naming: camelCase (vars/funciones), PascalCase (componentes/tipos)

**Patrones clave:**
- Backend: ViewSets de DRF, custom permissions (IsArtistOwner)
- Frontend: Server Components primero, Client solo si necesario
- Error handling: try-catch-finally con graceful degradation
- Documentación: código auto-documentado, comentarios explican "por qué", no "qué"

---

## 📁 ARCHIVOS REPRESENTATIVOS PARA COMPARTIR

### 📚 1. DOCUMENTACIÓN PRINCIPAL

| Archivo | Descripción | Razón de inclusión |
|---------|-------------|-------------------|
| `README.md` | Overview del proyecto, quick start, stack tech | **CRÍTICO** - Punto de entrada, setup inicial |
| `ROADMAP.md` | Plan de desarrollo por fases, modelo de datos, timeline | **ESENCIAL** - Visión completa del proyecto, próximos pasos |
| `START_HERE.md` | Guía rápida de inicio para desarrollo | **ÚTIL** - Comandos básicos para arrancar |
| `.cursorrules` | Convenciones de código, patrones, reglas del proyecto | **CRÍTICO** - Define estándares de calidad, arquitectura |
| `docs/README.md` | Índice de toda la documentación | **ESENCIAL** - Mapa de navegación de docs |

**Documentación específica (seleccionar según necesidad):**
- `docs/auth/SISTEMA_AUTENTICACION.md` - Sistema JWT completo con roles
- `docs/architecture/ACLARACION_CONCEPTUAL.md` - Conceptos arquitectónicos clave
- `docs/troubleshooting/PROBLEMA_LOGOUT.md` - Ejemplo de solución de problema real

### ⚙️ 2. CONFIGURACIÓN

#### Backend
| Archivo | Descripción | Razón de inclusión |
|---------|-------------|-------------------|
| `backend/requirements.txt` | Dependencias Python del proyecto | **CRÍTICO** - Conocer librerías disponibles |
| `backend/config/settings.py` | Configuración Django (DB, JWT, CORS, Stripe, Cloudinary) | **CRÍTICO** - Entender configuración completa |
| `backend/config/urls.py` | Rutas principales del API | **ESENCIAL** - Ver estructura de endpoints |
| `backend/env.example` | Variables de entorno requeridas | **ÚTIL** - Conocer secretos necesarios |
| `backend/docker-compose.yml` | PostgreSQL container config | **ÚTIL** - Setup de base de datos |

#### Frontend
| Archivo | Descripción | Razón de inclusión |
|---------|-------------|-------------------|
| `frontend/package.json` | Dependencias npm y scripts | **CRÍTICO** - Conocer librerías disponibles |
| `frontend/tsconfig.json` | Configuración TypeScript (paths, strict mode) | **ESENCIAL** - Entender aliases y config |
| `frontend/next.config.ts` | Configuración Next.js (images, remote patterns) | **ESENCIAL** - Config de Cloudinary images |
| `frontend/tailwind.config.ts` | Configuración Tailwind (tema, colores) | **ÚTIL** - Conocer sistema de diseño |

### 🗄️ 3. BACKEND - MODELOS DE BASE DE DATOS

**Modelos core (Django):**

| Archivo | Modelo | Descripción | Razón de inclusión |
|---------|--------|-------------|-------------------|
| `backend/accounts/models.py` | `User` | Custom User con roles (ADMIN, ARTISAN, CUSTOMER) | **CRÍTICO** - Base de autenticación |
| `backend/artisans/models.py` | `ArtisanProfile` | Perfil público del artesano (1:1 con User) | **CRÍTICO** - Entidad central del negocio |
| `backend/works/models.py` | `Work` | Obras del portfolio (NO venta, solo muestra) | **ESENCIAL** - Portfolio visual |
| `backend/shop/models.py` | `Product` | Productos en venta con precio y stock | **CRÍTICO** - Catálogo de tienda |
| `backend/orders/models.py` | `Order`, `OrderItem` | Sistema de pedidos multi-vendor | **CRÍTICO** - Flujo de compra |
| `backend/payments/models.py` | `Payment`, `StripeAccountStatus` | Integración Stripe Connect | **ESENCIAL** - Sistema de pagos |

**Relaciones clave entre modelos:**
```
User (1:1) ──→ ArtisanProfile
User (1:N) ──→ Work (portfolio)
User (1:N) ──→ Product (tienda)
Product (1:N) ──→ OrderItem
Order (1:N) ──→ OrderItem
OrderItem (N:1) ──→ User (artisan, para comisiones)
```

### 🔌 4. BACKEND - API VIEWS Y SERIALIZERS

**Views principales:**

| Archivo | Descripción | Razón de inclusión |
|---------|-------------|-------------------|
| `backend/accounts/views.py` | Auth endpoints (register, login, logout, me) | **CRÍTICO** - Autenticación JWT |
| `backend/artisans/views.py` | CRUD de perfiles de artesanos | **ESENCIAL** - Gestión de artesanos |
| `backend/works/views.py` | CRUD de obras (portfolio) | **ESENCIAL** - Portfolio management |
| `backend/shop/views.py` | CRUD de productos + Cloudinary signature | **CRÍTICO** - Tienda + uploads |
| `backend/orders/views.py` | Creación de pedidos (guest checkout) | **CRÍTICO** - Flujo de compra |
| `backend/payments/views.py` | Stripe Connect onboarding + webhooks | **ESENCIAL** - Integración pagos |
| `backend/admin_panel/views.py` | Panel de administración + aprobación artesanos | **ÚTIL** - Gestión admin |

**Serializers relevantes:**
- `backend/accounts/serializers.py` - User, Register, Login
- `backend/artisans/serializers.py` - ArtisanProfile con anidación
- `backend/shop/serializers.py` - Product con validación de stock
- `backend/orders/serializers.py` - Order con snapshot de precio

### 🌐 5. FRONTEND - TIPOS TYPESCRIPT

**Tipos esenciales (compartidos):**

| Archivo | Descripción | Razón de inclusión |
|---------|-------------|-------------------|
| `frontend/src/types/index.ts` | Barrel export de todos los tipos | **CRÍTICO** - Punto de entrada de tipos |
| `frontend/src/types/user.ts` | User, UserRole, ArtisanProfile, AuthResponse | **CRÍTICO** - Autenticación |
| `frontend/src/types/artisan.ts` | Artisan, ArtisanFormData, CraftType, Location | **ESENCIAL** - Artesanos |
| `frontend/src/types/work.ts` | Work, WorkFormData | **ESENCIAL** - Portfolio |
| `frontend/src/types/product.ts` | Product, CartItem, CartSummary | **CRÍTICO** - Tienda |
| `frontend/src/types/order.ts` | Order, OrderItem, OrderStatus, PaymentStatus | **CRÍTICO** - Pedidos |

### 🎛️ 6. FRONTEND - STATE MANAGEMENT (ZUSTAND)

| Archivo | Store | Descripción | Razón de inclusión |
|---------|-------|-------------|-------------------|
| `frontend/src/stores/authStore.ts` | Auth | Login, logout, register, checkAuth | **CRÍTICO** - Estado de autenticación global |
| `frontend/src/stores/cartStore.ts` | Cart | Carrito de compras (add, remove, clear) | **ESENCIAL** - Estado del carrito |

### 🧩 7. FRONTEND - COMPONENTES PRINCIPALES

**Componentes core UI:**

| Directorio | Descripción | Razón de inclusión |
|-----------|-------------|-------------------|
| `frontend/src/components/ui/*` | shadcn/ui components (Button, Card, Dialog, etc.) | **ÚTIL** - Sistema de diseño base |
| `frontend/src/components/layout/Navbar.tsx` | Navegación principal con auth | **ESENCIAL** - Layout principal |
| `frontend/src/components/artisans/*` | ArtisanCard, ArtisansGrid, ArtisanHeader | **ESENCIAL** - Componentes de artesanos |
| `frontend/src/components/works/*` | WorkCard, WorkGrid, WorkDetailHeader | **ESENCIAL** - Componentes de obras |
| `frontend/src/components/products/*` | ProductCard, ProductGrid | **ESENCIAL** - Componentes de productos |
| `frontend/src/components/dashboard/*` | DashboardHeader, DashboardNav | **ÚTIL** - Dashboard artesano |
| `frontend/src/components/profile/ProfileImageUpload.tsx` | Upload de imágenes a Cloudinary | **ESENCIAL** - Sistema de uploads |

### 📄 8. FRONTEND - PÁGINAS PRINCIPALES (APP ROUTER)

**Páginas públicas:**

| Archivo | Ruta | Descripción | Razón de inclusión |
|---------|------|-------------|-------------------|
| `frontend/src/app/page.tsx` | `/` | Homepage con featured artisans | **ESENCIAL** - Punto de entrada |
| `frontend/src/app/(public)/artesanos/page.tsx` | `/artesanos` | Listado de artesanos | **ESENCIAL** - Directorio artesanos |
| `frontend/src/app/(public)/artesanos/[slug]/page.tsx` | `/artesanos/{slug}` | Perfil público del artesano | **CRÍTICO** - Página principal de artesano |
| `frontend/src/app/(public)/productos/page.tsx` | `/productos` | Tienda de productos | **ESENCIAL** - Catálogo de tienda |

**Páginas protegidas (dashboard):**

| Archivo | Ruta | Descripción | Razón de inclusión |
|---------|------|-------------|-------------------|
| `frontend/src/app/(dashboard)/dashboard/page.tsx` | `/dashboard` | Dashboard principal del artesano | **ESENCIAL** - Panel de control |
| `frontend/src/app/(dashboard)/dashboard/obras/page.tsx` | `/dashboard/obras` | Gestión de obras (portfolio) | **ESENCIAL** - CRUD de obras |
| `frontend/src/app/(dashboard)/dashboard/productos/page.tsx` | `/dashboard/productos` | Gestión de productos | **ESENCIAL** - CRUD de productos |
| `frontend/src/app/(dashboard)/dashboard/perfil/page.tsx` | `/dashboard/perfil` | Edición de perfil artesano | **ESENCIAL** - Configuración perfil |
| `frontend/src/app/(dashboard)/admin/artesanos/page.tsx` | `/admin/artesanos` | Panel admin (aprobación) | **ÚTIL** - Gestión admin |

**Autenticación:**

| Archivo | Ruta | Descripción | Razón de inclusión |
|---------|------|-------------|-------------------|
| `frontend/src/app/(auth)/login/page.tsx` | `/login` | Login con email/password | **CRÍTICO** - Autenticación |
| `frontend/src/app/(auth)/registro/page.tsx` | `/registro` | Registro de nuevos artesanos | **CRÍTICO** - Onboarding |

### 🔧 9. FRONTEND - UTILIDADES Y HELPERS

**Librería principal:**

| Archivo | Descripción | Razón de inclusión |
|---------|-------------|-------------------|
| `frontend/src/lib/axios.ts` | Axios instance configurada (interceptors, JWT) | **CRÍTICO** - HTTP client con refresh token |
| `frontend/src/lib/cloudinary.ts` | Helpers para Cloudinary (signed uploads) | **ESENCIAL** - Sistema de uploads |
| `frontend/src/lib/api/artisans.ts` | API calls de artesanos | **ESENCIAL** - Servicios artesanos |
| `frontend/src/lib/api/works.ts` | API calls de obras | **ESENCIAL** - Servicios obras |
| `frontend/src/lib/api/admin.ts` | API calls admin | **ÚTIL** - Servicios admin |
| `frontend/src/lib/placeholders.ts` | Sistema de placeholders para imágenes | **ÚTIL** - Fallbacks de imágenes |

### 🚧 10. INFRAESTRUCTURA

| Archivo | Descripción | Razón de inclusión |
|---------|-------------|-------------------|
| `backend/docker-compose.yml` | PostgreSQL container | **ÚTIL** - Setup de DB local |
| `.gitignore` | Archivos ignorados por Git | **ÚTIL** - Conocer qué NO commitear |

---

## 🔄 ARCHIVOS QUE CAMBIAN FRECUENTEMENTE (RE-SINCRONIZAR)

### Alta frecuencia (cambios semanales) ⚡

**Backend (Django):**
- `backend/*/models.py` - Modelos Django (schema changes)
- `backend/*/views.py` - Endpoints API (nuevas features)
- `backend/*/serializers.py` - Validación de datos y respuestas API
- `backend/*/urls.py` - Nuevos endpoints

**Frontend (Next.js):**
- `frontend/src/types/*.ts` - **CRÍTICO:** Tipos TypeScript (deben coincidir con serializers)
- `frontend/src/app/**/page.tsx` - Páginas (nuevas rutas/features)
- `frontend/src/components/**/*.tsx` - Componentes UI
- `frontend/src/lib/api/*.ts` - API services (deben coincidir con endpoints backend)

**⚠️ Re-sync crítico:** Si cambias un serializer en backend, actualiza el tipo correspondiente en frontend INMEDIATAMENTE para evitar inconsistencias.

### Media frecuencia (cambios mensuales) 📅

- `backend/config/settings.py` - Config Django (nuevas integraciones)
- `backend/config/urls.py` - Rutas principales (nuevos módulos)
- `frontend/src/lib/axios.ts` - Configuración HTTP client (interceptors)
- `frontend/src/stores/*.ts` - Zustand stores (nuevo estado global)
- `ROADMAP.md` - Plan de desarrollo (actualización de progreso)

### Baja frecuencia (cambios trimestrales) 📆

- `backend/requirements.txt` - Dependencias Python
- `frontend/package.json` - Dependencias npm
- `tsconfig.json` / `next.config.ts` - Configuración build
- `.cursorrules` - Convenciones de código
- `CONTEXT_FOR_CLAUDE.md` - Este snapshot (actualizar versión)

### 🔍 Checklist de Consistencia (ejecutar cada semana)

Cuando hagas cambios significativos en el backend, verifica:

1. **Modelos → Serializers → Tipos:**
   ```bash
   # ¿Cambió el modelo User?
   # → Verifica UserSerializer (backend/accounts/serializers.py)
   # → Verifica User type (frontend/src/types/user.ts)
   # → Verifica AuthResponse si afecta login
   ```

2. **Endpoints → API Services:**
   ```bash
   # ¿Añadiste POST /api/v1/products/?
   # → Añade createProduct() en frontend/src/lib/api/products.ts
   # → Documenta en tabla de endpoints (este archivo)
   ```

3. **Permisos → Frontend guards:**
   ```bash
   # ¿Cambió can_sell logic en backend?
   # → Verifica protección de rutas en frontend/src/app/(dashboard)/**
   # → Actualiza authStore si es necesario
   ```

4. **Errores comunes a detectar:**
   - ❌ Campo nuevo en serializer pero NO en tipo TypeScript
   - ❌ Endpoint nuevo en backend pero NO en API service del frontend
   - ❌ Tipo de dato diferente (backend: `int` vs frontend: `string`)
   - ❌ Campo opcional en backend pero requerido en frontend (o viceversa)
   - ❌ Enum values diferentes entre backend y frontend

---

## 🧭 INSTRUCCIONES PARA CLAUDE WEB

### Cómo usar este contexto

1. **Primera vez:** Lee `README.md`, `ROADMAP.md` y `.cursorrules` para entender el proyecto completo

2. **Para arquitectura:** Revisa modelos en `backend/*/models.py` y tipos en `frontend/src/types/*.ts`

3. **Para API:** Ve `backend/*/views.py` y `frontend/src/lib/api/*.ts`

4. **Para UI:** Revisa páginas en `frontend/src/app/**/page.tsx` y componentes

### Qué preguntar cuando necesites contexto adicional

**Si necesitas entender un módulo específico:**
- "¿Puedes leerme el archivo `backend/works/views.py` completo?"
- "¿Qué hace el componente `ArtisanHeader.tsx`?"
- "¿Cómo funciona el sistema de autenticación? Lee `authStore.ts`"

**Si necesitas debug:**
- "¿Hay tests para el modelo Order? Lee `backend/orders/tests.py`"
- "¿Qué errores hay en el log? Lee `backend/logs/django.log`"
- "¿Hay documentación sobre signed uploads? Revisa `docs/features/CLOUDINARY_SIGNED_UPLOADS.md`"

**Si necesitas implementar algo nuevo:**
- "Quiero añadir reviews de productos. ¿Qué archivos necesito crear?"
- "Voy a implementar filtros por precio. ¿Cómo se hace con DRF?"
- "Necesito un endpoint para favoritos. ¿Cuál es el patrón a seguir?"

**Siempre pregunta por:**
1. Archivos específicos si necesitas ver código exacto
2. Documentación relacionada si existe
3. Tests existentes para entender casos de uso
4. Configuración relevante (settings.py, env vars)

### Áreas donde puedes ayudar

✅ **Arquitectura y diseño:** Decisiones de diseño, trade-offs, alternativas
✅ **Code review:** Mejoras de código, bugs potenciales, anti-patterns
✅ **Documentación:** Escribir docs técnicas, READMEs de módulos
✅ **Planning:** Planificar nuevas features, estimar complejidad
✅ **Troubleshooting:** Debug de problemas conceptuales, no de código específico
✅ **Best practices:** Sugerencias de mejora, refactorings
✅ **Optimización:** Identificar bottlenecks, proponer soluciones

❌ **NO puedes:** Ejecutar código, leer archivos locales, ver logs en tiempo real
❌ **Depende de mí compartir:** Código actual, logs de errores, outputs de comandos

---

## 🗂️ MODELO DE DATOS SIMPLIFICADO

```
┌─────────────────────────────────────────────────────────┐
│                    CORE ENTITIES                        │
└─────────────────────────────────────────────────────────┘

User (accounts)
├── email (unique, login)
├── username (unique, para slug)
├── role (ADMIN | ARTISAN | CUSTOMER)
├── is_approved (manual approval para artesanos)
└── is_active

    ↓ 1:1

ArtisanProfile (artisans)
├── user_id (FK → User)
├── slug (unique, auto-generated)
├── display_name
├── bio, avatar, cover_image (Cloudinary URLs)
├── craft_type (CERAMICS | JEWELRY | WOOD | ...)
├── location (MAO | CIUTADELLA | ...)
├── stripe_account_id, stripe_account_status
└── total_works, total_products

    ↓ 1:N

Work (works) - Portfolio, NO venta
├── artisan_id (FK → User)
├── title, description, category
├── thumbnail_url (Cloudinary)
├── images (JSON array de URLs)
├── display_order (drag & drop)
└── is_featured, is_active

    ↓ 1:N

Product (shop) - Tienda, SÍ venta
├── artisan_id (FK → User)
├── name, description, category
├── price (Decimal), stock (Integer)
├── thumbnail_url (Cloudinary)
├── images (JSON array)
├── stripe_product_id, stripe_price_id
└── is_active

    ↓ 1:N

OrderItem (orders) - Línea de pedido
├── order_id (FK → Order)
├── product_id (FK → Product, PROTECT)
├── artisan_id (FK → User, denormalized)
├── product_name, product_price (snapshot!)
├── quantity, subtotal
└── created_at

    ↑ N:1

Order (orders) - Pedido completo
├── order_number (auto: ORD-YYYYMMDD-XXXXXX)
├── customer_email, customer_name (guest checkout)
├── shipping_address, city, postal_code, country
├── status (PENDING | PROCESSING | SHIPPED | ...)
├── payment_status (PENDING | SUCCEEDED | ...)
├── total_amount
└── created_at

Payment (payments) - Historial Stripe
├── order_id (FK → Order, nullable)
├── artisan_id (FK → User)
├── stripe_payment_id, stripe_session_id
├── amount, currency, status
└── created_at
```

**Convenciones:**
- Todos los modelos tienen `created_at` y `updated_at`
- Slugs son únicos y auto-generados
- Imágenes son URLs de Cloudinary (no ImageField)
- OrderItem guarda snapshot del precio para inmutabilidad

---

## 🎯 DECISIONES ARQUITECTÓNICAS CLAVE DEL MONOREPO

### 1. Por qué NO usamos un monorepo tool (Turborepo/Nx)

**Decisión:** Monorepo "manual" sin herramientas de gestión

**Razones:**
- ✅ **Simplicidad:** Backend y frontend son tecnologías completamente diferentes (Python vs Node)
- ✅ **Deploy separado:** No necesitamos builds coordinados (Railway + Vercel)
- ✅ **Sin shared code:** No hay librerías compartidas entre FE/BE (solo contratos de API)
- ✅ **Overhead innecesario:** Turborepo/Nx añaden complejidad para proyectos pequeños

**Trade-off:** Mantenimiento manual de consistencia de tipos (verificación semanal)

### 2. Por qué REST API en lugar de GraphQL/tRPC

**Decisión:** RESTful API con Django REST Framework

**Razones:**
- ✅ **Django ecosystem:** DRF es estándar en Django, muy maduro y documentado
- ✅ **Simplicidad:** REST es más fácil de debuggear que GraphQL
- ✅ **Caching:** HTTP caching funciona out-of-the-box con REST
- ✅ **Sin shared runtime:** tRPC requiere TypeScript en backend (Django es Python)

**Trade-off:** Multiple endpoints para datos relacionados (N+1 queries en algunos casos)

**Futuro:** Si el proyecto crece mucho, considerar GraphQL con Graphene-Django

### 3. Por qué Monorepo en lugar de Repos Separados

**Decisión:** Un solo repositorio con `/backend` y `/frontend`

**Razones:**
- ✅ **Desarrollo coherente:** Cambios en API + Frontend en el mismo commit
- ✅ **Documentación unificada:** `docs/` sirve a ambos lados
- ✅ **Versionado sincronizado:** Más fácil rastrear qué versión de FE va con qué BE
- ✅ **CI/CD simplificado:** Un solo repo para configurar webhooks

**Trade-off:** Repo más grande, pero manejable para proyectos medianos

### 4. Por qué Tipos Manuales en lugar de Codegen

**Decisión:** Tipos TypeScript escritos manualmente (no auto-generados)

**Razones:**
- ✅ **Control total:** Podemos customizar tipos según necesidad del frontend
- ✅ **Sin dependencia:** No necesitamos herramientas adicionales (openapi-generator, etc.)
- ✅ **Flexibilidad:** Podemos tener tipos diferentes si el frontend necesita campos computed

**Trade-off:** Riesgo de desincronización (mitigado con checklist semanal)

**Futuro:** Si el equipo crece, considerar `django-rest-framework-dataclasses` + `openapi-typescript`

### 5. Por qué Cloudinary Signed Uploads en lugar de Django

**Decisión:** Cliente sube directo a Cloudinary (no pasa por Django)

**Razones:**
- ✅ **Performance:** Django no procesa archivos grandes
- ✅ **Escalabilidad:** Cloudinary CDN maneja uploads mejor que Django
- ✅ **Independencia:** Si Django se cae, uploads siguen funcionando
- ✅ **Menos carga:** Django solo genera signature (operación rápida)

**Trade-off:** Lógica de uploads split entre FE y BE (más complejidad)

---

## 💡 DECISIONES TÉCNICAS A NIVEL DE FEATURES

Además de las decisiones arquitectónicas del monorepo, estas son decisiones técnicas importantes a nivel de features individuales:

### 1. Por qué Cloudinary URLs en lugar de ImageField

**Problema:** Django ImageField almacena archivos en servidor local, lo cual:
- Consume storage del servidor
- No escala bien (necesitas compartir filesystem entre instancias)
- No tiene CDN integrado
- Transformaciones requieren librerías adicionales (Pillow)

**Solución adoptada:** URLField con Cloudinary
```python
# models.py
thumbnail_url = models.URLField(max_length=500)
images = models.JSONField(default=list)  # Lista de URLs
```

**Ventajas:**
- ✅ CDN global automático (latencia baja)
- ✅ Transformaciones on-the-fly (resize, crop, format)
- ✅ Signed uploads desde cliente (seguridad)
- ✅ Independencia del servidor Django
- ✅ No consume storage local
- ✅ URLs permanentes

**Trade-off:** Dependencia de servicio externo (Cloudinary)

### 2. Por qué Guest Checkout (sin registro de compradores)

**Problema:** Obligar a los compradores a registrarse reduce conversión en ~30%

**Solución adoptada:** Guest checkout con solo email
```python
# orders/models.py
class Order:
    customer_email = models.EmailField()  # No FK a User
    customer_name = models.CharField()
```

**Ventajas:**
- ✅ Mayor conversión (menos fricción)
- ✅ UX más simple
- ✅ Menos mantenimiento (menos cuentas)

**Trade-off:** No hay perfil de comprador (historial, direcciones guardadas)

**Futuro:** Si crece, permitir registro opcional de compradores con role CUSTOMER

### 3. Por qué Snapshot de Precios en OrderItem

**Problema:** Si el artesano cambia el precio del producto después de una venta, los pedidos históricos muestran precio incorrecto

**Solución adoptada:** Snapshot en OrderItem
```python
# orders/models.py
class OrderItem:
    product = models.ForeignKey(Product, on_delete=PROTECT)
    product_name = models.CharField()     # Snapshot
    product_price = models.DecimalField() # Snapshot
```

**Ventajas:**
- ✅ Inmutabilidad de pedidos históricos
- ✅ Auditoría correcta para facturación
- ✅ Cumplimiento legal (datos exactos de transacción)

**Trade-off:** Ligera denormalización (datos duplicados)

### 4. Por qué JWT con Refresh Token Rotation

**Problema:** JWTs estáticos son seguros pero no permiten invalidación (si roban token, válido hasta expiración)

**Solución adoptada:** Refresh token con rotación + blacklist
```python
# settings.py
SIMPLE_JWT = {
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

**Ventajas:**
- ✅ Logout real (blacklist en DB)
- ✅ Detección de robo (refresh token usado 2 veces = alerta)
- ✅ Access tokens cortos (1h) con refresh largo (7 días)

**Trade-off:** Requiere base de datos para blacklist (en producción usar Redis)

### 5. Por qué Aprobación Manual de Artesanos

**Problema:** Spam, calidad del marketplace, confianza del comprador

**Solución adoptada:** Aprobación manual por admin
```python
# accounts/models.py
class User:
    is_approved = models.BooleanField(default=False)

    @property
    def can_sell(self):
        return (self.is_artisan and self.is_approved) or self.is_admin
```

**Ventajas:**
- ✅ Control de calidad (solo artesanos reales)
- ✅ Prevención de spam/scam
- ✅ Mejor experiencia para compradores (confianza)

**Trade-off:** Fricción en onboarding (pero justificada por calidad)

**Dev mode:** `AUTO_APPROVE_ARTISANS=True` (bypass en desarrollo)

---

## 📊 FLUJOS CRÍTICOS

### Flujo 1: Registro y Aprobación de Artesano

```
1. Usuario visita /registro
2. Completa form (email, username, password, craft_type)
3. POST /api/v1/auth/register/
   ├─ Crea User con role=ARTISAN, is_approved=False
   ├─ Crea ArtisanProfile vacío (slug auto-generado)
   └─ Devuelve tokens JWT
4. Usuario logueado pero can_sell=False
5. Completa perfil en /dashboard/perfil (bio, avatar, redes)
6. Sube 2-3 obras en /dashboard/obras (portfolio)
7. Admin revisa en /admin/artesanos
8. Admin aprueba → is_approved=True
9. Artesano recibe email y puede crear productos
```

**Archivos involucrados:**
- Frontend: `app/(auth)/registro/page.tsx`
- Backend: `accounts/views.py` (RegisterView)
- Backend: `accounts/models.py` (User.save() auto-crea profile)
- Backend: `admin_panel/views.py` (approve_artisan action)

### Flujo 2: Compra de Producto (Guest Checkout)

```
1. Comprador navega /productos (público)
2. Click en ProductCard → modal con detalles
3. "Añadir al carrito" → cartStore.addItem()
4. Cart icon en navbar muestra badge
5. Click en cart → modal checkout
6. Completa form: email, nombre, dirección
7. POST /api/v1/orders/
   ├─ Crea Order (customer_email, shipping_address)
   ├─ Crea OrderItems (con snapshot de precio)
   ├─ Reduce stock de productos (Product.stock -= quantity)
   └─ Calcula total_amount
8. Redirige a Stripe Checkout (stripe_session_id)
9. Comprador paga en Stripe
10. Webhook POST /api/v1/payments/webhook/
    ├─ Verifica signature
    ├─ Actualiza Order.payment_status = SUCCEEDED
    └─ Crea Payment record
11. Email de confirmación al comprador
12. Artesano ve venta en /dashboard/ventas
```

**Archivos involucrados:**
- Frontend: `stores/cartStore.ts`
- Frontend: `components/checkout/CheckoutForm.tsx`
- Backend: `orders/views.py` (CreateOrderView)
- Backend: `orders/models.py` (Order, OrderItem)
- Backend: `payments/views.py` (StripeWebhookView)

### Flujo 3: Upload de Imagen con Cloudinary Signed Upload

```
1. Artesano en /dashboard/productos/nuevo
2. Drop imagen en ProfileImageUpload component
3. Frontend: GET /api/v1/shop/cloudinary-signature/
   └─ Backend genera signature temporal (válida 1h)
4. Frontend: POST https://api.cloudinary.com/v1_1/{cloud}/upload
   ├─ Payload: file + signature + timestamp + preset
   └─ Cloudinary valida signature server-side
5. Cloudinary devuelve secure_url
6. Frontend guarda URL en formData
7. Submit form → POST /api/v1/products/
   └─ Backend guarda URL en Product.thumbnail_url
```

**Por qué signed uploads:**
- ✅ Cliente sube directo a Cloudinary (no pasa por Django)
- ✅ API secret nunca expuesto en frontend
- ✅ Signature temporal previene abuso
- ✅ Django solo recibe URL final (ya subida)

**Archivos involucrados:**
- Frontend: `components/profile/ProfileImageUpload.tsx`
- Frontend: `lib/cloudinary.ts` (uploadToCloudinary)
- Backend: `shop/views.py` (CloudinarySignatureView)

---

## 🔐 SEGURIDAD Y PERMISOS

### Permissions del Backend

| Permission | Descripción | Usado en |
|-----------|-------------|----------|
| `IsAuthenticated` | Usuario debe estar logueado | Endpoints privados |
| `IsAuthenticatedOrReadOnly` | Público GET, privado POST/PUT/DELETE | Artisans, Works, Products |
| `IsArtistOwner` | Solo el artesano dueño puede editar | Works, Products |
| `IsAdminUser` | Solo admins pueden acceder | Admin panel |

**Ejemplo de uso:**
```python
# works/views.py
class WorkViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsArtistOwner()]
        return super().get_permissions()
```

### Validaciones Críticas

1. **Stock insuficiente:**
```python
# shop/serializers.py
def validate(self, data):
    if data['stock'] < 0:
        raise ValidationError("Stock no puede ser negativo")
```

2. **Email único:**
```python
# accounts/models.py
email = models.EmailField(unique=True)
```

3. **Signature expiry (Cloudinary):**
```python
# shop/views.py
timestamp = int(time.time())
params_to_sign['timestamp'] = timestamp
# Cloudinary rechaza si timestamp > 1h antiguo
```

### Variables de Entorno Sensibles

**NUNCA commitear:**
- `SECRET_KEY` (Django)
- `DATABASE_URL` (credentials PostgreSQL)
- `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SENTRY_DSN`

**Siempre en `.env` y añadir a `.gitignore`**

---

## 🚀 PRÓXIMOS PASOS (ROADMAP)

**Fase actual:** Fase 3 - Frontend en desarrollo

**Completado:**
- ✅ Fase 0: Setup (PostgreSQL, Django, Next.js)
- ✅ Fase 1: Backend Core (Auth, Artists, Works, Products)
- ✅ Fase 2: Store & Payments (Stripe Connect, Orders)
- ✅ Fase 3 (parcial): Frontend (páginas públicas, dashboard básico)

**En progreso:**
- 🔄 Fase 3: Completar dashboard artesano (gestión productos, perfil)
- 🔄 Admin panel (aprobación artesanos, moderación)

**Próximos:**
- ⏳ Fase 3.5: Sistema de aprobación híbrido (email verification + admin approval)
- ⏳ Fase 4: Optimización (Redis cache, query optimization)
- ⏳ Fase 5: Testing & CI/CD (pytest, Playwright)
- ⏳ Fase 6: Deploy a producción (Railway + Vercel)

**Futuras features (no MVP):**
- Sistema de reviews/ratings
- Notificaciones en tiempo real
- Mapa interactivo de artesanos
- Sistema de favoritos
- Calendario de eventos/talleres
- Chat artesano-comprador

---

## 📞 CÓMO MANTENER ESTE SNAPSHOT ACTUALIZADO

### Cuándo actualizar

**Trigger de actualización (cada 2-4 semanas o al completar fase):**
1. Cambio significativo en arquitectura
2. Nuevos modelos o endpoints
3. Nueva feature importante
4. Cambio en stack tecnológico
5. Refactorización mayor

### Qué actualizar

1. **Fecha y versión** al inicio del documento
2. **Resumen ejecutivo** si cambia scope o stack
3. **Archivos representativos** si aparecen nuevos archivos críticos
4. **Modelo de datos** si cambian relaciones
5. **Decisiones arquitectónicas** si se toma nueva decisión importante
6. **Flujos críticos** si cambia flujo de compra/auth
7. **Próximos pasos** al completar tareas

### Comando para generar snapshot actualizado

```bash
# En Claude Code, ejecutar:
/claude "Actualiza CONTEXT_FOR_CLAUDE.md con los cambios recientes.
Revisa: modelos modificados, nuevos endpoints, cambios en frontend,
y actualiza la fecha y versión del snapshot."
```

---

**Generado por:** Claude Code (Anthropic)
**Para:** Claude Web (sincronización de contexto)
**Proyecto:** MiTaller.art - Marketplace de artesanos menorquines
**Contacto:** [Tu email aquí]

