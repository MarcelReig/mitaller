# Payments - Integración Stripe Connect

## 📋 Resumen de Implementación

Integración completa de Stripe Connect para procesamiento de pagos en marketplace con split automático de comisiones.

## 🏗️ Estructura de Archivos

```
payments/
├── __init__.py              # Config de app
├── apps.py                  # PaymentsConfig con signals
├── models.py                # Payment, StripeAccountStatus, PaymentStatus
├── serializers.py           # PaymentSerializer, CheckoutSessionSerializer  
├── views.py                 # StripeConnectViewSet, PaymentViewSet, StripeWebhookView
├── urls.py                  # Rutas API
├── admin.py                 # Admin de Django para Payment
├── signals.py               # Auto-actualización de Orders
├── tests.py                 # Tests completos (onboarding, checkout, webhooks)
├── migrations/
│   └── 0001_initial.py      # Migración inicial de Payment
├── README.md                # Este archivo
└── STRIPE_CONNECT_GUIDE.md  # Guía técnica detallada
```

## 🔑 Modelos Implementados

### Payment
- **Relaciones**: OneToOne con Order, FK con ArtistProfile
- **Montos**: amount, marketplace_fee, artist_amount (auto-calculados)
- **Estado**: PaymentStatus (PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED, CANCELLED)
- **Stripe IDs**: payment_intent_id, charge_id, transfer_id
- **Metadata**: JSON field para datos adicionales
- **Métodos**: `calculate_fees(marketplace_fee_percent)`, formatted properties

### Modificaciones en modelos existentes:

**ArtistProfile** (artists/models.py):
- `stripe_account_id` - ID cuenta Stripe Connect
- `stripe_account_status` - StripeAccountStatus (PENDING, ACTIVE, RESTRICTED, DISABLED)
- `stripe_charges_enabled` - Puede recibir pagos
- `stripe_payouts_enabled` - Puede recibir transferencias
- `stripe_onboarding_completed` - Onboarding completado
- `stripe_onboarding_url` - URL temporal de onboarding
- `can_receive_payments` property - Verifica si está listo para pagos
- `needs_stripe_onboarding()` method - Verifica si necesita onboarding

**Order** (orders/models.py):
- `payment_status` - PaymentStatus del pedido
- `is_paid` property - Verifica si está pagado

## 🔌 API Endpoints

### Stripe Connect (Artesanos)
```
POST   /api/v1/payments/stripe-connect/start-onboarding/
POST   /api/v1/payments/stripe-connect/refresh-onboarding/
GET    /api/v1/payments/stripe-connect/account-status/
```

### Payments
```
GET    /api/v1/payments/payments/              # Lista pagos (filtrados por usuario)
GET    /api/v1/payments/payments/:id/          # Detalle de pago
POST   /api/v1/payments/payments/create-checkout-session/  # Crear sesión (público)
```

### Webhooks
```
POST   /api/v1/payments/webhook/stripe/        # Webhook de Stripe (público con firma)
```

## ⚙️ Configuración

### 1. Variables de entorno (.env)

```bash
# Stripe Test Keys
STRIPE_PUBLIC_KEY=pk_test_51xxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxxxx
```

### 2. Settings de Django (config/settings.py)

```python
INSTALLED_APPS = [
    # ...
    'payments',
]

STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
STRIPE_CONNECT_WEBHOOK_SECRET = os.getenv('STRIPE_CONNECT_WEBHOOK_SECRET')
MARKETPLACE_FEE_PERCENT = Decimal('10.0')  # 10% comisión
```

### 3. URLs (config/urls.py)

```python
urlpatterns = [
    # ...
    path('api/v1/payments/', include('payments.urls')),
]
```

## 🚀 Instalación y Setup

```bash
# 1. Activar virtualenv
cd backend
source venv/bin/activate

# 2. Instalar dependencias
pip install stripe==7.0.0

# 3. Aplicar migraciones
python manage.py migrate

# 4. Crear superuser (si no existe)
python manage.py createsuperuser

# 5. Ejecutar tests
python manage.py test payments

# 6. Ejecutar servidor
python manage.py runserver
```

## 🧪 Testing con Stripe CLI

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escuchar webhooks (terminal separado)
stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook/stripe/

# Copiar webhook secret que aparece y agregarlo a .env:
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 📊 Flow de Uso

### 1. Onboarding de Artesano

```python
# Frontend hace POST con URLs de redirección
POST /api/v1/payments/stripe-connect/start-onboarding/
{
  "refresh_url": "http://localhost:3000/onboarding/refresh",
  "success_url": "http://localhost:3000/onboarding/success"
}

# Response:
{
  "onboarding_url": "https://connect.stripe.com/setup/..."
}

# Frontend redirige al artesano a onboarding_url
# Artesano completa formulario en Stripe
# Stripe redirige de vuelta a success_url

# Frontend consulta estado:
GET /api/v1/payments/stripe-connect/account-status/
{
  "status": "active",
  "charges_enabled": true,
  "payouts_enabled": true,
  "details_submitted": true
}
```

### 2. Creación de Pedido

```python
# Comprador invitado crea pedido
POST /api/v1/orders/orders/
{
  "customer_email": "cliente@ejemplo.com",
  "customer_name": "Cliente Test",
  "shipping_address": "Calle Principal 123",
  "shipping_city": "Maó",
  "shipping_postal_code": "07700",
  "items": [{"product_id": 5, "quantity": 2}]
}

# Response:
{
  "id": 42,
  "order_number": "ORD-20251013-ABC123",
  "total_amount": "100.00",
  "status": "pending",
  "payment_status": "pending"
}
```

### 3. Checkout Session

```python
# Frontend solicita sesión de pago
POST /api/v1/payments/payments/create-checkout-session/
{
  "order_id": 42
}

# Response:
{
  "payment_intent_id": "pi_3Xyz...abc",
  "client_secret": "pi_3Xyz...abc_secret_xxx",
  "public_key": "pk_test_51...",
  "payment_id": 15
}

# Frontend usa client_secret con Stripe.js para procesar pago
```

### 4. Webhook de Confirmación

```python
# Stripe envía webhook cuando el pago se completa:
POST /api/v1/payments/webhook/stripe/
{
  "type": "payment_intent.succeeded",
  "data": { ... }
}

# Backend automáticamente:
# 1. Verifica firma del webhook
# 2. Actualiza Payment a SUCCEEDED
# 3. Signal actualiza Order a SUCCEEDED + PROCESSING
# 4. Retorna 200 OK a Stripe
```

## 🔒 Seguridad

### Verificación de Firma de Webhook

```python
# NUNCA confiar en el frontend para marcar pagos
# SIEMPRE verificar firma del webhook:

event = stripe.Webhook.construct_event(
    payload, 
    sig_header, 
    STRIPE_WEBHOOK_SECRET  # Secret único por webhook endpoint
)

# Si la firma es inválida → 400 Bad Request
# Solo eventos verificados actualizan la base de datos
```

### Permisos

- **StripeConnectViewSet**: Solo artesanos autenticados (`IsArtist`)
- **PaymentViewSet**: Autenticados (artesanos ven solo sus pagos, admins todos)
- **create_checkout_session**: Público (`AllowAny` para compradores invitados)
- **StripeWebhookView**: Público pero con verificación de firma

## 💰 Cálculo de Comisiones

```python
# Ejemplo con 10% de comisión:
amount = Decimal('100.00')
marketplace_fee_percent = Decimal('10.0')

marketplace_fee = (amount * marketplace_fee_percent) / Decimal('100')
# = 10.00 EUR

artist_amount = amount - marketplace_fee
# = 90.00 EUR

# En Stripe PaymentIntent:
stripe.PaymentIntent.create(
    amount=10000,  # 100.00 EUR en centavos
    application_fee_amount=1000,  # 10.00 EUR comisión
    transfer_data={
        'destination': artist.stripe_account_id  # 90.00 EUR al artesano
    }
)
```

## 🎯 Tarjetas de Prueba

```bash
# Pago exitoso
4242 4242 4242 4242

# Pago fallido (fondos insuficientes)
4000 0000 0000 9995

# Requiere autenticación 3D Secure
4000 0025 0000 3155

# Fecha: Cualquier fecha futura
# CVC: Cualquier 3 dígitos
# ZIP: Cualquier código
```

## 📈 Próximos Pasos

- [ ] Implementar frontend con Stripe.js
- [ ] Configurar emails de confirmación
- [ ] Implementar sistema de refunds
- [ ] Añadir manejo de disputas (chargebacks)
- [ ] Dashboard de pagos para artesanos
- [ ] Reportes de ventas y comisiones
- [ ] Integrar con sistema de facturación

## 📚 Recursos

- **Guía técnica detallada**: [STRIPE_CONNECT_GUIDE.md](./STRIPE_CONNECT_GUIDE.md)
- **Stripe Connect Docs**: https://stripe.com/docs/connect
- **Testing**: https://stripe.com/docs/testing
- **Webhooks**: https://stripe.com/docs/webhooks

## ✅ Tests Implementados

```bash
# Ejecutar todos los tests
python manage.py test payments

# Tests incluidos:
✓ Onboarding de artesanos
✓ Creación de cuenta Stripe Express
✓ Refresh de link de onboarding
✓ Verificación de estado de cuenta
✓ Creación de checkout session
✓ Validaciones de pedidos
✓ Procesamiento de webhooks (succeeded/failed)
✓ Cálculo de comisiones
✓ Actualización automática de Orders vía signals
```

## 🐛 Troubleshooting

### Webhook no se recibe
```bash
# Verificar que Stripe CLI está corriendo:
stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook/stripe/

# Verificar que el secret está en .env
echo $STRIPE_WEBHOOK_SECRET
```

### Error "Artist cannot receive payments"
```bash
# Verificar estado del artesano:
GET /api/v1/payments/stripe-connect/account-status/

# Debe retornar:
{
  "status": "active",
  "charges_enabled": true,
  "payouts_enabled": true
}
```

### Error "No module named 'stripe'"
```bash
# Asegurar que stripe está instalado:
pip install stripe==7.0.0
pip freeze | grep stripe
```

## 👨‍💻 Autor

Implementado para MiTaller.art Marketplace - Artesanos de Menorca

---

**Nota**: Este código usa Stripe Test Mode. Antes de producción, cambiar a Live Mode keys y configurar webhooks en el Dashboard de Stripe.

