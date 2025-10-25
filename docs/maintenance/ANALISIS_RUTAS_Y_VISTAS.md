# Análisis de Rutas y Vistas - Mitaller.art

**Fecha:** Octubre 2025
**Objetivo:** Identificar rutas y vistas redundantes o sin utilizar

---

## 📋 RESUMEN EJECUTIVO

### Backend Django - ✅ LIMPIO
- **7 apps** con rutas bien organizadas
- **Todas las rutas están conectadas** a vistas activas
- **Sin redundancias** detectadas en URLs o ViewSets
- **2 scripts de testing** manuales que podrían moverse a `/tests`

### Frontend Next.js - ⚠️ LIMPIEZA REQUERIDA
- **1 ruta obsoleta** encontrada: `/artistas/[slug]`
- **1 directorio vacío** sin contenido: `/artesanos/`
- **Ruta correcta en uso:** `/(public)/artesanos/[slug]`

---

## 🔍 ANÁLISIS DETALLADO

### 1️⃣ BACKEND DJANGO

#### ✅ Rutas Principales (`config/urls.py`)
Todas las rutas están bien conectadas:

```python
/admin/                        → Django Admin
/api/v1/auth/                  → accounts.urls (login, registro, perfil)
/api/v1/auth/token/verify/     → TokenVerifyView (JWT)
/api/v1/artists/               → artists.urls (perfiles públicos)
/api/v1/works/                 → works.urls (portfolio)
/api/v1/shop/                  → shop.urls (productos)
/api/v1/orders/                → orders.urls (pedidos)
/api/v1/payments/              → payments.urls (Stripe)
```

#### ✅ App: `accounts` - Autenticación
**Archivo:** `accounts/urls.py`

| Ruta | Vista | Estado | Uso |
|------|-------|--------|-----|
| `/register/` | `RegisterView` | ✅ Activa | Registro de artesanos |
| `/login/` | `CustomTokenObtainPairView` | ✅ Activa | Login JWT |
| `/token/refresh/` | `TokenRefreshView` | ✅ Activa | Refresh tokens |
| `/logout/` | `LogoutView` | ✅ Activa | Blacklist tokens |
| `/profile/` | `UserProfileView` | ✅ Activa | Ver/editar perfil |
| `/debug/` | `DebugAuthView` | ⚠️ Solo dev | Debugging auth |

**Notas:**
- Todas las vistas están implementadas y en uso
- `/debug/` solo para desarrollo (considera proteger con `DEBUG=True` check)

---

#### ✅ App: `artists` - Perfiles de Artesanos
**Archivo:** `artists/urls.py`

Usa `DefaultRouter` de DRF con `ArtistProfileViewSet`:

| Endpoint | Método | Acción | Estado |
|----------|--------|--------|--------|
| `/` | GET | `list` | ✅ Lista artesanos |
| `/{slug}/` | GET | `retrieve` | ✅ Detalle artesano |
| `/me/` | GET | Custom action | ✅ Perfil propio |
| `/me/` | PATCH | Custom action | ✅ Editar perfil |
| `/{slug}/works/` | GET | Custom action | ✅ Obras del artesano |

**Notas:**
- ViewSet ReadOnly para público
- Custom action `/me/` para edición propia
- Custom action `/{slug}/works/` usado por frontend
- Sin redundancias

---

#### ✅ App: `works` - Portfolio de Obras
**Archivo:** `works/urls.py`

| Endpoint | Vista/ViewSet | Estado | Uso |
|----------|---------------|--------|-----|
| `/cloudinary/signature/` | `generate_upload_signature` | ✅ Activa | Signed uploads |
| `/cloudinary/config/` | `cloudinary_config` | ✅ Activa | Config pública |
| `/` (router) | `WorkViewSet` | ✅ Activo | CRUD obras |
| `/reorder/` | `WorkViewSet.reorder` | ✅ Activa | Reordenar obras |

**Vistas en `cloudinary_views.py`:**
- `generate_upload_signature` → ✅ En uso (signed uploads)
- `cloudinary_config` → ✅ En uso (config frontend)

**Notas:**
- ModelViewSet completo (list, retrieve, create, update, destroy)
- Custom action `reorder` para drag & drop
- Cloudinary views separadas en archivo propio (buena práctica)

---

#### ✅ App: `shop` - Productos
**Archivo:** `shop/urls.py`

Usa `DefaultRouter` con `ProductViewSet`:

| Endpoint | Método | Acción | Estado |
|----------|--------|--------|--------|
| `/` | GET | `list` | ✅ Lista productos |
| `/{id}/` | GET | `retrieve` | ✅ Detalle producto |
| `/` | POST | `create` | ✅ Crear producto |
| `/{id}/` | PATCH/PUT | `update` | ✅ Editar producto |
| `/{id}/` | DELETE | `destroy` | ✅ Eliminar producto |

**Notas:**
- ModelViewSet completo
- Filtros por artista, categoría, estado
- Búsqueda por nombre/descripción
- Sin redundancias

---

#### ✅ App: `orders` - Pedidos
**Archivo:** `orders/urls.py`

| Endpoint | Método | Acción | Estado |
|----------|--------|--------|--------|
| `/` | GET | `list` | ✅ Lista pedidos |
| `/{id}/` | GET | `retrieve` | ✅ Detalle pedido |
| `/` | POST | `create` | ✅ Crear pedido (público) |
| `/{id}/` | PATCH | `partial_update` | ✅ Actualizar estado |
| `/my-sales/` | GET | Custom action | ✅ Ventas del artesano |

**Notas:**
- Custom action `/my-sales/` retorna `OrderItems` del artesano
- Endpoint `/` público para compras de invitados
- Sin redundancias

---

#### ✅ App: `payments` - Pagos con Stripe
**Archivo:** `payments/urls.py`

| Endpoint | Vista/ViewSet | Estado | Uso |
|----------|---------------|--------|-----|
| `/webhook/stripe/` | `StripeWebhookView` | ✅ Activa | Webhooks Stripe |
| `/stripe-connect/` (router) | `StripeConnectViewSet` | ✅ Activo | Onboarding |
| `/stripe-connect/start-onboarding/` | Custom action | ✅ Activa | Iniciar onboarding |
| `/stripe-connect/refresh-onboarding/` | Custom action | ✅ Activa | Refrescar link |
| `/stripe-connect/account-status/` | Custom action | ✅ Activa | Estado cuenta |
| `/payments/` (router) | `PaymentViewSet` | ✅ Activo | Lista pagos |
| `/payments/create-checkout-session/` | Custom action | ✅ Activa | Crear sesión |

**Notas:**
- Webhook de Stripe antes del router (orden importante)
- Todas las custom actions en uso
- Sin redundancias

---

### 2️⃣ FRONTEND NEXT.JS

#### ⚠️ Rutas Obsoletas - ACCIÓN REQUERIDA

##### 1. `/artistas/[slug]` - **ELIMINAR**

**Ubicación:** `src/app/artistas/[slug]/page.tsx`

**Problema:**
- Ruta obsoleta que duplica funcionalidad de `/(public)/artesanos/[slug]`
- Client Component antiguo con `useState` y `useEffect`
- Solo tiene 1 referencia interna (a sí misma en línea 128)
- No se usa en ninguna otra parte del código

**Comparación:**

| Característica | `/artistas/[slug]` (OBSOLETA) | `/(public)/artesanos/[slug]` (ACTUAL) |
|----------------|-------------------------------|---------------------------------------|
| Tipo | Client Component | Server Component |
| Fetch | Client-side con axios | Server-side con fetch |
| SEO | Limitado | Completo con metadata |
| Rendering | CSR | SSR |
| Referencias | 1 (a sí misma) | 19 en toda la app |

**Acción:** Eliminar directorio completo `/artistas/`

---

##### 2. `/artesanos/` (directorio vacío) - **ELIMINAR**

**Ubicación:** `src/app/artesanos/`

**Problema:**
- Directorio vacío sin contenido
- La funcionalidad real está en `/(public)/artesanos/`
- Puede causar confusión

**Acción:** Eliminar directorio vacío

---

#### ✅ Rutas Activas y en Uso

##### Rutas Públicas `(public)/`

| Ruta | Archivo | Estado | Uso |
|------|---------|--------|-----|
| `/artesanos` | `(public)/artesanos/page.tsx` | ✅ Activa | Lista artesanos |
| `/artesanos/[slug]` | `(public)/artesanos/[slug]/page.tsx` | ✅ Activa | Perfil artesano (19 refs) |
| `/artesanos/[slug]/obras/[workId]` | `(public)/artesanos/[slug]/obras/[workId]/page.tsx` | ✅ Activa | Detalle obra |
| `/carrito` | `(public)/carrito/page.tsx` | ✅ Activa | Carrito compras |

##### Rutas de Autenticación `(auth)/`

| Ruta | Archivo | Estado | Uso |
|------|---------|--------|-----|
| `/login` | `(auth)/login/page.tsx` | ✅ Activa | Login |
| `/registro` | `(auth)/registro/page.tsx` | ✅ Activa | Registro |

##### Rutas Dashboard `(dashboard)/`

| Ruta | Archivo | Estado | Uso |
|------|---------|--------|-----|
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | ✅ Activa | Dashboard principal |
| `/dashboard/perfil` | `(dashboard)/dashboard/perfil/page.tsx` | ✅ Activa | Editar perfil |
| `/dashboard/obras` | `(dashboard)/dashboard/obras/page.tsx` | ✅ Activa | Gestión obras |
| `/dashboard/obras/nueva` | `(dashboard)/dashboard/obras/nueva/page.tsx` | ✅ Activa | Crear obra |
| `/dashboard/obras/[id]/editar` | `(dashboard)/dashboard/obras/[id]/editar/page.tsx` | ✅ Activa | Editar obra |
| `/dashboard/tienda` | `(dashboard)/dashboard/tienda/page.tsx` | ✅ Activa | Gestión productos |
| `/dashboard/pedidos` | `(dashboard)/dashboard/pedidos/page.tsx` | ✅ Activa | Ver pedidos |
| `/dashboard/debug-auth` | `(dashboard)/dashboard/debug-auth/page.tsx` | ⚠️ Solo dev | Debug auth |

##### Rutas Artesano `(dashboard)/artesano/`

| Ruta | Archivo | Estado | Uso |
|------|---------|--------|-----|
| `/artesano` | `(dashboard)/artesano/page.tsx` | ✅ Activa | Dashboard artesano |
| `/artesano/portfolio` | `(dashboard)/artesano/portfolio/page.tsx` | ✅ Activa | Portfolio |
| `/artesano/productos` | `(dashboard)/artesano/productos/page.tsx` | ✅ Activa | Productos |
| `/artesano/ventas` | `(dashboard)/artesano/ventas/page.tsx` | ✅ Activa | Ventas |

**Nota:** Parece haber duplicación entre `/dashboard/*` y `/artesano/*`. ¿Son para roles diferentes o es redundancia?

---

### 3️⃣ SCRIPTS DE TESTING

#### ⚠️ Scripts en directorio raíz - CONSIDERAR MOVER

**Ubicación:** `/backend/`

| Archivo | Propósito | Acción Sugerida |
|---------|-----------|-----------------|
| `test_auth_endpoints.py` | Testing manual de endpoints auth | Mover a `/backend/tests/manual/` |
| `test_auth_flow.py` | Testing manual de flujo completo | Mover a `/backend/tests/manual/` |
| `create_test_data.py` | Crear datos de prueba | Mantener en raíz (es útil) |
| `create_painter_test_data.py` | Crear datos de pintores | Mantener en raíz (es útil) |
| `limpiar_obras.py` | Script de limpieza | Mover a `/backend/scripts/` |

---

## 🎯 PLAN DE ACCIÓN

### Prioridad Alta - Limpieza Frontend

1. **Eliminar ruta obsoleta `/artistas/`**
   ```bash
   rm -rf frontend/src/app/artistas
   ```

2. **Eliminar directorio vacío `/artesanos/`**
   ```bash
   rmdir frontend/src/app/artesanos
   ```

### Prioridad Media - Organización

3. **Crear directorio para tests manuales**
   ```bash
   mkdir -p backend/tests/manual
   mv backend/test_auth_endpoints.py backend/tests/manual/
   mv backend/test_auth_flow.py backend/tests/manual/
   ```

4. **Crear directorio para scripts**
   ```bash
   mkdir -p backend/scripts
   mv backend/limpiar_obras.py backend/scripts/
   ```

### Prioridad Baja - Revisión

5. **Revisar duplicación `/dashboard` vs `/artesano`**
   - ¿Son para roles diferentes?
   - ¿Se pueden consolidar?
   - Documentar la diferencia si son necesarios ambos

6. **Proteger rutas de debug**
   - Agregar check `if settings.DEBUG` en `/debug/` endpoints
   - Considerar eliminar en producción

---

## 📊 ESTADÍSTICAS

### Backend
- **Apps:** 7 (accounts, artists, works, shop, orders, payments + config)
- **Rutas totales:** ~35 endpoints
- **Rutas redundantes:** 0 ✅
- **Rutas sin usar:** 0 ✅
- **ViewSets:** 6 (todos en uso)
- **Vistas function-based:** 3 (todas en uso)

### Frontend
- **Rutas públicas:** 4 ✅
- **Rutas auth:** 2 ✅
- **Rutas dashboard:** 8 ✅
- **Rutas artesano:** 4 ✅
- **Rutas obsoletas:** 1 ⚠️ (eliminar)
- **Directorios vacíos:** 1 ⚠️ (eliminar)

---

## ✅ CONCLUSIONES

### Lo Bueno
- Backend muy bien organizado y sin redundancias
- Separación clara de responsabilidades
- Uso correcto de ViewSets y custom actions
- Frontend usa Next.js App Router correctamente

### Lo Mejorable
- Eliminar ruta obsoleta `/artistas/`
- Limpiar directorio vacío `/artesanos/`
- Organizar scripts de testing
- Documentar diferencia entre `/dashboard` y `/artesano`

### Riesgo
**Bajo** - Los cambios sugeridos son eliminaciones seguras de código no utilizado.

---

## 📝 NOTAS FINALES

Este análisis se realizó revisando:
- Todos los archivos `urls.py` del backend
- Todos los archivos `views.py` y ViewSets
- Estructura completa de rutas del frontend Next.js
- Referencias cruzadas en todo el código
- Uso real de cada endpoint y componente

**Recomendación:** Proceder con la limpieza de forma incremental, empezando por la eliminación de `/artistas/` que es claramente obsoleta y no se usa.

