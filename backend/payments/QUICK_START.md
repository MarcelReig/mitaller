# 🚀 Quick Start - Stripe Connect en 10 Minutos

Guía rápida para tener Stripe Connect funcionando en desarrollo.

---

## ⚡ Paso 1: Instalar Stripe (1 min)

```bash
cd backend
source venv/bin/activate
pip install stripe==7.0.0
```

✅ **Resultado**: Librería Stripe instalada

---

## 🔑 Paso 2: Obtener API Keys de Stripe (2 min)

1. **Crear cuenta Stripe** (si no tienes):
   - Ir a https://dashboard.stripe.com/register
   - Completar registro (gratis)

2. **Obtener Test API Keys**:
   - Dashboard → **Developers** → **API keys**
   - Asegurar que estás en **Test mode** (switch arriba a la derecha)
   - Copiar:
     - **Publishable key**: `pk_test_51...`
     - **Secret key**: `sk_test_51...` (click "Reveal test key")

✅ **Resultado**: Tienes 2 keys copiadas

---

## 🛠️ Paso 3: Configurar .env (1 min)

```bash
# Editar backend/.env
nano backend/.env
```

Agregar estas líneas:

```bash
# Stripe Test Keys
STRIPE_PUBLIC_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI

# Webhook secrets (los configuramos en el siguiente paso)
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_TU_CONNECT_WEBHOOK_SECRET_AQUI
```

Reemplazar `pk_test_51xxx` y `sk_test_51xxx` con tus keys reales.

✅ **Resultado**: Variables de entorno configuradas

---

## 🎧 Paso 4: Configurar Webhooks con Stripe CLI (3 min)

### Instalar Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.18.0/stripe_1.18.0_linux_x86_64.tar.gz
tar -xvf stripe_1.18.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
# Descargar de https://github.com/stripe/stripe-cli/releases
```

### Login y escuchar webhooks:

```bash
# Login en Stripe
stripe login
# Presionar Enter para abrir navegador y autorizar

# Escuchar webhooks (dejar corriendo en terminal separado)
stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook/stripe/
```

**Output esperado:**
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

### Copiar webhook secret:

Copiar el `whsec_xxx` que aparece y agregarlo al `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
```

✅ **Resultado**: Webhooks configurados y escuchando

---

## 🗄️ Paso 5: Aplicar Migraciones (1 min)

```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

**Output esperado:**
```
Running migrations:
  Applying payments.0001_initial... OK
  Applying artists.0002_artistprofile_stripe_account_status_and_more... OK
  Applying orders.0002_order_payment_status_and_more... OK
```

✅ **Resultado**: Base de datos actualizada con modelos de pagos

---

## 🧪 Paso 6: Ejecutar Tests (1 min)

```bash
python manage.py test payments
```

**Output esperado:**
```
..............
----------------------------------------------------------------------
Ran 13 tests in 2.345s

OK
```

✅ **Resultado**: Todos los tests pasan

---

## 🚀 Paso 7: Iniciar Servidor (1 min)

```bash
python manage.py runserver
```

**Output esperado:**
```
Django version 5.0.1, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

✅ **Resultado**: Backend corriendo

---

## 🎉 ¡Listo! Ahora prueba la integración

### Terminal 1: Django runserver
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Terminal 2: Stripe CLI escuchando webhooks
```bash
stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook/stripe/
```

### Navegador: Django Admin
```
http://localhost:8000/admin/payments/payment/
```

---

## 🧪 Probar el Flow Completo

### 1. Crear artesano de prueba

```bash
# En Django shell
python manage.py shell
```

```python
from accounts.models import User
from artists.models import ArtistProfile

# Crear usuario artesano
user = User.objects.create_user(
    username='test_artisan',
    email='artisan@test.com',
    password='test123',
    role='artisan'
)

# Crear perfil de artesano
artist = ArtistProfile.objects.create(
    user=user,
    display_name='Artesano Test',
    craft_type='ceramics',
    location='mao'
)

print(f"Artesano creado: {artist.id}")
```

### 2. Probar onboarding (con cURL o Postman)

```bash
# Primero obtener token JWT
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artisan@test.com",
    "password": "test123"
  }'

# Copiar el "access" token de la respuesta

# Iniciar onboarding
curl -X POST http://localhost:8000/api/v1/payments/stripe-connect/start-onboarding/ \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_url": "http://localhost:3000/onboarding/refresh",
    "success_url": "http://localhost:3000/onboarding/success"
  }'

# Respuesta esperada:
{
  "onboarding_url": "https://connect.stripe.com/setup/e/acct_xxx/xxxxxx"
}
```

### 3. Completar onboarding en Stripe

1. Abrir la `onboarding_url` en navegador
2. Usar datos de prueba:
   - **Tipo de negocio**: Individual
   - **País**: España
   - **Email**: test@example.com
   - **Teléfono**: 123456789
   - **Nombre**: Test Artist
   - **Fecha nacimiento**: 01/01/1990
   - **Dirección**: Calle Test 123
   - **Ciudad**: Madrid
   - **Código postal**: 28001
   - **DNI/NIE**: 12345678A (cualquier formato)
   - **Cuenta bancaria**: ES91 2100 0418 4502 0005 1332 (IBAN de prueba)

3. Click "Submit"

### 4. Verificar estado de cuenta

```bash
curl -X GET http://localhost:8000/api/v1/payments/stripe-connect/account-status/ \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"

# Respuesta esperada:
{
  "status": "active",
  "charges_enabled": true,
  "payouts_enabled": true,
  "details_submitted": true
}
```

✅ **¡El artesano ya puede recibir pagos!**

### 5. Crear pedido y pagar (simulado)

```python
# En Django shell
from shop.models import Product
from orders.models import Order, OrderItem
from decimal import Decimal

# Crear producto
product = Product.objects.create(
    artist=artist,
    name='Producto Test',
    description='Descripción test',
    price=Decimal('50.00'),
    stock=10
)

# Crear pedido
order = Order.objects.create(
    customer_email='cliente@test.com',
    customer_name='Cliente Test',
    shipping_address='Calle Test 123',
    shipping_city='Maó',
    shipping_postal_code='07700',
    total_amount=Decimal('50.00')
)

# Agregar item
OrderItem.objects.create(
    order=order,
    product=product,
    artist=artist,
    product_name=product.name,
    product_price=product.price,
    quantity=1,
    subtotal=Decimal('50.00')
)

print(f"Pedido creado: {order.order_number}")
```

### 6. Crear sesión de checkout

```bash
curl -X POST http://localhost:8000/api/v1/payments/payments/create-checkout-session/ \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 1
  }'

# Respuesta esperada:
{
  "payment_intent_id": "pi_xxx",
  "client_secret": "pi_xxx_secret_xxx",
  "public_key": "pk_test_51...",
  "payment_id": 1
}
```

### 7. Simular pago exitoso con Stripe CLI

```bash
# En terminal de Stripe CLI
stripe trigger payment_intent.succeeded
```

**¡Webhook recibido!** Verifica en logs de Django:

```
Payment 1 succeeded for order ORD-20251013-ABC123
```

---

## 📊 Verificar en Admin de Django

1. Ir a http://localhost:8000/admin/
2. Login con superuser
3. Ir a **Payments → Payments**
4. Deberías ver el pago con estado "Exitoso"

---

## 🎯 Tarjetas de Prueba

Para probar pagos reales en frontend:

```
# ✅ Pago exitoso
Número: 4242 4242 4242 4242
Fecha: 12/34 (cualquier fecha futura)
CVC: 123 (cualquier 3 dígitos)

# ❌ Pago fallido (fondos insuficientes)
Número: 4000 0000 0000 9995

# 🔐 Requiere autenticación 3D Secure
Número: 4000 0025 0000 3155

# Más tarjetas: https://stripe.com/docs/testing#cards
```

---

## 🔍 Troubleshooting

### "No module named 'stripe'"
```bash
pip install stripe==7.0.0
```

### "STRIPE_SECRET_KEY not found"
```bash
# Verificar que .env tiene las keys:
cat backend/.env | grep STRIPE

# Si no están, agregarlas
```

### Webhook no se recibe
```bash
# Verificar que Stripe CLI está corriendo:
stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook/stripe/

# Verificar que el secret está en .env:
cat backend/.env | grep STRIPE_WEBHOOK_SECRET
```

### "Artist cannot receive payments"
```bash
# El artesano debe completar onboarding primero
# Verificar estado:
GET /api/v1/payments/stripe-connect/account-status/
```

### Migraciones no aplicadas
```bash
python manage.py migrate
```

---

## 📚 Siguiente: Leer Documentación

- **README.md**: Guía completa de uso
- **STRIPE_CONNECT_GUIDE.md**: Explicaciones técnicas profundas
- **RESUMEN_IMPLEMENTACION.md**: Resumen de todo lo implementado

---

## 🎊 ¡Felicidades!

Stripe Connect está funcionando en tu entorno de desarrollo.

**Próximo paso**: Implementar frontend con Stripe.js para el checkout completo.

---

_Quick Start Guide - MiTaller.art_

