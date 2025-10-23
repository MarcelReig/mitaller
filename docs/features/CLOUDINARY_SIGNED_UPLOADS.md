# Cloudinary Signed Uploads - Guía Completa

**Última actualización**: 23 de octubre de 2025

> **🔧 ACTUALIZACIÓN IMPORTANTE (23/10/2025)**: Se corrigió el sistema de signed uploads para incluir `upload_preset` y `transformation` en los parámetros firmados. Esto garantiza que las transformaciones se apliquen en upload-time, solucionando problemas de orientación en fotos móviles y asegurando optimización automática (resize, WebP, strip EXIF).

## 📋 Tabla de Contenidos

- [Resumen](#resumen)
- [Conceptos Clave](#conceptos-clave)
- [Arquitectura](#arquitectura)
- [Implementación](#implementación)
- [Transformaciones](#transformaciones)
- [Troubleshooting](#troubleshooting)
- [Referencias](#referencias)

---

## Resumen

Sistema de **signed uploads** seguros a Cloudinary implementado en Mitaller. Permite a usuarios autenticados subir imágenes directamente desde el frontend a Cloudinary sin exponer las credenciales (API Secret).

### Características

✅ Upload directo desde cliente (no pasa por servidor)  
✅ Firmas de autenticación generadas en backend  
✅ API Secret nunca sale del servidor  
✅ Progress tracking en uploads  
✅ Transformaciones automáticas en delivery  
✅ Validación de archivos (tamaño, formato)  

---

## Conceptos Clave

### Signed vs Unsigned Uploads

| Aspecto | Unsigned Uploads | Signed Uploads |
|---------|-----------------|----------------|
| **Seguridad** | Menor (solo upload_preset) | Mayor (firma con API Secret) |
| **Autenticación** | No requiere | Requiere usuario autenticado |
| **Transformaciones** | Limitadas por preset | Flexibles y firmadas |
| **Control** | Limitado | Total control desde backend |

### ⚠️ Regla de Oro para Signed Uploads

**Todos los parámetros incluidos en la firma deben enviarse a Cloudinary junto con `file`, `api_key` y `signature`.**

Parámetros que **SÍ** se firman y envían:
- ✅ `timestamp` → Previene replay attacks
- ✅ `folder` → Organización de archivos
- ✅ `upload_preset` → Configuración predefinida de Cloudinary
- ✅ `transformation` → Transformaciones aplicadas en upload (garantizadas)

**IMPORTANTE**: Al incluir `upload_preset` y `transformation` en la firma, Cloudinary las aplica en el momento del upload, garantizando que las imágenes se procesen correctamente (rotación automática, redimensionado, optimización).

---

## Arquitectura

### Flujo General

```
┌─────────────┐       1. Solicita firma       ┌─────────────┐
│             │ ──────────────────────────────> │             │
│  Frontend   │                                 │   Backend   │
│  (Next.js)  │ <────────────────────────────── │   (Django)  │
│             │   2. Retorna firma + params     │             │
└─────────────┘                                 └─────────────┘
      │                                                 │
      │ 3. Upload directo                              │
      │    con firma                                    │ Usa API Secret
      v                                                 │ (nunca sale)
┌─────────────┐                                         │
│             │                                         │
│ Cloudinary  │ <───────────────────────────────────────┘
│     API     │   4. Valida firma
│             │   5. Acepta/Rechaza
└─────────────┘
```

### Componentes

#### Backend

**Archivo**: `backend/works/cloudinary_views.py`

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_upload_signature(request):
    """
    Genera firma segura para signed upload.
    
    Parámetros firmados:
    - timestamp: Tiempo actual (previene replay attacks)
    - folder: Carpeta destino en Cloudinary
    
    Retorna:
    - signature: Firma generada con API_SECRET
    - timestamp: Mismo timestamp usado en firma
    - api_key: API key público
    - cloud_name: Nombre de la cuenta
    - folder: Carpeta destino
    - transformation: String para aplicar en delivery
    """
    timestamp = int(time.time())
    folder = request.data.get('folder', 'mitaller')
    transformation = 'a_auto/c_limit,w_2000,h_2000/q_auto:good/f_auto/fl_strip_profile'
    
    # CRÍTICO: Incluir upload_preset y transformation para que se apliquen
    params = {
        'timestamp': timestamp,
        'folder': folder,
        'upload_preset': settings.CLOUDINARY_UPLOAD_PRESET,
        'transformation': transformation,
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        settings.CLOUDINARY_API_SECRET
    )
    
    return Response({
        'signature': signature,
        'timestamp': timestamp,
        'api_key': settings.CLOUDINARY_API_KEY,
        'cloud_name': settings.CLOUDINARY_CLOUD_NAME,
        'upload_preset': settings.CLOUDINARY_UPLOAD_PRESET,
        'folder': folder,
        'transformation': transformation,
    })
```

**Configuración**: `backend/config/settings.py`

```python
# Variables expuestas para usar en views
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
CLOUDINARY_UPLOAD_PRESET = os.getenv('CLOUDINARY_UPLOAD_PRESET', 'mitaller-unsigned')

# Configurar cliente de Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)
```

**Endpoints**:
- `POST /api/v1/works/cloudinary/signature/` → Generar firma
- `GET /api/v1/works/cloudinary/config/` → Config pública

#### Frontend

**Archivo**: `frontend/src/lib/cloudinary/upload.ts`

```typescript
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const { folder = 'mitaller', onProgress } = options;

  // 1. Validar archivo
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Solicitar firma al backend
  const signatureData = await getUploadSignature(folder);

  // 3. Crear FormData con todos los parámetros firmados
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signatureData.signature);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('api_key', signatureData.api_key);
  formData.append('upload_preset', signatureData.upload_preset);
  formData.append('folder', signatureData.folder);
  formData.append('transformation', signatureData.transformation);

  // 4. Upload directo a Cloudinary
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;
  
  // ... XMLHttpRequest con progress tracking
}
```

---

## Implementación

### Paso 1: Configuración de Variables de Entorno

**Backend** - `backend/.env`:

```bash
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

⚠️ **CRÍTICO**: Verifica que el `CLOUDINARY_CLOUD_NAME` sea el correcto. Un error aquí causará `401 Unauthorized` con mensaje "Invalid cloud_name".

### Paso 2: Backend - Endpoint de Firma

1. Crear view que genere firmas
2. Proteger con `IsAuthenticated`
3. Firmar **solo** `timestamp` y `folder`
4. Retornar firma + parámetros necesarios

### Paso 3: Frontend - Upload Helper

1. Solicitar firma al backend
2. Validar archivo (tamaño, formato)
3. Crear FormData con parámetros firmados
4. Upload directo a Cloudinary con XMLHttpRequest
5. Track progress y manejar errores

### Paso 4: Validación de Archivos

```typescript
export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
  maxFiles: 20,
} as const;

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
    return { valid: false, error: 'Archivo excede 10MB' };
  }
  
  if (!FILE_UPLOAD_CONFIG.acceptedFormats.includes(file.type)) {
    return { valid: false, error: 'Formato no válido' };
  }
  
  return { valid: true };
}
```

---

## Transformaciones

### Upload-time vs Delivery-time

| Momento | Cuándo Usar | Ventajas | Desventajas |
|---------|-------------|----------|-------------|
| **Upload-time** (firmado) | Transformaciones garantizadas | Aplicadas siempre, confiable | Más procesamiento en upload |
| **Delivery-time** (URL) | Transformaciones dinámicas | Flexible, on-demand | No garantizadas sin firma |

### Implementación Actual: Upload-time (Firmado)

**Backend firma la transformación**:

```python
transformation = 'a_auto/c_limit,w_2000,h_2000/q_auto:good/f_auto/fl_strip_profile'

params = {
    'timestamp': timestamp,
    'folder': folder,
    'upload_preset': settings.CLOUDINARY_UPLOAD_PRESET,
    'transformation': transformation,  # ← Firmado, se aplica en upload
}
```

**Componentes de la transformación**:

- `a_auto` → Auto-rotación basada en EXIF (fotos móvil)
- `c_limit,w_2000,h_2000` → Resize máximo 2000px (reduce peso)
- `q_auto:good` → Calidad automática optimizada
- `f_auto` → Formato automático (WebP en navegadores modernos)
- `fl_strip_profile` → Eliminar metadata EXIF (privacidad)

**Frontend aplica transformación en URL**:

```typescript
// URL original de Cloudinary
const originalUrl = result.secure_url;
// https://res.cloudinary.com/dvrdrd6mv/image/upload/v123456789/mitaller/abc123.jpg

// URL con transformación
const transformedUrl = `https://res.cloudinary.com/${cloud_name}/image/upload/${transformation}/${public_id}`;
// https://res.cloudinary.com/dvrdrd6mv/image/upload/a_auto/c_limit,w_2000,h_2000/q_auto:good/f_auto/fl_strip_profile/mitaller/abc123.jpg
```

### Helper de Transformaciones

```typescript
export function getTransformedUrl(
  cloudName: string,
  publicId: string,
  transformation: string
): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

export const CLOUDINARY_TRANSFORMATIONS = {
  thumbnail: 'w_400,h_400,c_fill,q_auto:eco,f_auto',
  medium: 'w_800,h_600,c_fill,q_auto:good,f_auto',
  large: 'w_1200,q_auto:good,f_auto',
} as const;
```

---

## Troubleshooting

### Error: 401 Unauthorized

**Mensaje**: `"Invalid cloud_name xxx"`

**Causa**: Cloud name incorrecto en `.env`

**Solución**:
1. Acceder a Cloudinary Dashboard → Settings → Account
2. Copiar el `Cloud name` exacto
3. Actualizar `CLOUDINARY_CLOUD_NAME` en `.env`
4. Reiniciar servidor Django

---

**Mensaje**: `"Invalid signature"`

**Causa**: Parámetros enviados no coinciden con los firmados

**Solución**:
1. Verificar que backend firme: `timestamp`, `folder`, `upload_preset`, `transformation`
2. Verificar que frontend envíe: `file`, `signature`, `timestamp`, `api_key`, `upload_preset`, `folder`, `transformation`
3. **IMPORTANTE**: Todos los parámetros firmados deben enviarse

---

### Error: "Empty file" (400)

**Causa**: Archivo vacío o no se envió correctamente

**Solución**:
1. Verificar que el File object sea válido
2. Verificar que FormData contenga el archivo
3. Verificar que no haya errores en la validación

---

### Error: CORS

**Causa**: Cloudinary rechaza request por CORS

**Solución**:
1. En Cloudinary Dashboard → Settings → Security
2. Añadir dominio a "Allowed fetch domains"
3. Para desarrollo: `http://localhost:3000`
4. Para producción: tu dominio real

---

### Error: "Signature has expired"

**Causa**: Timestamp muy antiguo (> 1 hora)

**Solución**:
1. Asegurar que timestamp se genere justo antes de upload
2. No cachear las firmas
3. Solicitar nueva firma en cada upload

---

### Debug Checklist

Cuando algo falla, verificar en orden:

1. ✅ **Cloud name correcto** en `.env`
2. ✅ **API Key y Secret** correctos
3. ✅ **Variables expuestas** en `settings.py`
4. ✅ **Parámetros firmados** = `timestamp` + `folder` + `upload_preset` + `transformation`
5. ✅ **FormData enviado** = `file` + `signature` + `timestamp` + `api_key` + `upload_preset` + `folder` + `transformation`
6. ✅ **Usuario autenticado** al solicitar firma
7. ✅ **CORS configurado** en Cloudinary
8. ✅ **Servidor reiniciado** después de cambios en `.env`

---

## Referencias

### Documentación Oficial

- [Cloudinary Signed Uploads](https://cloudinary.com/documentation/upload_images#signed_upload)
- [Cloudinary Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Cloudinary Security](https://cloudinary.com/documentation/control_access_to_media)

### Código Relevante

**Backend**:
- `backend/works/cloudinary_views.py` → Endpoints de firma
- `backend/config/settings.py` → Configuración Cloudinary
- `backend/works/urls.py` → Rutas

**Frontend**:
- `frontend/src/lib/cloudinary/upload.ts` → Helper de upload
- `frontend/src/hooks/useCloudinaryUpload.ts` → Hook React
- `frontend/src/components/works/ImageUploader.tsx` → Componente UI

### Endpoints

**Backend**:
- `POST /api/v1/works/cloudinary/signature/` → Generar firma
- `GET /api/v1/works/cloudinary/config/` → Config pública

**Cloudinary**:
- `POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload` → Upload
- `GET https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{public_id}` → Delivery

---

## Lecciones Aprendidas

### 1. Verificar Cloud Name PRIMERO

El 99% de errores 401 se deben a cloud_name incorrecto. Siempre verificar esto antes de investigar problemas de firma.

### 2. Upload Preset y Transformation SÍ van en Signed Uploads

Cuando incluyes `upload_preset` y `transformation` en los parámetros firmados, Cloudinary los aplica **garantizadamente** en el upload. Esto es especialmente importante para:
- Auto-rotación de fotos móviles (`a_auto`)
- Redimensionado automático (reduce peso 80-90%)
- Optimización de formato (WebP automático)

### 3. Transformaciones Firmadas = Transformaciones Garantizadas

Al firmar las transformaciones, te aseguras de que se apliquen siempre en el upload. Sin firma, las transformaciones solo se aplican en delivery (primera vez con latencia).

### 4. Todos los Parámetros Firmados Deben Enviarse

Si incluyes un parámetro en la firma del backend, **debes** enviarlo en el FormData del frontend. Omitir parámetros firmados causará "Invalid signature".

### 5. Logging Estratégico

En desarrollo, loggear:
- Parámetros firmados (backend)
- FormData enviado (frontend)
- Response de Cloudinary (frontend)

En producción, eliminar logs sensibles pero mantener error handling robusto.

### 6. Beneficios de las Transformaciones Firmadas

Con las transformaciones firmadas en upload:
- ✅ Fotos móviles siempre correctamente orientadas
- ✅ Peso reducido automáticamente (80-90% menor)
- ✅ Formato WebP en navegadores compatibles
- ✅ Metadata EXIF eliminada (privacidad - sin GPS)
- ✅ Sin latencia en primera carga (ya procesadas)

---

## Mantenimiento

### Actualizar Transformaciones

Para cambiar las transformaciones aplicadas:

1. Modificar string en `cloudinary_views.py`
2. NO necesita reiniciar servidor (se lee en cada request)
3. Solo afecta nuevos uploads
4. Imágenes existentes mantienen sus transformaciones

### Rotar Credenciales

Si necesitas rotar API Key/Secret:

1. Generar nuevas credenciales en Cloudinary Dashboard
2. Actualizar `.env`
3. Reiniciar servidor Django
4. Las firmas antiguas quedarán inválidas (por diseño)

### Migrar a Eager Transformations

Si decides usar eager en el futuro:

1. Añadir `eager` a params firmados en backend
2. Añadir `eager` a FormData en frontend
3. Cloudinary generará versiones al subir
4. Aumentará tiempo de upload pero reducirá latencia en delivery

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0  
**Autor**: Equipo Mitaller

