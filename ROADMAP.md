# 🗺️ MiTaller.art - Plan de Migración

## 🎯 Visión del Proyecto

Transformar el MVP actual (Marina) en **mitaller.art** - un marketplace SaaS donde múltiples artistas gestionan portfolios y tiendas independientes.

**Stack Objetivo:**
- **Backend:** Django + Django Rest Framework + PostgreSQL  
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + BEM
- **Enfoque:** Minimalista e incremental - añadir complejidad solo cuando sea necesaria

---

## ✅ TODO LIST

### 📦 Phase 0: Setup Básico (3-5 días)
- [ ] Instalar PostgreSQL (local o Docker simple)
- [ ] Crear proyecto Django con estructura básica
- [ ] Diseñar esquema de base de datos (Users, Artists, Works, Products, Orders)
- [ ] Configurar settings.py con JWT y CORS
- [ ] Crear requirements.txt minimalista

### 🔐 Phase 1: Backend Core (2 semanas)
- [ ] Implementar autenticación (register, login, JWT, email verification)
- [ ] Crear app Artists con perfiles y sistema de slugs
- [ ] Implementar app Works (portfolio items) con CRUD
- [ ] Sistema de permisos: IsArtistOwner
- [ ] Endpoints públicos vs privados

### 🛒 Phase 2: Backend Store & Payments (1 semana)
- [ ] Implementar modelo Products con inventario
- [ ] Integrar Stripe Checkout
- [ ] Implementar webhooks de Stripe
- [ ] Crear sistema de Orders multi-artista
- [ ] Sistema de suscripciones (Free/Pro/Enterprise)

### ⚛️ Phase 3: Frontend (1-2 semanas)
- [ ] Setup Next.js 14 con App Router
- [ ] Instalar Tailwind CSS + shadcn/ui
- [ ] Implementar auth frontend (login, register, protected routes)
- [ ] Crear páginas públicas (home, /artists/[slug], shop)
- [ ] Crear dashboard de artista (obras, productos)
- [ ] Integrar Cloudinary para upload de imágenes

### 🚀 Phase 4: Optimización (1 semana) - *Cuando sea necesario*
- [ ] Añadir Redis para caché de sesiones
- [ ] Optimizar queries con select_related/prefetch_related
- [ ] Añadir índices de base de datos
- [ ] Implementar rate limiting
- [ ] Añadir Celery para emails asíncronos

### 🧪 Phase 5: Testing & CI/CD (1 semana) - *Cuando tengas tests*
- [ ] Escribir tests críticos (auth, payments, CRUD)
- [ ] Setup pytest-django
- [ ] Configurar GitHub Actions para CI
- [ ] Añadir linters (flake8, ESLint)
- [ ] Coverage mínimo 80%

### 🌐 Phase 6: Deploy (3-5 días)
- [ ] Deploy backend a Railway/Render
- [ ] Deploy frontend a Vercel
- [ ] Configurar variables de entorno de producción
- [ ] Setup Cloudinary para producción
- [ ] Migrar datos de Marina si es necesario

---

## 📊 Modelo de Datos Simplificado

```sql
-- USUARIOS
Users (id, email, username, password_hash, role, created_at)
  ↓ 1:1
Artists (id, user_id, slug, bio, avatar_url, stripe_account_id, onboarding_completed)

-- PORTFOLIO (sin tabla intermedia Portfolio)
  ↓ 1:N
Works (id, artist_id, title, description, media_url, thumbnail_url, display_order)

-- TIENDA
  ↓ 1:N
Products (id, artist_id, name, price, image_url, stock, status)

-- ÓRDENES (multi-artista)
Orders (id, customer_email, total, status, stripe_session_id, created_at)
  ↓ 1:N
OrderItems (id, order_id, product_id, artist_id, quantity, price_snapshot)

-- SUSCRIPCIONES (SaaS)
Subscriptions (id, artist_id, plan, status, started_at, expires_at)
```

**Decisiones de diseño:**
- ✅ Cada artista = UN portfolio implícito (sus "Works")
- ✅ URLs: `mitaller.art/artists/{slug}/`
- ✅ Multi-tenant: cada OrderItem conoce su artista para comisiones
- ✅ Suscripciones desde el inicio (Free, Pro, Enterprise)

---

## 🛠️ Stack Minimalista

### Backend (requirements.txt)
```python
# Core
Django==5.0.1
djangorestframework==3.14.0
psycopg2-binary==2.9.9

# Auth
djangorestframework-simplejwt==5.3.1

# CORS
django-cors-headers==4.3.1

# Utilities
python-dotenv==1.0.0
Pillow==10.2.0

# --- Añadir en fases posteriores ---
# stripe==7.0.0           # Fase 2
# celery==5.3.4           # Fase 4
# redis==5.0.1            # Fase 4
# pytest-django==4.7.0    # Fase 5
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "axios": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0"
  }
}
```

---

## 🗓️ Timeline Realista

| Fase | Duración | Entregable |
|------|----------|-----------|
| 0. Setup | 3-5 días | PostgreSQL + Django funcionando |
| 1. Backend Core | 2 semanas | Auth + Artists + Works API |
| 2. Store & Payments | 1 semana | Products + Orders + Stripe |
| 3. Frontend | 1-2 semanas | Next.js + Auth + Dashboard |
| 4. Optimización | 1 semana | Redis + Caché (si necesitas) |
| 5. Testing | 1 semana | Tests + CI/CD (cuando tengas tests) |
| 6. Deploy | 3-5 días | Producción en Railway + Vercel |

**Total:** 7-9 semanas de desarrollo enfocado

---

## 🎯 Siguiente Paso (Phase 0)

### Opción A: PostgreSQL local
```bash
brew install postgresql@15
brew services start postgresql@15
createdb mitaller_dev
```

### Opción B: PostgreSQL con Docker (recomendado)
```bash
# Crear docker-compose.yml
docker-compose up -d
```

### Crear proyecto Django
```bash
cd mitaller-backend
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework psycopg2-binary
django-admin startproject config .
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## 📚 Recursos de Aprendizaje

### Django
- [Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- Libro: "Two Scoops of Django"

### Next.js
- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Arquitectura
- "Clean Architecture" - Robert C. Martin
- "Domain-Driven Design" - Eric Evans

---

## 🎓 Principios a Seguir

1. **YAGNI** (You Ain't Gonna Need It) - No añadir complejidad prematuramente
2. **Iteración** - Funcionalidad antes que perfección
3. **Simplicidad** - El código más fácil de mantener es el que no existe
4. **Tests** - Solo cuando tengas features estables que testear

---

**¿Listo para empezar con Phase 0?** 🚀

