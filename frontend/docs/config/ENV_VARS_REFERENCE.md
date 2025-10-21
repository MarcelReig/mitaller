# 🔐 Variables de Entorno - Referencia

Este archivo documenta todas las variables de entorno necesarias para el frontend de Mitaller.

## 📄 Archivo: `.env.local`

Crea este archivo en el root de `frontend/` con las siguientes variables:

```bash
# =============================================================================
# API BACKEND
# =============================================================================
# URL del backend Django
# Desarrollo: http://localhost:8000
# Producción: https://api.mitaller.art
NEXT_PUBLIC_API_URL=http://localhost:8000


# =============================================================================
# CLOUDINARY (Optimización de Imágenes)
# =============================================================================
# Obtén estos valores de: https://cloudinary.com/console

# Nombre de tu cloud (ej: "mitaller-art")
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name

# Preset de upload (ej: "mitaller_works")
# Configurar en: Settings > Upload > Upload presets
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-upload-preset


# =============================================================================
# STRIPE (Pagos)
# =============================================================================
# Llave pública de Stripe
# Desarrollo: pk_test_...
# Producción: pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx


# =============================================================================
# ANALYTICS (Opcional)
# =============================================================================
# Google Analytics 4
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Vercel Analytics
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
```

---

## 🚨 Importante

### Variables Públicas vs Privadas

**Públicas** (`NEXT_PUBLIC_*`):
- ✅ Accesibles en el navegador
- ✅ Pueden usarse en Server y Client Components
- ⚠️ Expuestas en el bundle del cliente
- 📝 Usa para: API URLs, IDs públicos, configuración de terceros

**Privadas** (sin `NEXT_PUBLIC_`):
- ✅ Solo accesibles en Server Components
- ✅ No se exponen en el cliente
- ✅ Más seguras para secrets
- 📝 Usa para: API keys privadas, secrets

### Ejemplo:
```typescript
// ✅ BIEN - Variable pública
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ MAL - No funcionará en Client Components
const secret = process.env.SECRET_KEY; // undefined en cliente
```

---

## 🔄 Reiniciar Servidor

**Después de cambiar `.env.local`, SIEMPRE reinicia Next.js:**

```bash
# Ctrl+C para detener
# Luego:
npm run dev
```

---

## 📂 Archivo `.gitignore`

Asegúrate de que `.env.local` esté en `.gitignore`:

```
# .gitignore
.env*.local
.env.local
.env.development.local
.env.production.local
```

✅ Ya está configurado en tu proyecto.

---

## 🎯 Variables por Fase

### Fase 1 (Portfolio Gallery) - **ACTUAL**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name  # Opcional ahora
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-preset   # Opcional ahora
```

### Fase 2 (Galería con Lightbox)
```bash
# Mismas variables de Fase 1
# Sin variables adicionales
```

### Fase 3 (Productos y Tienda)
```bash
# Variables de Fase 1 +
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 🧪 Verificar Variables

Crea un archivo de prueba temporal:

```typescript
// app/test-env/page.tsx
export default function TestEnv() {
  return (
    <div>
      <h1>Variables de Entorno</h1>
      <pre>
        {JSON.stringify({
          API_URL: process.env.NEXT_PUBLIC_API_URL,
          CLOUDINARY_CLOUD: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        }, null, 2)}
      </pre>
    </div>
  );
}
```

Visita: `http://localhost:3000/test-env`

⚠️ Elimina este archivo después de verificar.

---

## 🌍 Entornos

### Desarrollo Local
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Staging/Preview
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api-staging.mitaller.art
```

### Producción
```bash
# Variables en Vercel/hosting
NEXT_PUBLIC_API_URL=https://api.mitaller.art
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=mitaller-art
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 📚 Recursos

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Cloudinary Console](https://cloudinary.com/console)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)

