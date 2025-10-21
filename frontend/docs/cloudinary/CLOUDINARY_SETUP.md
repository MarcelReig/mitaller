# 🖼️ Configuración de Cloudinary para Mitaller.art

## 📋 Resumen

Mitaller utiliza Cloudinary para optimización y transformación de imágenes, similar a como lo tenías configurado en Marina.

**Diferencias clave con Marina:**
- Marina: Vite (import.meta.env) + JavaScript
- Mitaller: Next.js 15 (process.env) + TypeScript
- Helper actualizado con tipos TypeScript completos
- Optimizado para Server Components

---

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Cloudinary

1. Ve a https://cloudinary.com/console
2. Crea una cuenta nueva (o usa una existente)
3. Crea un nuevo proyecto llamado "mitaller-art"
4. Anota tu **Cloud Name** (lo verás en el dashboard)

### 2. Crear Upload Preset

1. En el dashboard, ve a **Settings** > **Upload**
2. Scroll hasta **Upload presets**
3. Click en **Add upload preset**
4. Configura:
   ```
   Preset name: mitaller_works
   Signing mode: Unsigned
   Folder: works
   ```
5. Guarda el preset

### 3. Configurar Variables de Entorno

Crea/edita el archivo `.env.local` en el root de `frontend/`:

```bash
# Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name-aqui
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mitaller_works
```

⚠️ **IMPORTANTE**: Reinicia el servidor de Next.js después de cambiar variables de entorno.

---

## 📂 Estructura de Carpetas Sugerida

Organiza tus imágenes en Cloudinary así:

```
tu-cloud-name/
├── works/                      # Obras del portfolio
│   ├── juan-ceramista/
│   │   ├── vasijas-2024/
│   │   └── platos-decorativos/
│   └── maria-textil/
├── products/                   # Productos para venta
│   ├── juan-ceramista/
│   └── maria-textil/
└── artists/                    # Perfiles de artesanos
    ├── avatars/
    └── covers/
```

---

## 🎨 Transformaciones Disponibles

El helper de Cloudinary (`lib/cloudinary.ts`) incluye estas funciones:

### 1. `thumbUrl(url)` - Thumbnails para grids
```typescript
import { thumbUrl } from '@/lib/cloudinary';

<Image 
  src={thumbUrl(work.thumbnail_url)} 
  alt={work.title}
  width={600}
  height={600}
/>
```
**Transformación aplicada**: `c_fill,g_auto,w_600,h_600,q_auto:eco,f_auto,dpr_auto`
- Crop: fill (rellena espacio)
- Gravity: auto (enfoca en lo importante)
- Calidad: eco (optimizada para previews)

### 2. `avatarUrl(url)` - Avatares circulares
```typescript
import { avatarUrl } from '@/lib/cloudinary';

<Avatar>
  <AvatarImage src={avatarUrl(artist.avatar)} />
</Avatar>
```
**Transformación aplicada**: `c_fill,g_face,w_200,h_200,q_auto:good,f_auto,dpr_auto`
- Gravity: face (detecta y centra caras)

### 3. `galleryUrl(url)` - Imágenes en lightbox/galería
```typescript
import { galleryUrl } from '@/lib/cloudinary';

<Image 
  src={galleryUrl(work.images[0])} 
  alt="Imagen completa"
  width={1600}
  height={1200}
/>
```
**Transformación aplicada**: `c_limit,w_1600,q_auto:good,f_auto,dpr_auto`
- Crop: limit (mantiene proporciones, no corta)
- Calidad: good (alta calidad para zoom)

### 4. `coverUrl(url)` - Imágenes de portada
```typescript
import { coverUrl } from '@/lib/cloudinary';

<Image 
  src={coverUrl(artist.cover_image)} 
  alt="Portada"
  fill
/>
```

### 5. `transformImageUrl(url, params)` - Custom
```typescript
import { transformImageUrl } from '@/lib/cloudinary';

const customUrl = transformImageUrl(url, {
  w: 800,
  h: 600,
  c: 'fit',
  q: 'auto:best',
  e: 'blur:300' // efecto blur
});
```

---

## 📤 Upload de Imágenes

### Desde Frontend (Client Component)
```typescript
'use client';
import { uploadToCloudinary } from '@/lib/cloudinary';

async function handleUpload(file: File) {
  try {
    const url = await uploadToCloudinary(file, {
      preset: 'mitaller_works',
      folder: 'works/juan-ceramista/vasijas-2024'
    });
    
    console.log('Imagen subida:', url);
    // Guardar URL en Django
  } catch (error) {
    console.error('Error subiendo:', error);
  }
}
```

### Desde Backend (Django) - Recomendado
Para producción, es mejor subir desde el backend Django usando `cloudinary-python`:

```python
# backend/requirements.txt
cloudinary==1.36.0

# backend/config/settings.py
import cloudinary

cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

# En tus views/serializers
from cloudinary.uploader import upload

result = upload(file, folder='works/juan-ceramista')
thumbnail_url = result['secure_url']
```

---

## 🔐 Seguridad

### Upload desde Frontend (Unsigned)
- ✅ Ventaja: No requiere API key en frontend
- ⚠️ Limitación: Cualquiera puede subir (mitiga con rate limits)
- 📝 Usa para: Prototipos, demos

### Upload desde Backend (Signed)
- ✅ Ventaja: Control total, validaciones
- ✅ Ventaja: No expone credenciales
- 📝 Usa para: Producción

---

## 🧪 Testing en Desarrollo

Mientras configuras Cloudinary, puedes usar URLs de prueba:

```typescript
// Datos de prueba con URLs públicas
const mockWork = {
  thumbnail_url: 'https://via.placeholder.com/600x600',
  images: [
    'https://via.placeholder.com/1600x1200',
  ]
};
```

Las funciones de transformación **NO romperán** con URLs no-Cloudinary, simplemente las retornarán sin modificar.

---

## 📊 Comparación: Marina vs Mitaller

| Aspecto | Marina | Mitaller |
|---------|--------|----------|
| Framework | Vite + React | Next.js 15 |
| Env vars | `import.meta.env.VITE_` | `process.env.NEXT_PUBLIC_` |
| Lenguaje | JavaScript | TypeScript |
| Tipos | Sin tipos | Interfaces completas |
| Componentes | Client-side | Server + Client |
| Optimización | Manual | Automática (Next/Image) |

---

## ✅ Checklist de Configuración

- [ ] Crear cuenta/proyecto Cloudinary
- [ ] Anotar Cloud Name
- [ ] Crear upload preset "mitaller_works"
- [ ] Crear `.env.local` con variables
- [ ] Reiniciar servidor Next.js
- [ ] Probar transformaciones en `/artesanos/[slug]`
- [ ] (Opcional) Configurar upload desde Django

---

## 🆘 Troubleshooting

### Error: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado"
- Asegúrate de que `.env.local` existe y tiene la variable
- Reinicia el servidor de Next.js (`npm run dev`)
- Verifica que la variable empiece con `NEXT_PUBLIC_`

### Las imágenes no se transforman
- Verifica que las URLs sean de Cloudinary (contienen `/upload/`)
- Revisa la consola del navegador por errores
- Prueba la URL directamente en el navegador

### Upload falla con "Invalid signature"
- Si usas unsigned preset, asegúrate de que esté configurado como "Unsigned" en Cloudinary
- Verifica que el preset exista y esté activo

---

## 📚 Recursos

- [Documentación Cloudinary](https://cloudinary.com/documentation)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Cloudinary Transformation Reference](https://cloudinary.com/documentation/transformation_reference)

---

## 🎯 Siguiente Paso

Una vez configurado Cloudinary, el siguiente paso es implementar la **galería individual con lightbox** (equivalente a la vista de álbum en Marina).

Ver: `PROMPT #2: Galería Individual de Colección`

