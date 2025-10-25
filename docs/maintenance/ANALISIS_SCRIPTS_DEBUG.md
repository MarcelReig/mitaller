# Análisis de Scripts de Debug y Testing

**Fecha:** 25 de Octubre 2025  
**Objetivo:** Identificar y organizar scripts de debug, testing y utilidades

---

## 📋 INVENTARIO COMPLETO

### 🔧 Backend - Scripts y Comandos

#### En Raíz (`/backend/`)

| Archivo | Tipo | Propósito | Estado | Acción |
|---------|------|-----------|--------|--------|
| `create_test_data.py` | Script test | Crear datos de prueba para Orders | ✅ Útil | Mover a `/scripts/seeders/` |
| `create_painter_test_data.py` | Script test | Crear pintor con obras de prueba | ✅ Útil | Mover a `/scripts/seeders/` |
| `update_deps.sh` | Script shell | Gestión de dependencias pip | ✅ Útil | Mover a `/scripts/dev/` |

#### En `/tests/manual/`

| Archivo | Tipo | Propósito | Estado |
|---------|------|-----------|--------|
| `test_auth_endpoints.py` | Test manual | Testing de endpoints JWT | ✅ Bien ubicado |
| `test_auth_flow.py` | Test manual | Testing de flujo completo | ✅ Bien ubicado |

#### En `/accounts/management/commands/`

| Archivo | Tipo | Propósito | Estado | Acción |
|---------|------|-----------|--------|--------|
| `fix_artist_profile.py` | Django command | Fix perfiles faltantes | ✅ Útil | ✅ Bien ubicado |

#### En cada app (`*/tests.py`)

| App | Estado | Contenido |
|-----|--------|-----------|
| `accounts/tests.py` | ✅ Correcto | Tests unitarios de accounts |
| `artists/tests.py` | ✅ Correcto | Tests unitarios de artists |
| `works/tests.py` | ✅ Correcto | Tests unitarios de works |
| `shop/tests.py` | ✅ Correcto | Tests unitarios de shop |
| `orders/tests.py` | ✅ Correcto | Tests unitarios de orders |
| `payments/tests.py` | ✅ Correcto | Tests unitarios de payments |

**Nota:** Estos `tests.py` deben permanecer en sus apps (convención Django).

---

### 🎨 Frontend - Páginas y Componentes de Debug

#### Páginas de Debug

| Ruta | Archivo | Propósito | Estado | Acción |
|------|---------|-----------|--------|--------|
| `/dashboard/debug-auth` | `(dashboard)/dashboard/debug-auth/page.tsx` | Debug de autenticación JWT | ⚠️ Solo dev | ⚠️ Proteger para producción |

#### Endpoints Backend de Debug

| Endpoint | Vista | Propósito | Estado | Acción |
|----------|-------|-----------|--------|--------|
| `/api/v1/auth/debug/` | `accounts.views.DebugAuthView` | Debug de autenticación | ⚠️ Solo dev | ⚠️ Proteger para producción |

---

## 🎯 PLAN DE REORGANIZACIÓN

### 1️⃣ Crear Estructura de Scripts Organizada

```
backend/
├── scripts/
│   ├── README.md           (ya existe)
│   ├── limpiar_obras.py    (ya existe)
│   │
│   ├── seeders/            ← NUEVO - Scripts para datos de prueba
│   │   ├── README.md
│   │   ├── create_test_data.py
│   │   └── create_painter_test_data.py
│   │
│   └── dev/                ← NUEVO - Scripts de desarrollo
│       ├── README.md
│       └── update_deps.sh
│
├── tests/
│   └── manual/             (ya existe, bien ubicado)
│       ├── README.md
│       ├── test_auth_endpoints.py
│       └── test_auth_flow.py
│
└── accounts/management/commands/  (bien ubicado, no tocar)
    └── fix_artist_profile.py
```

---

### 2️⃣ Proteger Endpoints y Páginas de Debug

#### Backend - Proteger `DebugAuthView`

**Archivo:** `backend/accounts/views.py`

```python
class DebugAuthView(APIView):
    """Vista de debugging solo para desarrollo."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # 🔒 PROTECCIÓN PARA PRODUCCIÓN
        if not settings.DEBUG:
            raise Http404("Debug endpoint only available in development")
        
        # ... resto del código
```

#### Frontend - Proteger página de debug

**Archivo:** `frontend/src/app/(dashboard)/dashboard/debug-auth/page.tsx`

```typescript
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function DebugAuthPage() {
  // 🔒 PROTECCIÓN PARA PRODUCCIÓN
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      redirect('/dashboard');
    }
  }, []);
  
  // ... resto del código
}
```

---

## 📊 RESUMEN DE ACCIONES

### ✅ Mantener Como Está (Bien Ubicados)

- `/tests/manual/test_auth_*.py` - Scripts de testing manual
- `/accounts/management/commands/fix_artist_profile.py` - Django command
- Todos los `*/tests.py` en cada app - Tests unitarios de Django

### 📁 Mover a Nueva Estructura

| Origen | Destino | Razón |
|--------|---------|-------|
| `/create_test_data.py` | `/scripts/seeders/create_test_data.py` | Scripts de seeding |
| `/create_painter_test_data.py` | `/scripts/seeders/create_painter_test_data.py` | Scripts de seeding |
| `/update_deps.sh` | `/scripts/dev/update_deps.sh` | Script de desarrollo |

### 🔒 Proteger para Producción

| Componente | Tipo | Acción |
|------------|------|--------|
| `DebugAuthView` | Backend | Añadir check `if not settings.DEBUG` |
| `/debug-auth` page | Frontend | Añadir redirect en producción |

### 📝 Crear Documentación

| Archivo | Ubicación | Contenido |
|---------|-----------|-----------|
| `README.md` | `/scripts/seeders/` | Documentar scripts de seeding |
| `README.md` | `/scripts/dev/` | Documentar scripts de desarrollo |

---

## 🚫 NO ELIMINAR

**Todos los scripts son útiles y deben conservarse**, solo necesitan:
1. Mejor organización
2. Protección para producción (endpoints debug)
3. Documentación clara

---

## 📖 CONVENCIONES

### Scripts de Seeding (`/scripts/seeders/`)

Scripts que crean datos de prueba en la BD:
- Naming: `create_*.py` o `seed_*.py`
- Deben ser idempotentes (usar `get_or_create`)
- Incluir prints informativos
- Documentar qué datos crean

### Scripts de Desarrollo (`/scripts/dev/`)

Scripts auxiliares para desarrollo:
- Gestión de dependencias
- Análisis de código
- Generadores de código
- Herramientas de debugging

### Tests Manuales (`/tests/manual/`)

Scripts de testing manual que requieren servidor corriendo:
- Naming: `test_*.py`
- No son tests automatizados
- Documentar cómo ejecutarlos
- Incluir instrucciones claras

### Django Management Commands

Commands que se ejecutan con `python manage.py <command>`:
- Ubicación: `<app>/management/commands/`
- Para operaciones de administración
- Deben heredar de `BaseCommand`
- Pueden usarse en producción

---

## 🔍 ENDPOINTS DE DEBUG A REVISAR

### Backend

```python
# accounts/urls.py - Línea 34
path('debug/', DebugAuthView.as_view(), name='debug_auth'),
```

**Estado Actual:** Público en desarrollo  
**Acción:** Proteger para producción con `settings.DEBUG` check

### Frontend

```
/dashboard/debug-auth → (dashboard)/dashboard/debug-auth/page.tsx
```

**Estado Actual:** Accesible en cualquier entorno  
**Acción:** Redirect a `/dashboard` en producción

---

## ✅ BENEFICIOS DE LA REORGANIZACIÓN

1. **Claridad** - Scripts organizados por propósito
2. **Mantenibilidad** - Fácil encontrar y actualizar scripts
3. **Seguridad** - Endpoints debug protegidos en producción
4. **Documentación** - Cada carpeta con su README
5. **Profesionalismo** - Estructura estándar de proyecto

---

**Siguiente paso:** Aplicar reorganización siguiendo este plan

