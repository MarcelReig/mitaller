# Shop App - Resumen de Implementación

## 📦 Descripción General

App completa de tienda de productos artesanales para MiTaller.art. Permite a los artesanos listar productos reales para venta con precio, stock y gestión de inventario.

## 🔑 Diferencia Clave: Works vs Products

### Works (Portfolio)
- **Función**: Mostrar talento y técnicas del artesano
- **Objetivo**: Atraer clientes y demostrar capacidades
- **Características**: Solo visual, sin precio, sin stock
- **Ejemplo**: "Jarrón de cerámica azul - Técnica de gres"

### Products (Tienda)
- **Función**: Generar ventas e ingresos reales
- **Objetivo**: Comercializar productos disponibles
- **Características**: Con precio, stock, integración Stripe Connect
- **Ejemplo**: "Tazas de cerámica esmaltada - Pack de 4" (23.50€, stock: 12)

## 📁 Archivos Implementados

### 1. `models.py`
- **ProductCategory**: TextChoices con 9 categorías de productos artesanales
- **Product**: Modelo completo con:
  - Relación ForeignKey con ArtistProfile
  - Campos de precio e inventario (price, stock)
  - Imágenes en Cloudinary (thumbnail_url, images JSONField)
  - Estado de visibilidad (is_active)
  - Integración Stripe Connect (stripe_product_id, stripe_price_id)
  - Properties calculadas: `is_available`, `formatted_price`
  - Índices optimizados para queries frecuentes

**¿Por qué URLField en lugar de ImageField?**
- Imágenes ya están en Cloudinary (CDN externo)
- No consume storage del servidor Django
- Mayor flexibilidad para transformaciones (resize, crop, format)
- URLs permanentes y accesibles globalmente
- Mejor rendimiento con CDN

### 2. `admin.py`
- **ProductAdmin**: Interface completa para gestionar productos
  - Vista de lista con información clave
  - Filtros por artesano, categoría, estado, fecha
  - Búsqueda por nombre, descripción, artesano
  - Campos readonly para datos calculados y Stripe
  - Edición rápida de `is_active`
  - Fieldsets organizados
  - Optimización con `select_related`

### 3. `serializers.py`
- **ProductSerializer**: Serializer completo para CRUD
  - Artista anidado (readonly, información básica)
  - Validación de images (lista de URLs válidas, máximo 10)
  - Validación de price (debe ser > 0)
  - Validación de stock (debe ser >= 0)
  
- **ProductListSerializer**: Serializer simplificado para listados
  - Solo campos esenciales para tarjetas/previews
  - Incluye información básica del artesano (id, slug, display_name, avatar, shipping_cost)
  - Incluye campos: description, images, formatted_price
  - Optimizado para rendimiento

### 4. `permissions.py`
- **IsArtisanOwnerOrReadOnly**: Permiso personalizado
  - Lectura pública (GET, HEAD, OPTIONS)
  - Escritura solo para artesano dueño
  - Valida autenticación y propiedad del objeto

### 5. `views.py`
- **ProductViewSet**: ViewSet completo con ModelViewSet
  - Endpoints públicos: GET (lista y detalle)
  - Endpoints privados: POST, PUT, PATCH, DELETE
  - Filtros: artist, category, is_active
  - Búsqueda: name, description
  - Ordenamiento: created_at, price, name
  - Queryset dinámico según usuario:
    - Público: Solo productos activos con stock > 0
    - Artesano: Todos sus productos (incluidos inactivos)
  - Asignación automática del artista al crear

### 6. `urls.py`
- Router de DRF con DefaultRouter
- Rutas automáticas para ViewSet
- Montado en `/api/v1/shop/`

### 7. `apps.py`
- Configuración de la app
- Carga automática de signals en `ready()`

### 8. `tests.py`
- **34 tests completos** (todos pasando ✅)
- Cobertura:
  - Modelo Product y propiedades
  - API REST endpoints y permisos
  - Validaciones de serializers
  - Signals de actualización de contador
  - Filtros, búsqueda y ordenamiento
  - Casos de error y edge cases

## 🔄 Signals Implementados

En `artists/signals.py`:

### `update_product_count_on_save`
- Se ejecuta al crear/actualizar un Product
- Actualiza `ArtistProfile.total_products`
- Recalcula el total para mantener consistencia

### `update_product_count_on_delete`
- Se ejecuta al eliminar un Product
- Decrementa `ArtistProfile.total_products`
- Mantiene sincronización automática

## 🔌 Integración

### Config actualizado:
- ✅ `config/settings.py`: Shop agregado a `INSTALLED_APPS`
- ✅ `config/urls.py`: Ruta `/api/v1/shop/` configurada

### Migraciones:
- ✅ `shop/migrations/0001_initial.py` generada
- ✅ Migración aplicada exitosamente

## 🎯 Endpoints Disponibles

### Públicos (sin autenticación):
```
GET    /api/v1/shop/products/              # Lista productos disponibles (activos con stock)
GET    /api/v1/shop/products/{id}/         # Detalle de un producto
```

### Privados (solo artesano dueño):
```
POST   /api/v1/shop/products/              # Crear nuevo producto
PUT    /api/v1/shop/products/{id}/         # Actualizar producto completo
PATCH  /api/v1/shop/products/{id}/         # Actualizar producto parcial
DELETE /api/v1/shop/products/{id}/         # Eliminar producto
```

### Filtros y búsqueda:
```
GET /api/v1/shop/products/?artist={id}           # Filtrar por artesano
GET /api/v1/shop/products/?category={category}   # Filtrar por categoría
GET /api/v1/shop/products/?is_active={bool}      # Filtrar por estado
GET /api/v1/shop/products/?search={query}        # Buscar en nombre/descripción
GET /api/v1/shop/products/?ordering={field}      # Ordenar (created_at, price, name)
```

## 🧪 Tests Ejecutados

```bash
python manage.py test shop
```

**Resultado**: ✅ **34 tests pasaron** en 5.121s

### Cobertura de tests:
- ✅ Modelo: 9 tests (creación, propiedades, ordenamiento)
- ✅ API REST: 21 tests (CRUD, permisos, filtros, validaciones)
- ✅ Signals: 4 tests (contador de productos)

## 📊 Property `is_available`

```python
@property
def is_available(self) -> bool:
    return self.is_active and self.stock > 0
```

**Uso**:
- Filtrar productos en tienda pública
- Mostrar badge "Disponible" o "Agotado" en UI
- Habilitar/deshabilitar botón de compra

**Lógica**:
- `is_active=True` + `stock > 0` = Disponible ✅
- `is_active=True` + `stock = 0` = Agotado ❌
- `is_active=False` + cualquier stock = No disponible ❌

## 🔒 Seguridad y Permisos

### Matriz de permisos:

| Acción | Anónimo | Admin | Artesano (dueño) | Artesano (otro) |
|--------|---------|-------|------------------|-----------------|
| Ver lista (disponibles) | ✅ | ✅ | ✅ | ✅ |
| Ver detalle | ✅ | ✅ | ✅ | ✅ |
| Crear producto | ❌ | ❌ | ✅ | ✅ |
| Editar propio | ❌ | ❌ | ✅ | ❌ |
| Editar ajeno | ❌ | ❌ | ❌ | ❌ |
| Eliminar propio | ❌ | ❌ | ✅ | ❌ |
| Eliminar ajeno | ❌ | ❌ | ❌ | ❌ |

### Validaciones implementadas:
- ✅ Price debe ser > 0
- ✅ Stock debe ser >= 0
- ✅ Images debe ser lista de URLs válidas
- ✅ Máximo 10 imágenes en galería
- ✅ Solo artesano dueño puede modificar
- ✅ Artista se asigna automáticamente al crear

## 🎨 Categorías de Productos

```python
class ProductCategory(models.TextChoices):
    CERAMICS = 'ceramics', 'Cerámica'
    JEWELRY = 'jewelry', 'Joyería'
    LEATHER = 'leather', 'Marroquinería'
    TEXTILES = 'textiles', 'Textiles'
    WOOD = 'wood', 'Madera'
    GLASS = 'glass', 'Vidrio'
    HOME_DECOR = 'home_decor', 'Decoración Hogar'
    ACCESSORIES = 'accessories', 'Accesorios'
    OTHER = 'other', 'Otro'
```

## 💳 Integración Stripe Connect (Preparada)

Campos listos para integración:
- `stripe_product_id`: ID del producto en Stripe
- `stripe_price_id`: ID del precio en Stripe

**Siguiente paso**: Implementar sincronización con Stripe API cuando el artesano complete onboarding.

## ✨ Características Destacadas

1. **Gestión de Inventario**: Stock automático con property `is_available`
2. **Visibilidad Dinámica**: Productos inactivos solo visibles para el dueño
3. **Imágenes en CDN**: URLs de Cloudinary para mejor rendimiento
4. **Sincronización Automática**: Signals actualizan contador en ArtistProfile
5. **Validaciones Robustas**: Precio, stock, imágenes validados
6. **Permisos Granulares**: Control fino de acceso por propiedad
7. **Tests Completos**: 34 tests cubriendo todos los casos
8. **Optimización de Queries**: `select_related` para evitar N+1
9. **API RESTful**: Endpoints estándar con filtros y búsqueda
10. **Admin Completo**: Interface Django admin lista para producción

## 🚀 Próximos Pasos

1. **Frontend**: Implementar UI de tienda en Next.js
2. **Stripe Connect**: Completar integración de pagos
3. **Carritos**: Implementar carrito de compras
4. **Órdenes**: Sistema de gestión de pedidos
5. **Pagos**: Procesar pagos con Stripe Connect
6. **Notificaciones**: Email al artesano cuando vende
7. **Analytics**: Dashboard de ventas para artesanos

## 📝 Notas Importantes

- Los productos con `stock=0` no aparecen en listados públicos
- Los productos `is_active=False` solo los ve el artesano dueño
- El campo `artist` se asigna automáticamente y no es editable
- Las imágenes deben subirse primero a Cloudinary
- Los signals mantienen sincronizado `total_products` en ArtistProfile
- La property `is_available` es calculada y readonly

---

**Implementación completada**: ✅ 100%
**Tests pasando**: ✅ 34/34
**Sin errores de linting**: ✅
**Migraciones aplicadas**: ✅
**Ready for production**: ✅

