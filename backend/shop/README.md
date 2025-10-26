# Shop - Tienda de Productos Artesanales

## 🛍️ Descripción

App de Django REST Framework para gestionar productos artesanales disponibles para venta en MiTaller.art.

## 🔑 Diferencia con Works

| Aspecto | Works (Portfolio) | Products (Shop) |
|---------|------------------|-----------------|
| Propósito | Mostrar talento | Generar ventas |
| Precio | No | Sí (EUR) |
| Stock | No | Sí (inventario) |
| Venta directa | No | Sí |
| Stripe | No | Sí (Connect) |
| Ejemplo | "Jarrón cerámica - técnica gres" | "Tazas cerámica - Pack 4 (23.50€)" |

## 📋 Modelo Product

```python
Product
├── artisan (ForeignKey → ArtisanProfile)  # ⚠️ ARTISAN, no artist
├── name (CharField, max_length=200)
├── description (TextField, opcional)
├── category (CharField, choices=ProductCategory)
├── price (DecimalField, en EUR)
├── stock (PositiveIntegerField)
├── thumbnail_url (URLField, Cloudinary)
├── images (JSONField, lista URLs)
├── is_active (BooleanField)
├── stripe_product_id (CharField, opcional)
├── stripe_price_id (CharField, opcional)
├── created_at (DateTimeField)
└── updated_at (DateTimeField)
```

**⚠️ Nota:** Los productos pertenecen a **artesanos** (`ArtisanProfile`), no a artistas. Ver [ARTISTS_VS_ARTISANS.md](../docs/ARTISTS_VS_ARTISANS.md).

### Properties
- `is_available`: `is_active and stock > 0`
- `formatted_price`: `"{price} EUR"`

## 🎯 Endpoints API

### Públicos
```bash
# Listar productos disponibles
GET /api/v1/shop/

# Detalle de producto
GET /api/v1/shop/{id}/
```

### Privados (Artesano dueño)
```bash
# Crear producto
POST /api/v1/shop/

# Actualizar producto
PUT/PATCH /api/v1/shop/{id}/

# Eliminar producto
DELETE /api/v1/shop/{id}/
```

## 🔍 Filtros y Búsqueda

```bash
# Por artesano
GET /api/v1/shop/?artisan=1

# Por categoría
GET /api/v1/shop/?category=ceramics

# Por estado
GET /api/v1/shop/?is_active=true

# Búsqueda texto
GET /api/v1/shop/?search=tazas

# Ordenamiento
GET /api/v1/shop/?ordering=-price     # Más caro primero
GET /api/v1/shop/?ordering=created_at # Más antiguo primero
GET /api/v1/shop/?ordering=name       # Alfabético
```

## 📦 Categorías

- `ceramics` - Cerámica
- `jewelry` - Joyería
- `leather` - Marroquinería
- `textiles` - Textiles
- `wood` - Madera
- `glass` - Vidrio
- `home_decor` - Decoración Hogar
- `accessories` - Accesorios
- `other` - Otro

## 🔐 Permisos

### IsArtisanOwnerOrReadOnly
- **Lectura**: Pública (cualquiera puede ver productos disponibles)
- **Escritura**: Solo el artesano dueño del producto

### Lógica de visibilidad:
- **Público**: Solo ve productos con `is_active=True` y `stock > 0`
- **Artesano autenticado**: Ve todos sus productos (incluidos inactivos/agotados)

## ✅ Validaciones

### Price
- Debe ser mayor que 0
- No se permiten precios negativos o cero

### Stock
- Debe ser mayor o igual a 0
- No se permiten valores negativos

### Images
- Debe ser una lista de strings (URLs)
- Cada URL debe comenzar con `http://` o `https://`
- Máximo 10 imágenes en galería

## 🖼️ ¿Por qué URLField para imágenes?

En lugar de `ImageField`, usamos `URLField` porque:

1. **CDN Externa**: Las imágenes ya están en Cloudinary
2. **No consume storage**: No se almacenan en servidor Django
3. **Transformaciones on-the-fly**: Cloudinary permite resize, crop, format automático
4. **URLs permanentes**: Accesibles globalmente sin dependencia del servidor
5. **Mejor rendimiento**: CDN distribuido vs servidor único

## 🔄 Signals

Los signals en `artisans/signals.py` mantienen sincronizado el contador:

```python
@receiver(post_save, sender='shop.Product')
def update_product_count_on_save(sender, instance, created, **kwargs):
    # Actualiza ArtisanProfile.total_products al crear/editar
    
@receiver(post_delete, sender='shop.Product')
def update_product_count_on_delete(sender, instance, **kwargs):
    # Actualiza ArtisanProfile.total_products al eliminar
```

## 🧪 Tests

```bash
# Ejecutar todos los tests
python manage.py test shop

# Ejecutar test específico
python manage.py test shop.ProductModelTestCase
python manage.py test shop.ProductAPITestCase
python manage.py test shop.ProductSignalsTestCase
```

**Cobertura actual**: 34 tests ✅

## 💻 Ejemplos de Uso

### Crear producto (como artesano)

```python
# POST /api/v1/shop/
{
    "name": "Tazas de Cerámica - Pack de 4",
    "description": "Hermosas tazas hechas a mano con técnica tradicional",
    "category": "ceramics",
    "price": "23.50",
    "stock": 12,
    "thumbnail_url": "https://res.cloudinary.com/mitaller/image/upload/v1/tazas-main.jpg",
    "images": [
        "https://res.cloudinary.com/mitaller/image/upload/v1/tazas-detail1.jpg",
        "https://res.cloudinary.com/mitaller/image/upload/v1/tazas-detail2.jpg"
    ],
    "is_active": true
}
```

### Actualizar stock

```python
# PATCH /api/v1/shop/{id}/
{
    "stock": 8
}
```

### Desactivar producto

```python
# PATCH /api/v1/shop/{id}/
{
    "is_active": false
}
```

## 🎨 Admin de Django

El admin está configurado con:
- Lista con campos clave (nombre, artista, precio, stock, disponibilidad)
- Filtros por artista, categoría, estado, fecha
- Búsqueda por nombre, descripción, artista
- Edición rápida de `is_active`
- Fieldsets organizados
- Campos readonly para datos calculados

Acceso: `/admin/shop/product/`

## 🔗 Integración Stripe Connect

Los campos `stripe_product_id` y `stripe_price_id` están preparados para integración futura.

**Siguiente paso**: Sincronizar productos con Stripe API cuando el artesano complete onboarding.

## 📊 Property `is_available`

```python
@property
def is_available(self) -> bool:
    """Indica si el producto está disponible para compra."""
    return self.is_active and self.stock > 0
```

**Casos de uso**:
- Filtrar productos en tienda
- Mostrar badge "Disponible" vs "Agotado"
- Habilitar/deshabilitar botón "Añadir al carrito"
- Dashboard del artesano (inventario bajo)

## 🚀 Estado de Implementación

- ✅ Modelo Product completo
- ✅ Admin configurado
- ✅ Serializers con validaciones
- ✅ Permisos personalizados
- ✅ ViewSet con filtros
- ✅ URLs configuradas
- ✅ Signals funcionando
- ✅ Tests completos (34/34)
- ✅ Migraciones aplicadas
- ✅ Sin errores de linting

**Ready for production** ✅

## 📝 Notas

- El campo `artisan` se asigna automáticamente al crear (no es editable)
- Los productos con stock=0 no aparecen en listados públicos
- Los productos inactivos solo los ve el artesano dueño
- Las imágenes deben subirse a Cloudinary antes de crear el producto
- Los signals mantienen sincronizado automáticamente el contador `total_products`
- **IMPORTANTE:** Los productos pertenecen a `artisans.ArtisanProfile`, NO a `artists.ArtistProfile`

---

**Versión**: 1.0.0  
**Django**: 5.0+  
**DRF**: 3.14+  
**Python**: 3.12+

