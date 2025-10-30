# Sistema Multi-Vendor - Implementación Backend

## 📋 Descripción General

Implementación completa del sistema multi-vendor para MiTaller.art que permite a múltiples artesanos vender productos de forma independiente con sus propios costes de envío, opciones de recogida y gestión de tienda.

## 🎯 Filosofía: "Juntos pero no revueltos"

Cada artesano mantiene:
- ✅ Su propia tienda independiente
- ✅ Sus propios costes de envío
- ✅ Su propia dirección de recogida
- ✅ Control sobre productos destacados
- ✅ Gestión autónoma de inventario

## 🔧 Cambios en Modelos

### 1. Product Model (`shop/models.py`)

#### Nuevos Campos

```python
is_featured = models.BooleanField(
    _('destacado'),
    default=False,
    help_text=_('Producto destacado por el artesano')
)

pickup_available = models.BooleanField(
    _('recogida disponible'),
    default=True,
    help_text=_('Permite recoger en taller')
)
```

#### Ordenamiento Actualizado

```python
class Meta:
    ordering = ['-is_featured', '-created_at']
```

Los productos destacados aparecen primero en los listados.

### 2. ArtisanProfile Model (`artisans/models.py`)

#### Nuevos Campos

```python
from decimal import Decimal

shipping_cost = models.DecimalField(
    _('coste de envío'),
    max_digits=10,
    decimal_places=2,
    default=Decimal('5.00'),
    help_text=_('Tarifa fija de envío del artesano (EUR)')
)

workshop_address = models.TextField(
    _('dirección del taller'),
    blank=True,
    help_text=_('Dirección completa para recogida en taller')
)

pickup_instructions = models.TextField(
    _('instrucciones de recogida'),
    blank=True,
    help_text=_('Ej: "Llamar 30min antes de venir"')
)
```

## 🔌 Nuevo Endpoint API

### GET /api/v1/artisans/{slug}/products/

Implementado como action en `ArtisanViewSet` (`artisans/views.py`):

```python
@action(detail=True, methods=['get'], url_path='products')
def products(self, request, slug=None):
    """
    Endpoint para obtener productos de un artesano específico.
    GET /api/v1/artisans/{slug}/products/
    """
    from shop.serializers import ProductSerializer

    artisan_profile = self.get_object()
    artisan_user = artisan_profile.user

    products = artisan_user.products.all()

    # Filtros
    is_active = request.query_params.get('is_active')
    if is_active is not None:
        products = products.filter(is_active=is_active.lower() == 'true')

    is_featured = request.query_params.get('is_featured')
    if is_featured is not None:
        products = products.filter(is_featured=is_featured.lower() == 'true')

    category = request.query_params.get('category')
    if category:
        products = products.filter(category=category)

    products = products.order_by('-is_featured', '-created_at')

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)
```

### Filtros Disponibles

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `is_active` | Boolean | Filtrar por estado activo | `?is_active=true` |
| `is_featured` | Boolean | Solo productos destacados | `?is_featured=true` |
| `category` | String | Filtrar por categoría | `?category=ceramics` |

### Ejemplos de Uso

```bash
# Todos los productos de un artesano
GET /api/v1/artisans/ToniMercadal/products/

# Solo productos destacados
GET /api/v1/artisans/ToniMercadal/products/?is_featured=true

# Solo productos activos
GET /api/v1/artisans/ToniMercadal/products/?is_active=true

# Productos activos de categoría cerámica
GET /api/v1/artisans/ToniMercadal/products/?is_active=true&category=ceramics
```

## 📦 Serializers Actualizados

### ProductSerializer (`shop/serializers.py`)

#### Campos Nuevos en Fields

```python
fields = [
    # ... campos existentes
    'is_featured',
    'pickup_available',
]
```

### ProductListSerializer (`shop/serializers.py`)

**Actualización importante**: El ProductListSerializer ahora incluye información completa del artesano y campos adicionales para mostrar en tarjetas de producto.

#### Campos Incluidos

```python
fields = [
    'id',
    'artisan',           # NUEVO - Información completa del artesano
    'name',
    'description',       # NUEVO
    'thumbnail_url',
    'images',           # NUEVO - Array de imágenes adicionales
    'category',
    'price',
    'stock',
    'is_active',
    'is_featured',
    'pickup_available',
    'is_available',
    'formatted_price',  # NUEVO
]
```

#### Método get_artisan

```python
def get_artisan(self, obj: Product) -> dict:
    """
    Retorna información básica del artesano asociado.
    Versión simplificada para listados.
    """
    try:
        artisan_profile = obj.artisan.artisan_profile
        return {
            'id': artisan_profile.id,
            'slug': artisan_profile.slug,
            'display_name': artisan_profile.display_name,
            'avatar': artisan_profile.avatar if artisan_profile.avatar else None,
            'shipping_cost': str(artisan_profile.shipping_cost),
        }
    except Exception:
        return {
            'id': obj.artisan.id,
            'slug': obj.artisan.username,
            'display_name': obj.artisan.username,
            'avatar': None,
            'shipping_cost': '5.00',
        }
```

### ArtisanProfileSerializer (`artisans/serializers.py`)

Agregados campos de shipping y pickup:

```python
class ArtisanProfileSerializer(serializers.ModelSerializer):
    class Meta:
        fields = [
            # ... campos existentes
            'shipping_cost',
            'workshop_address',
            'pickup_instructions',
        ]
```

## 🗄️ Migraciones

### shop/migrations/0002_product_multi_vendor.py

```python
from django.db import migrations, models
from decimal import Decimal

class Migration(migrations.Migration):
    dependencies = [
        ('shop', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='is_featured',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='pickup_available',
            field=models.BooleanField(default=True),
        ),
    ]
```

### artisans/migrations/0003_artisan_shipping.py

```python
from django.db import migrations, models
from decimal import Decimal

class Migration(migrations.Migration):
    dependencies = [
        ('artisans', '0002_previous_migration'),
    ]

    operations = [
        migrations.AddField(
            model_name='artisanprofile',
            name='shipping_cost',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('5.00'),
                max_digits=10
            ),
        ),
        migrations.AddField(
            model_name='artisanprofile',
            name='workshop_address',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='artisanprofile',
            name='pickup_instructions',
            field=models.TextField(blank=True),
        ),
    ]
```

## 🔍 Lógica de Negocio

### Carrito Multi-Vendor

El sistema permite agrupar productos por artesano en el carrito:

1. **Agrupación por Artesano**: Productos del mismo artesano se agrupan juntos
2. **Cálculo de Envío**: Cada artesano tiene su propio coste de envío fijo
3. **Opciones de Recogida**: Los productos con `pickup_available=True` permiten recogida en taller
4. **Subtotales Independientes**: Cada artesano tiene su subtotal + envío

### Ejemplo de Estructura de Carrito

```json
{
  "items_by_artisan": [
    {
      "artisan": {
        "id": 1,
        "slug": "ToniMercadal",
        "display_name": "Toni Mercadal",
        "shipping_cost": "5.00"
      },
      "items": [
        {
          "product": { "name": "Producto A", "price": "20.00" },
          "quantity": 2
        }
      ],
      "subtotal": 40.00,
      "shipping": 5.00,
      "total": 45.00
    },
    {
      "artisan": {
        "id": 2,
        "slug": "MargaPons",
        "display_name": "Marga Pons",
        "shipping_cost": "6.50"
      },
      "items": [
        {
          "product": { "name": "Producto B", "price": "15.00" },
          "quantity": 1
        }
      ],
      "subtotal": 15.00,
      "shipping": 6.50,
      "total": 21.50
    }
  ],
  "grand_total": 66.50
}
```

## 🎨 Productos Destacados

Los productos con `is_featured=True`:
- Aparecen primero en listados (ordenamiento `-is_featured`)
- Muestran badge "Destacado" en la UI
- Pueden filtrarse con `?is_featured=true`
- Controlados por cada artesano independientemente

## 📦 Opciones de Recogida

Productos con `pickup_available=True`:
- Muestran badge "Recogida disponible"
- En checkout, ofrecen opción de recogida (coste 0€)
- Muestran instrucciones del artesano al seleccionar recogida
- Requieren dirección del taller configurada

## 🔒 Seguridad y Permisos

No se modificaron los permisos existentes:
- Lectura pública de productos activos
- Solo el artesano dueño puede modificar sus productos
- `shipping_cost` y campos de recogida solo editables por el artesano

## ✅ Casos de Uso

### 1. Cliente Compra a Múltiples Artesanos

```
Carrito:
- 2 productos de Artesano A (envío 5€)
- 1 producto de Artesano B (envío 6.50€)

Total:
- Subtotal productos: 55€
- Envío total: 11.50€
- TOTAL: 66.50€
```

### 2. Cliente Elige Recogida

```
Carrito:
- 2 productos de Artesano A
  └─ Opción: Recogida en taller (0€)
  └─ Instrucciones: "Llamar 30min antes - 971123456"

- 1 producto de Artesano B
  └─ Opción: Envío (6.50€)

Total:
- Subtotal productos: 55€
- Envío: 6.50€
- TOTAL: 61.50€
```

### 3. Artesano Gestiona su Tienda

```python
# Ver todos sus productos
GET /api/v1/artisans/ToniMercadal/products/

# Destacar producto
PATCH /api/v1/shop/123/
{
  "is_featured": true
}

# Configurar envío
PATCH /api/v1/artisans/ToniMercadal/
{
  "shipping_cost": "7.00",
  "workshop_address": "Calle Mayor 15, Ciutadella",
  "pickup_instructions": "Llamar 30 minutos antes al 971123456"
}
```

## 📊 Métricas y Reporting

Cada artesano puede ver:
- Total de productos activos
- Productos destacados
- Stock disponible
- Productos con recogida habilitada

Future: Dashboard con métricas de ventas por artesano.

## 🚀 Estado de Implementación

- ✅ Modelos actualizados (Product + ArtisanProfile)
- ✅ Migraciones aplicadas
- ✅ Endpoint `/artisans/{slug}/products/` funcionando
- ✅ Serializers actualizados
- ✅ Sin cambios en permisos (reutilizan existentes)
- ✅ Ordering por is_featured implementado
- ✅ Filtros is_featured, category, is_active
- ✅ Tests del modelo Product pasando
- ✅ Frontend integrado

## 📝 Notas Técnicas

1. **Decimal para shipping_cost**: Garantiza precisión en cálculos monetarios
2. **Default 5.00€**: Valor por defecto razonable para envío en Menorca
3. **Campos opcionales**: `workshop_address` y `pickup_instructions` son opcionales
4. **Ordenamiento automático**: Los productos destacados siempre aparecen primero
5. **Compatibilidad**: Los productos existentes no se ven afectados (defaults aplicados)

## 🔄 Próximos Pasos

1. ✅ ~~Frontend de tiendas por artesano~~ (Implementado)
2. ⏳ Sistema de órdenes multi-vendor
3. ⏳ Dashboard de ventas para artesanos
4. ⏳ Notificaciones por email (nueva venta)
5. ⏳ Integración Stripe Connect para pagos

---

**Versión**: 1.0.0
**Fecha**: Octubre 2025
**Estado**: ✅ Implementado y funcionando
