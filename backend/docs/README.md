# 📚 Documentación del Backend

Índice de toda la documentación técnica del backend de MiTaller (Django + DRF).

---

## ⚙️ Configuración

- [**DEPENDENCY_MANAGEMENT.md**](./config/DEPENDENCY_MANAGEMENT.md) - Gestión de dependencias y actualizaciones

---

## 📦 Módulos de la Aplicación

### 🔐 Accounts (Autenticación y Usuarios)

Módulo de autenticación JWT con roles y permisos.

- [**AUTH_API_GUIDE.md**](./modules/accounts/AUTH_API_GUIDE.md) - Guía completa de la API de autenticación
- [**USER_MODEL_GUIDE.md**](./modules/accounts/USER_MODEL_GUIDE.md) - Guía del modelo de usuario personalizado
- [**IMPLEMENTATION_SUMMARY.md**](./modules/accounts/IMPLEMENTATION_SUMMARY.md) - Resumen de implementación
- [README.md](../../accounts/README.md) - README del módulo

---

### 🎨 Artists (Artistas)

Gestión de perfiles de artistas y portfolios.

- [**IMPLEMENTATION_SUMMARY.md**](./modules/artists/IMPLEMENTATION_SUMMARY.md) - Resumen de implementación (EN)
- [**RESUMEN_IMPLEMENTACION.md**](./modules/artists/RESUMEN_IMPLEMENTACION.md) - Resumen de implementación (ES)
- [README.md](../../artists/README.md) - README del módulo

---

### 🖼️ Works (Obras)

Sistema de gestión de obras de arte.

- [**IMPLEMENTATION_SUMMARY.md**](./modules/works/IMPLEMENTATION_SUMMARY.md) - Resumen de implementación
- Código fuente: [works/](../../works/)

---

### 🛒 Shop (Tienda)

Módulo de tienda y catálogo de productos.

- [**IMPLEMENTATION_SUMMARY.md**](./modules/shop/IMPLEMENTATION_SUMMARY.md) - Resumen de implementación
- [README.md](../../shop/README.md) - README del módulo

---

### 📦 Orders (Pedidos)

Sistema de gestión de pedidos y transacciones.

- [**IMPLEMENTATION_SUMMARY.md**](./modules/orders/IMPLEMENTATION_SUMMARY.md) - Resumen de implementación
- [README.md](../../orders/README.md) - README del módulo

---

### 💳 Payments (Pagos con Stripe Connect)

Integración completa con Stripe Connect para pagos multi-vendor.

- [**STRIPE_CONNECT_GUIDE.md**](./modules/payments/STRIPE_CONNECT_GUIDE.md) - Guía completa de Stripe Connect
- [**QUICK_START.md**](./modules/payments/QUICK_START.md) - Guía de inicio rápido
- [**RESUMEN_IMPLEMENTACION.md**](./modules/payments/RESUMEN_IMPLEMENTACION.md) - Resumen de implementación
- [README.md](../../payments/README.md) - README del módulo

---

## 📁 Enlaces Relacionados

- [Backend README](../README.md) - README principal del backend
- [Documentación General](../../docs/README.md) - Documentación completa del proyecto
- [Frontend Docs](../../frontend/docs/README.md) - Documentación del frontend

---

## 🚀 Quick Links

### Por Funcionalidad

**Autenticación:**
- [Guía de API](./modules/accounts/AUTH_API_GUIDE.md)
- [Modelo de Usuario](./modules/accounts/USER_MODEL_GUIDE.md)

**Pagos:**
- [Stripe Connect](./modules/payments/STRIPE_CONNECT_GUIDE.md)
- [Quick Start](./modules/payments/QUICK_START.md)

**Módulos Core:**
- [Artists](./modules/artists/)
- [Works](./modules/works/)
- [Shop](./modules/shop/)
- [Orders](./modules/orders/)

---

**Última actualización**: 21 de Octubre, 2025

