# Orders App - Sistema de Pedidos MiTaller

## Descripción

La app **Orders** gestiona el sistema completo de pedidos y compras para el marketplace MiTaller. Implementa compras de **invitados sin registro**, reducción automática de stock, snapshots de productos y vistas filtradas por artesano.

## Características Principales

### 🛒 Compras sin Registro (Guest Checkout)

Los compradores **NO necesitan crear cuenta** para realizar pedidos:

```python
# POST /api/v1/orders/
{
  "customer_email": "comprador@example.com",
  "customer_name": "Juan Pérez",
  "customer_phone": "+34600000000",
  "shipping_address": "Calle Test 123, 1º A",
  "shipping_city": "Maó",
  "shipping_postal_code": "07701",
  "shipping_country": "España",
  "items": [
    {"product": 1, "quantity": 2},
    {"product": 3, "quantity": 1}
  ],
  "notes": "Por favor tocar el timbre"
}
```

**¿Por qué compras como invitado?**
- ✅ **Menor fricción**: No obligar a crear cuenta aumenta conversión
- ✅ **Rapidez**: Checkout en 1 paso vs 3-4 con registro
- ✅ **Simplicidad**: Email suficiente para seguimiento y confirmación
- ✅ **UX óptimo**: Usuarios ocasionales no quieren más cuentas

### 📸 Snapshot de Productos

Los **OrderItems** capturan nombre y precio del producto en el momento exacto de compra:

```python
class OrderItem(models.Model):
    product = ForeignKey(Product)  # Referencia al producto
    product_name = CharField()      # Snapshot: nombre en el momento
    product_price = DecimalField()  # Snapshot: precio en el momento
    quantity = PositiveIntegerField()
    subtotal = DecimalField()       # Calculado: price * quantity
```

**¿Por qué snapshots?**
- ✅ **Inmutabilidad**: El artesano puede cambiar precio después
- ✅ **Auditoría**: Registro histórico exacto para facturación
- ✅ **Legal**: Cumplimiento con requisitos fiscales
- ✅ **Integridad**: Los totales del pedido son permanentes

### ⚛️ Transacciones Atómicas

La creación de pedidos usa `@transaction.atomic` para garantizar consistencia:

```python
@transaction.atomic
def create(self, validated_data):
    order = Order.objects.create(...)
    for item_data in items_data:
        OrderItem.objects.create(...)
        product.stock -= quantity  # Reduce stock
        product.save()
    order.total_amount = sum(subtotals)
    order.save()
    return order
```

**¿Por qué transacción atómica?**
- ✅ **Consistencia**: O se crea todo o nada (no estados intermedios)
- ✅ **Stock preciso**: Evita race conditions en compras simultáneas
- ✅ **Rollback automático**: Si falla algo, se revierte todo
- ✅ **Sin doble venta**: Imposible vender más unidades que stock

### 📊 Vistas Filtradas por Rol

Los artesanos **solo ven pedidos** que contienen sus productos:

```python
def get_queryset(self):
    if user.is_staff:
        return queryset  # Admins ven todo
    if hasattr(user, 'artist_profile'):
        return queryset.filter(
            items__artist=user.artist_profile
        ).distinct()
    return queryset.none()  # Otros no ven nada
```

Endpoint especial para dashboard de ventas:

```
GET /api/v1/orders/my-sales/
```

Retorna **OrderItems** del artesano con datos del pedido.

## Modelos

### Order

Pedido completo realizado por comprador invitado.

**Campos principales:**
- `order_number`: Auto-generado (ORD-YYYYMMDD-XXXXXX)
- `customer_email`: Email del comprador
- `customer_name`: Nombre completo
- `shipping_*`: Dirección de envío
- `status`: pending/processing/shipped/delivered/cancelled
- `total_amount`: Total calculado automáticamente

### OrderItem

Línea individual dentro de un pedido.

**Campos principales:**
- `order`: FK a Order
- `product`: FK a Product (PROTECT)
- `artist`: FK a ArtistProfile (desnormalizado para queries)
- `product_name`: Snapshot del nombre
- `product_price`: Snapshot del precio
- `quantity`: Cantidad comprada
- `subtotal`: Calculado automáticamente (price * quantity)

### OrderStatus

Choices para estados del pedido:

```python
PENDING = 'pending'      # Pendiente (inicial)
PROCESSING = 'processing'  # Procesando
SHIPPED = 'shipped'      # Enviado
DELIVERED = 'delivered'   # Entregado
CANCELLED = 'cancelled'   # Cancelado
```

## API Endpoints

### Crear Pedido (Público)

```
POST /api/v1/orders/
```

**Permisos:** AllowAny (invitados)

**Validaciones:**
- ✅ Items no vacíos
- ✅ Productos disponibles
- ✅ Stock suficiente (quantity <= stock)
- ✅ Quantity > 0

**Proceso:**
1. Validar items y stock
2. Crear Order con datos del comprador
3. Crear OrderItems con snapshot de productos
4. Reducir stock de cada producto
5. Calcular total_amount
6. Retornar Order completo

### Listar Pedidos

```
GET /api/v1/orders/
```

**Permisos:** IsAuthenticated

**Filtrado por rol:**
- Artesanos: Solo pedidos con sus productos
- Admin/Staff: Todos los pedidos
- Otros: Ninguno

**Filtros disponibles:**
- `?status=pending`
- `?customer_email=email@example.com`
- `?search=ORD-20251012`
- `?ordering=-created_at`

### Ver Detalle

```
GET /api/v1/orders/{id}/
```

**Permisos:** IsAuthenticated + mismo filtrado de queryset

### Actualizar Estado

```
PATCH /api/v1/orders/{id}/
{
  "status": "processing"
}
```

**Permisos:** IsAuthenticated (típicamente admin/staff)

### Mis Ventas (Artesanos)

```
GET /api/v1/orders/my-sales/
```

**Permisos:** IsAuthenticated + debe ser artesano

Retorna **OrderItems** donde el artesano es vendedor.

**Útil para:**
- Dashboard de ventas
- Estadísticas de productos vendidos
- Comisiones y pagos

## Signals

### Restaurar Stock en Eliminación

```python
@receiver(post_delete, sender=OrderItem)
def restore_stock_on_item_delete(sender, instance, **kwargs):
    product.stock += instance.quantity
    product.save()
```

Se activa cuando:
- Se elimina un OrderItem directamente
- Se elimina un Order (cascade a items)

### Restaurar Stock en Cancelación

```python
@receiver(post_save, sender=Order)
def handle_order_cancellation(sender, instance, **kwargs):
    if instance.status == OrderStatus.CANCELLED:
        for item in instance.items.all():
            product.stock += item.quantity
            product.save()
```

Cuando un Order cambia a `CANCELLED`, se restaura el stock de todos los productos.

## Admin

### OrderAdmin

**Features:**
- Inline de OrderItems para ver productos
- Edición rápida de estado desde list view
- Filtros por estado y fecha
- Búsqueda por número, nombre, email
- Campos readonly para integridad (order_number, totales)
- Fieldsets organizados por secciones

### OrderItemAdmin

**Features:**
- Vista de todas las ventas individuales
- Filtros por artesano y estado del pedido
- Búsqueda por pedido, producto, artesano
- Ideal para análisis y auditoría

## Tests

Tests completos cubriendo:

### ✅ Modelos
- Generación automática de order_number
- Cálculo de subtotales
- String representations

### ✅ Creación de Pedidos
- Compras de invitados sin auth
- Reducción automática de stock
- Snapshot correcto de productos
- Cálculo de totales

### ✅ Validaciones
- No pedir más que stock disponible
- No pedir productos no disponibles
- No pedir cantidad <= 0
- No crear pedido sin items

### ✅ Queries y Permisos
- Artesanos solo ven sus pedidos
- Admins ven todos
- No autenticados no pueden listar

### ✅ Ventas de Artesanos
- Endpoint my-sales funciona
- Solo artesanos pueden acceder

### ✅ Signals
- Stock se restaura al borrar item
- Stock se restaura al cancelar pedido

### ✅ Transacciones Atómicas
- Rollback si falla un item
- Stock no se reduce si falla validación

Ejecutar tests:

```bash
cd /Users/marcelreig/Code/side-project/mitaller/backend
python manage.py test orders
```

## Migraciones

Crear y aplicar migraciones:

```bash
python manage.py makemigrations orders
python manage.py migrate orders
```

## Uso en Frontend

### Ejemplo: Checkout Flow

```typescript
// 1. Recopilar datos del carrito
const cartItems = [
  { product: 1, quantity: 2 },
  { product: 5, quantity: 1 }
];

// 2. Crear pedido (sin login)
const response = await fetch('/api/v1/orders/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_email: email,
    customer_name: fullName,
    customer_phone: phone,
    shipping_address: address,
    shipping_city: city,
    shipping_postal_code: postalCode,
    shipping_country: 'España',
    items: cartItems,
    notes: deliveryNotes
  })
});

const order = await response.json();
// order.order_number -> para confirmación
// order.total_amount -> para mostrar al usuario
```

### Ejemplo: Dashboard de Artesano

```typescript
// Ver mis ventas
const sales = await fetch('/api/v1/orders/my-sales/', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
}).then(r => r.json());

// sales.results -> array de OrderItems con datos del pedido
sales.results.forEach(sale => {
  console.log(`${sale.quantity}x ${sale.product_name}`);
  console.log(`Subtotal: ${sale.formatted_subtotal}`);
  console.log(`Pedido: ${sale.order.order_number}`);
});
```

## Seguridad

### ✅ Permisos Correctos
- Crear pedido: Público (necesario para invitados)
- Listar/ver pedidos: Solo autenticados
- Actualizar estado: Solo admin/staff (configurar permissions)

### ✅ Queryset Filtrado
- Artesanos SOLO ven pedidos con sus productos
- Imposible ver pedidos de otros artesanos
- Filtrado a nivel de queryset (no solo serializer)

### ✅ Validaciones Robustas
- Stock validado antes de crear pedido
- Productos validados (exist + available)
- Cantidades validadas (> 0, <= stock)
- Transacción atómica para consistencia

### ✅ Datos Sensibles
- Email del comprador visible para artesano (necesario para envío)
- Teléfono opcional y protegido
- No se guardan datos de pago (Stripe Connect lo maneja)

## Próximos Pasos

1. **Integración con Stripe Connect**
   - Crear PaymentIntent por pedido
   - Split payments a artesanos
   - Comisiones del marketplace

2. **Notificaciones Email**
   - Confirmación al comprador
   - Notificación al artesano
   - Actualizaciones de estado

3. **Tracking de Envíos**
   - Campo tracking_number
   - Integración con transportistas
   - API de seguimiento

4. **Dashboard de Ventas**
   - Gráficos de ventas por período
   - Productos más vendidos
   - Totales y comisiones

## Arquitectura

```
┌─────────────────────────────────────────────┐
│           COMPRADOR INVITADO                │
│     (Sin registro, solo email)              │
└────────────────┬────────────────────────────┘
                 │
                 │ POST /api/v1/orders/
                 ↓
┌─────────────────────────────────────────────┐
│       OrderCreateSerializer                 │
│  - Valida items y stock                     │
│  - Transacción atómica                      │
└────────────────┬────────────────────────────┘
                 │
                 ├─→ Crear Order (customer data)
                 │
                 ├─→ Para cada item:
                 │   ├─→ Capturar snapshot (name, price)
                 │   ├─→ Crear OrderItem
                 │   ├─→ Reducir Product.stock
                 │   └─→ Acumular subtotal
                 │
                 └─→ Actualizar Order.total_amount
                     └─→ Commit o Rollback
                         └─→ Retornar Order completo

┌─────────────────────────────────────────────┐
│          ARTESANO (autenticado)             │
└────────────────┬────────────────────────────┘
                 │
                 │ GET /api/v1/orders/
                 ↓
┌─────────────────────────────────────────────┐
│         OrderViewSet.get_queryset()         │
│  - Filtra por items__artist=user.profile    │
└────────────────┬────────────────────────────┘
                 │
                 └─→ Solo ve pedidos con SUS productos
```

## Soporte

Para dudas o issues con la app Orders:
1. Revisar logs de Django para errores
2. Verificar que signals están registrados (apps.py)
3. Comprobar permisos y filtrado de queryset
4. Validar que transacciones atómicas funcionan
5. Revisar tests para ejemplos de uso

---

**MiTaller.art** - Marketplace de artesanos de Menorca 🇪🇸

