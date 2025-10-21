# Guía Stripe Connect - MiTaller.art Marketplace

## Índice
1. [Tipos de Cuentas Stripe Connect](#tipos-de-cuentas-stripe-connect)
2. [Application Fee vs Transfer Data](#application-fee-vs-transfer-data)
3. [Por Qué los Webhooks Son Críticos](#por-qué-los-webhooks-son-críticos)
4. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
5. [Flow Completo del Pago](#flow-completo-del-pago)

---

## Tipos de Cuentas Stripe Connect

Stripe Connect ofrece tres tipos de cuentas para plataformas/marketplaces:

### 1. **Standard Accounts** (No usamos)
- Los usuarios se registran directamente en Stripe
- Tienen acceso completo al Dashboard de Stripe
- Control total sobre sus pagos y configuración
- **Desventaja**: Menos control para la plataforma, experiencia fragmentada

### 2. **Express Accounts** ✅ (Usamos este)
- **Onboarding simplificado** gestionado por Stripe
- Dashboard limitado de Stripe (pueden ver pagos básicos)
- **Verificación KYC automatizada** por Stripe
- Balance en la cuenta Stripe (no necesitan cuenta bancaria inmediata)
- **Mejor para marketplaces medianos** como MiTaller.art

**Por qué Express:**
```python
# ✅ Ventajas:
- Onboarding rápido (5-10 minutos vs horas)
- Stripe maneja toda la verificación legal/fiscal
- Artesanos pueden ver sus pagos en Stripe Dashboard
- Menos responsabilidad legal para nosotros
- Soporta transfers automáticos
- Cumplimiento PSD2/SCA automático en EU
```

### 3. **Custom Accounts** (No usamos)
- Control total sobre la experiencia
- Onboarding 100% customizado
- Dashboard completamente en tu plataforma
- **Desventaja**: Mayor complejidad, más responsabilidad legal
- Requiere más desarrollo y mantenimiento

**Resumen:**
| Característica | Standard | Express ✅ | Custom |
|---------------|----------|-----------|--------|
| Onboarding | Stripe | Stripe | Nosotros |
| KYC/Verificación | Stripe | Stripe | Nosotros |
| Dashboard | Completo | Limitado | No |
| Complejidad | Baja | Media | Alta |
| Control plataforma | Bajo | Medio | Alto |
| **Ideal para** | Básico | **Marketplaces** | Enterprise |

---

## Application Fee vs Transfer Data

### `application_fee_amount` (Lo que usamos)

Es la **comisión que retiene la plataforma** del pago total:

```python
# Ejemplo: Compra de 100 EUR
payment_intent = stripe.PaymentIntent.create(
    amount=10000,  # 100 EUR en centavos
    currency='eur',
    
    # 🎯 Comisión del marketplace (10% = 10 EUR)
    application_fee_amount=1000,  # 10 EUR en centavos
    
    # Transfer automático al artesano
    transfer_data={
        'destination': artist.stripe_account_id,  # Cuenta del artesano
    },
)

# Resultado:
# - Artesano recibe: 90 EUR (100 - 10)
# - Marketplace retiene: 10 EUR
# - Todo en una sola transacción
```

**Ventajas:**
- ✅ **Automático**: Transfer y comisión en un solo paso
- ✅ **Transparente**: El artesano ve la comisión en su dashboard
- ✅ **Contabilidad clara**: Stripe separa los fondos automáticamente
- ✅ **Reversible**: Si hay refund, la comisión también se revierte

### `transfer_data.destination` (Lo que usamos)

Indica la **cuenta conectada** (artesano) que recibirá el dinero:

```python
transfer_data={
    'destination': 'acct_1234567890',  # ID cuenta Stripe del artesano
}
```

**Importante:**
- Los fondos van **directamente** a la cuenta del artesano
- No pasan por tu cuenta bancaria
- Reduces responsabilidad fiscal (no tocas el dinero del artesano)
- El artesano puede retirar sus fondos cuando quiera

### Alternativa: Separate Charges and Transfers (No usamos)

```python
# ❌ Enfoque antiguo / más complejo:

# 1. Cobrar al cliente en la plataforma
charge = stripe.Charge.create(
    amount=10000,
    currency='eur',
)

# 2. Calcular comisión manualmente
artist_amount = 10000 - 1000  # 90 EUR

# 3. Transferir al artesano en paso separado
transfer = stripe.Transfer.create(
    amount=artist_amount,
    currency='eur',
    destination=artist_stripe_account_id,
)
```

**Desventajas:**
- ❌ Dos pasos (más complejo)
- ❌ Los fondos pasan por tu cuenta (más responsabilidad fiscal)
- ❌ Más difícil manejar refunds
- ❌ Más código y más propenso a errores

**Resumen:**
```
application_fee_amount + transfer_data = Solución moderna y recomendada
- Un solo PaymentIntent
- Split automático
- Menos código
- Mejor experiencia
```

---

## Por Qué los Webhooks Son Críticos

### ⚠️ NUNCA confiar solo en el frontend

```javascript
// ❌ INSEGURO - Frontend puede ser manipulado:
async function handlePayment() {
  const { error } = await stripe.confirmCardPayment(clientSecret);
  
  if (!error) {
    // ❌ NO HACER ESTO:
    await fetch('/api/orders/mark-paid', { orderId: 123 });
  }
}

// Problema: Un usuario malicioso puede:
// 1. Abrir DevTools
// 2. Ejecutar: fetch('/api/orders/mark-paid', { orderId: 999 })
// 3. Marcar cualquier pedido como pagado sin pagar
```

### ✅ SEGURO - Usar webhooks

Los webhooks son eventos que **Stripe envía a tu servidor** cuando ocurre algo importante:

```python
# ✅ SEGURO - Backend con verificación de firma:
@receiver
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    
    # 🔒 Verificar que el evento viene REALMENTE de Stripe
    event = stripe.Webhook.construct_event(
        payload, 
        sig_header, 
        STRIPE_WEBHOOK_SECRET
    )
    
    # Solo ahora confiamos en el evento
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Marcar pedido como pagado
        payment = Payment.objects.get(
            stripe_payment_intent_id=payment_intent['id']
        )
        payment.status = PaymentStatus.SUCCEEDED
        payment.save()
```

### Razones por las que los webhooks son críticos:

#### 1. **Seguridad**
```
Frontend puede ser manipulado ❌
Webhooks son firmados criptográficamente ✅
```

#### 2. **Confiabilidad**
```python
# Escenario: Usuario cierra el navegador antes de que termine el pago
# Frontend: No puede actualizar el pedido ❌
# Webhook: Stripe lo envía igualmente ✅

# Escenario: Conexión de internet falla
# Frontend: No puede comunicarse con tu API ❌
# Webhook: Stripe reintenta hasta 72 horas ✅
```

#### 3. **Eventos asíncronos**
```python
# Algunos eventos ocurren DESPUÉS del checkout:
- payment_intent.succeeded  # Pago confirmado
- charge.refunded           # Reembolso procesado
- transfer.paid             # Dinero llegó al artesano
- account.updated           # Artesano completó verificación

# Estos eventos NO se pueden manejar en frontend
```

#### 4. **Única fuente de verdad**
```python
# Flow correcto:
1. Frontend: Muestra loading spinner
2. Stripe: Procesa pago
3. Webhook: Actualiza base de datos ✅
4. Frontend: Consulta API y muestra "Pagado"

# El webhook es la ÚNICA fuente confiable del estado real
```

### Configuración de Webhooks

```bash
# 1. En desarrollo (usar Stripe CLI):
stripe listen --forward-to localhost:8000/api/v1/payments/webhook/stripe/

# 2. En producción (configurar en Stripe Dashboard):
# URL: https://mitaller.art/api/v1/payments/webhook/stripe/
# Eventos a escuchar:
#   - payment_intent.succeeded
#   - payment_intent.payment_failed
#   - charge.refunded
```

### Verificación de firma del webhook

```python
# Stripe incluye una firma en el header:
HTTP_STRIPE_SIGNATURE: t=1234567890,v1=abc123def456...

# Esta firma se genera con:
# 1. Timestamp del evento
# 2. Payload del evento (JSON)
# 3. Tu STRIPE_WEBHOOK_SECRET

# construct_event() verifica:
✅ Firma es válida (viene de Stripe)
✅ Timestamp es reciente (< 5 minutos, previene replay attacks)
✅ Payload no fue modificado

# Si falla alguna verificación = 400 Bad Request
```

**Resumen:**
```
Frontend: UI/UX + Loading states
Webhooks: Única fuente de verdad
Base de datos: Actualizada SOLO por webhooks
```

---

## Configuración y Variables de Entorno

### Archivo `.env` en backend

```bash
# Stripe Test Keys (desarrollo)
STRIPE_PUBLIC_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI

# Stripe Connect Webhook (para eventos de cuentas conectadas)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_TU_CONNECT_WEBHOOK_SECRET_AQUI

# Stripe Live Keys (producción) - ⚠️ NUNCA commitear
# STRIPE_PUBLIC_KEY=pk_live_TU_CLAVE_PUBLICA_PROD
# STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_PROD
# STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_PROD
```

### Obtener las keys:

1. **Public & Secret Keys:**
   - Dashboard Stripe → Developers → API keys
   - **Test mode**: Usar para desarrollo (datos de prueba)
   - **Live mode**: Usar en producción (pagos reales)

2. **Webhook Secret:**
   ```bash
   # Desarrollo (Stripe CLI):
   stripe listen --forward-to localhost:8000/api/v1/payments/webhook/stripe/
   # Output: > Ready! Your webhook signing secret is whsec_xxxxx
   
   # Producción (Dashboard):
   # Developers → Webhooks → Add endpoint
   # URL: https://mitaller.art/api/v1/payments/webhook/stripe/
   # Copiar "Signing secret"
   ```

### Tarjetas de prueba (Test mode):

```bash
# Pago exitoso
4242 4242 4242 4242
Exp: Cualquier fecha futura
CVC: Cualquier 3 dígitos
ZIP: Cualquier código postal

# Pago fallido (insuficientes fondos)
4000 0000 0000 9995

# Requiere autenticación 3D Secure
4000 0025 0000 3155

# Más tarjetas: https://stripe.com/docs/testing
```

---

## Flow Completo del Pago

### 1. **Artesano hace onboarding**

```
POST /api/v1/payments/stripe-connect/start-onboarding/
{
  "refresh_url": "http://localhost:3000/artista/configuracion/stripe/refresh",
  "success_url": "http://localhost:3000/artista/configuracion/stripe/success"
}

↓ Backend crea cuenta Express en Stripe
↓ Retorna URL de onboarding

Response:
{
  "onboarding_url": "https://connect.stripe.com/setup/e/acct_xxx/xxxxxxx"
}

↓ Frontend redirige al artesano a Stripe
↓ Artesano completa formulario (KYC, datos fiscales, cuenta bancaria)
↓ Stripe verifica identidad
↓ Stripe redirige a success_url

↓ Frontend consulta estado:
GET /api/v1/payments/stripe-connect/account-status/

Response:
{
  "status": "active",
  "charges_enabled": true,
  "payouts_enabled": true,
  "details_submitted": true
}

✅ Artesano puede recibir pagos
```

### 2. **Comprador crea pedido**

```
POST /api/v1/orders/orders/
{
  "customer_email": "cliente@ejemplo.com",
  "customer_name": "María García",
  "shipping_address": "Calle Principal 123",
  "shipping_city": "Maó",
  "shipping_postal_code": "07700",
  "items": [
    {
      "product_id": 5,
      "quantity": 2
    }
  ]
}

↓ Backend crea Order y OrderItems
↓ Calcula total_amount
↓ Reduce stock de productos

Response:
{
  "id": 42,
  "order_number": "ORD-20251013-ABC123",
  "total_amount": "120.00",
  "status": "pending",
  "payment_status": "pending"
}
```

### 3. **Frontend solicita sesión de checkout**

```
POST /api/v1/payments/payments/create-checkout-session/
{
  "order_id": 42
}

↓ Backend valida:
  ✓ Pedido existe
  ✓ No está pagado
  ✓ Tiene items
  ✓ Artesano puede recibir pagos

↓ Backend crea Payment record
↓ Calcula comisión marketplace (10%)
↓ Crea PaymentIntent en Stripe

Response:
{
  "payment_intent_id": "pi_3Xyz...abc",
  "client_secret": "pi_3Xyz...abc_secret_xxx",
  "public_key": "pk_test_51...",
  "payment_id": 15
}
```

### 4. **Frontend procesa pago con Stripe.js**

```javascript
// Frontend (Next.js)
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(public_key);

const { error, paymentIntent } = await stripe.confirmCardPayment(
  client_secret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'María García',
        email: 'cliente@ejemplo.com',
      },
    },
  }
);

if (error) {
  // Mostrar error al usuario
  console.error(error.message);
} else if (paymentIntent.status === 'succeeded') {
  // Mostrar loading (esperar webhook)
  console.log('Procesando pago...');
  
  // NO marcar como pagado aquí
  // Esperar confirmación del servidor
}
```

### 5. **Stripe procesa pago**

```
1. Cliente ingresa datos de tarjeta
2. Stripe tokeniza la tarjeta (seguridad PCI)
3. Stripe contacta banco emisor
4. Banco aprueba/rechaza transacción
5. Si requiere 3D Secure → Modal de autenticación
6. Stripe confirma el pago
```

### 6. **Webhook confirma pago** ✅ (Critical)

```
Stripe envía webhook:
POST /api/v1/payments/webhook/stripe/
Headers:
  Stripe-Signature: t=1234567890,v1=abc123...

Body:
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3Xyz...abc",
      "amount": 12000,
      "status": "succeeded",
      "charges": {
        "data": [{
          "id": "ch_3Xyz...def",
          "transfer": "tr_3Xyz...ghi"
        }]
      }
    }
  }
}

↓ Backend verifica firma
↓ Backend actualiza Payment:
  - status = SUCCEEDED
  - paid_at = now()
  - stripe_charge_id = "ch_3Xyz...def"
  - stripe_transfer_id = "tr_3Xyz...ghi"

↓ Signal actualiza Order:
  - payment_status = SUCCEEDED
  - status = PROCESSING

↓ Backend retorna 200 OK a Stripe
```

### 7. **Frontend verifica estado**

```javascript
// Frontend consulta periodicamente:
const checkPaymentStatus = async () => {
  const response = await fetch(`/api/v1/orders/orders/${orderId}/`);
  const order = await response.json();
  
  if (order.payment_status === 'succeeded') {
    // ✅ Mostrar confirmación
    router.push(`/pedidos/${order.order_number}/confirmacion`);
  }
};

// Polling cada 2 segundos por máximo 30 segundos
```

### 8. **Distribución de fondos**

```
Flow automático en Stripe:

Cliente paga: 120.00 EUR
   ↓
Stripe retiene comisión Stripe (~2.9% + 0.30 EUR): -3.78 EUR
   ↓
Monto neto: 116.22 EUR
   ↓
Split automático (application_fee_amount):
   ├─ Marketplace: 12.00 EUR (10% configurado)
   └─ Artesano: 104.22 EUR
        ↓
   Transfer automático a cuenta Stripe del artesano
        ↓
   Artesano puede retirar a su cuenta bancaria
```

### Diagrama de flujo:

```
Comprador         Frontend          Backend           Stripe          Artesano
    |                |                 |                 |                |
    |--Crea pedido-->|                 |                 |                |
    |                |--POST order---->|                 |                |
    |                |<--order_id------|                 |                |
    |                |                 |                 |                |
    |--Ingresa paga->|                 |                 |                |
    |                |--POST checkout->|                 |                |
    |                |                 |--Create PI----->|                |
    |                |<--client_secret-|<--PaymentIntent-|                |
    |                |                 |                 |                |
    |<--Card form----|                 |                 |                |
    |--Datos tarjeta>|                 |                 |                |
    |                |--Confirm------->|                 |                |
    |                |                 |--Process------->|                |
    |                |                 |                 |--Autoriza----->|
    |                |                 |                 |<--Aprueba------|
    |                |                 |<--Webhook-------|                |
    |                |                 |--Update DB----->|                |
    |                |<--Poll status---|                 |                |
    |<--Confirmación-|                 |                 |                |
    |                |                 |                 |--Transfer----->|
    |                |                 |                 |                |--Payout-->
```

---

## Próximos Pasos

1. **Configurar Stripe test keys** en `.env`
2. **Instalar Stripe CLI** para testing:
   ```bash
   brew install stripe/stripe-cli/stripe
   stripe login
   stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook/stripe/
   ```
3. **Aplicar migraciones**:
   ```bash
   python manage.py migrate
   ```
4. **Crear superuser** y verificar admin:
   ```bash
   python manage.py createsuperuser
   # Ir a http://localhost:8000/admin/payments/
   ```
5. **Ejecutar tests**:
   ```bash
   python manage.py test payments
   ```
6. **Implementar frontend** (Next.js):
   - Instalar `@stripe/stripe-js` y `@stripe/react-stripe-js`
   - Crear componente de checkout
   - Integrar con endpoints de payments

---

## Recursos

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Express Accounts Guide](https://stripe.com/docs/connect/express-accounts)
- [PaymentIntents API](https://stripe.com/docs/payments/payment-intents)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Testing](https://stripe.com/docs/testing)

---

**Nota**: Este código está configurado para **test mode**. Antes de ir a producción:
- Cambiar a Live mode keys
- Configurar webhooks en producción
- Revisar términos de servicio y compliance
- Configurar emails de confirmación
- Implementar manejo de refunds
- Añadir monitoring y alertas

