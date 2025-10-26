# Scripts de Utilidades y Desarrollo

Este directorio contiene scripts organizados para gestión, desarrollo y mantenimiento del proyecto.

---

## 📁 Estructura

```
scripts/
├── README.md                (este archivo)
├── limpiar_obras.py        (utilidad de limpieza)
│
├── seeders/                (datos de prueba)
│   ├── README.md
│   ├── create_test_data.py
│   └── create_painter_test_data.py
│
└── dev/                    (herramientas de desarrollo)
    ├── README.md
    ├── reset_database.sh   (⚠️ reset completo DB)
    └── update_deps.sh
```

---

## 🔧 Scripts en Raíz de `/scripts/`

### `limpiar_obras.py`
Script para limpiar obras de la base de datos.

**Uso:**
```bash
python scripts/limpiar_obras.py
```

**Funcionalidad:**
- Elimina obras de prueba
- Limpia registros huérfanos
- Útil para reset de datos de desarrollo

---

## 📂 Subcarpetas

### `/seeders/` - Datos de Prueba
Scripts para popular la BD con datos de testing.

**Ver:** [seeders/README.md](./seeders/README.md)

**Scripts:**
- `create_test_data.py` - Datos básicos para Orders
- `create_painter_test_data.py` - Pintor con portfolio completo

---

### `/dev/` - Herramientas de Desarrollo
Scripts auxiliares para desarrollo.

**Ver:** [dev/README.md](./dev/README.md)

**Scripts:**
- `update_deps.sh` - Gestión de dependencias Python

---

## 🗂️ Otros Scripts en el Proyecto

### Tests Manuales
**Ubicación:** `/backend/tests/manual/`

Scripts de testing manual que requieren servidor corriendo:
- `test_auth_endpoints.py` - Testing de endpoints JWT
- `test_auth_flow.py` - Testing de flujo completo

**Ver:** [tests/manual/README.md](../tests/manual/README.md)

---

### Management Commands
**Ubicación:** `/backend/<app>/management/commands/`

Django management commands (se ejecutan con `python manage.py <command>`):
- `fix_artist_profile.py` - Reparar perfiles de artista faltantes

**Uso:**
```bash
python manage.py fix_artist_profile
python manage.py fix_artist_profile --email user@example.com
```

---

### Tests Automatizados
**Ubicación:** `/backend/<app>/tests.py`

Tests unitarios de Django en cada app:
- `accounts/tests.py`
- `artists/tests.py`
- `works/tests.py`
- `shop/tests.py`
- `orders/tests.py`
- `payments/tests.py`

**Nota:** Estos deben permanecer en sus apps (convención Django).

---

## 📋 Convenciones

### Tipo de Script → Ubicación

| Tipo | Ubicación | Ejemplo |
|------|-----------|---------|
| Utilidades generales | `/scripts/` | `limpiar_obras.py` |
| Datos de prueba | `/scripts/seeders/` | `create_test_data.py` |
| Herramientas dev | `/scripts/dev/` | `update_deps.sh` |
| Tests manuales | `/tests/manual/` | `test_auth_flow.py` |
| Django commands | `<app>/management/commands/` | `fix_artist_profile.py` |
| Tests unitarios | `<app>/tests.py` | `accounts/tests.py` |

---

## 🚀 Quick Start

### Crear datos de prueba
```bash
# Datos básicos de Orders
python scripts/seeders/create_test_data.py

# Pintor con portfolio
python scripts/seeders/create_painter_test_data.py
```

### Gestionar dependencias
```bash
# Ver paquetes desactualizados
./scripts/dev/update_deps.sh outdated

# Actualizar paquete
./scripts/dev/update_deps.sh update stripe
```

### Testing manual
```bash
# Probar endpoints de auth
python tests/manual/test_auth_endpoints.py

# Probar flujo completo
python tests/manual/test_auth_flow.py
```

### Limpieza
```bash
# Limpiar obras
python scripts/limpiar_obras.py
```

---

**Última actualización:** Octubre 2025

