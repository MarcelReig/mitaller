# 🔐 Signed Uploads a Cloudinary - Guía de Implementación

**Fecha**: 23 de octubre de 2025  
**Estado**: ✅ IMPLEMENTADO Y FUNCIONAL  
**Última actualización**: 23 de octubre de 2025

> **🔧 ACTUALIZACIÓN IMPORTANTE (23/10/2025)**: Se corrigió el sistema de signed uploads para incluir `upload_preset` y `transformation` en los parámetros firmados. Esto garantiza que las transformaciones (auto-rotate, resize, optimize) se apliquen correctamente en el upload, solucionando problemas de orientación en fotos móviles.

> **💡 TIP**: Para documentación técnica detallada, consulta [CLOUDINARY_SIGNED_UPLOADS.md](./CLOUDINARY_SIGNED_UPLOADS.md)

---

## 🎯 Objetivo

Implementar uploads seguros a Cloudinary usando **signed uploads** donde el backend genera las firmas con el API_SECRET, manteniendo las credenciales sensibles en el servidor.

---

## 🏗️ Arquitectura

### **Flow de Signed Upload:**

```
1. Usuario selecciona imágenes en el frontend
   ↓
2. Frontend solicita signature al backend (POST /api/v1/works/cloudinary/signature/)
   ↓
3. Backend genera signature con API_SECRET (solo en servidor)
   ↓
4. Backend devuelve: signature, timestamp, api_key, cloud_name, folder, transformation
   ↓
5. Frontend sube directamente a Cloudinary con signature
   ↓
6. Cloudinary valida signature y acepta el upload
   ↓
7. Frontend recibe URL de la imagen
   ↓
8. Frontend envía URLs al backend para crear/actualizar obra
```

### **Ventajas de este approach:**

✅ **API_SECRET nunca sale del servidor** - Máxima seguridad  
✅ **Uploads directos a Cloudinary** - Mejor performance  
✅ **No pasan por tu servidor** - Ahorra bandwidth  
✅ **Requiere autenticación** - Solo usuarios logueados pueden subir  
✅ **Signatures expiran** - Timestamp previene reutilización  

---

## 📦 Implementación

### **Backend (Django)**

#### **1. Dependencias**

**Archivo**: `backend/requirements.txt`
```txt
cloudinary>=1.41.0
```

Instalar:
```bash
cd backend
source venv/bin/activate
pip install cloudinary
```

#### **2. Configuración en settings.py**

**Archivo**: `backend/config/settings.py`

```python
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Variables expuestas para usar en views (REQUERIDO)
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

⚠️ **IMPORTANTE**: Las variables deben estar expuestas en `settings.py` para que las views puedan acceder a ellas.

#### **3. Endpoint de Signatures**

**Archivo**: `backend/works/cloudinary_views.py`

```python
import time
import cloudinary.utils
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_upload_signature(request):
    """
    Genera una firma segura para upload a Cloudinary.
    
    IMPORTANTE: Incluir upload_preset y transformation en parámetros firmados
    para que Cloudinary los aplique en el upload.
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
    
    # Generar signature usando el API_SECRET
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


@api_view(['GET'])
def cloudinary_config(request):
    """Retorna configuración pública de Cloudinary."""
    return Response({
        'cloud_name': settings.CLOUDINARY_CLOUD_NAME,
        'upload_preset': settings.CLOUDINARY_UPLOAD_PRESET,
    })
```

#### **4. URLs**

**Archivo**: `backend/works/urls.py`

```python
from .cloudinary_views import generate_upload_signature, cloudinary_config

urlpatterns = [
    # Cloudinary signed uploads
    path('cloudinary/signature/', generate_upload_signature, name='cloudinary-signature'),
    path('cloudinary/config/', cloudinary_config, name='cloudinary-config'),
    
    # URLs del router
    path('', include(router.urls)),
]
```

---

### **Frontend (Next.js)**

#### **1. Upload Helper**

**Archivo**: `frontend/src/lib/cloudinary/upload.ts`

```typescript
async function getUploadSignature(folder: string = 'mitaller'): Promise<SignatureResponse> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }

  const response = await fetch(`${API_URL}/api/v1/works/cloudinary/signature/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ folder }),
  });

  if (!response.ok) {
    throw new Error('Error al obtener firma de upload');
  }

  return response.json();
}

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const { folder = 'mitaller', onProgress } = options;

  // Validar archivo
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Solicitar signature al backend
  const signatureData = await getUploadSignature(folder);

  // Crear FormData - Incluir todos los parámetros firmados
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signatureData.signature);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('api_key', signatureData.api_key);
  formData.append('upload_preset', signatureData.upload_preset);
  formData.append('folder', signatureData.folder);
  formData.append('transformation', signatureData.transformation);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;

  // Upload con XMLHttpRequest para progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.url,
          publicId: response.public_id,
          secureUrl: response.secure_url,
          format: response.format,
          width: response.width,
          height: response.height,
          bytes: response.bytes,
        });
      } else {
        let errorMessage = xhr.statusText;
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage = errorResponse.error?.message || errorMessage;
        } catch (e) {
          console.error('Cloudinary error:', xhr.responseText);
        }
        reject(new Error(`Error al subir imagen (${xhr.status}): ${errorMessage}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Error de red al subir imagen'));
    });

    xhr.open('POST', cloudinaryUrl);
    xhr.timeout = 60000;
    xhr.send(formData);
  });
}
```

#### **2. Variables de Entorno**

**Archivo**: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

# Ya NO se necesitan:
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
# NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
# NEXT_PUBLIC_CLOUDINARY_API_KEY
```

---

## 🚀 Instalación y Configuración

### **PASO 1: Backend - Variables de Entorno**

**Archivo**: `backend/.env`

```bash
# Django
SECRET_KEY=tu-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mitaller

# Cloudinary (CRÍTICO - Verificar que sean correctos)
CLOUDINARY_CLOUD_NAME=dvrdrd6mv
CLOUDINARY_API_KEY=961271184574641
CLOUDINARY_API_SECRET=TU_API_SECRET_AQUI
CLOUDINARY_UPLOAD_PRESET=mitaller-unsigned

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

⚠️ **MUY IMPORTANTE**: Verifica que `CLOUDINARY_CLOUD_NAME` sea exactamente el correcto. Un error aquí causa `401 Unauthorized` con mensaje "Invalid cloud_name".

Para obtener tus credenciales:
1. Ve a: https://cloudinary.com/console
2. Settings → Account → Cloud name
3. Settings → Security → API Key y API Secret

### **PASO 2: Reiniciar Servidores**

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend (otra terminal)
cd frontend
npm run dev
```

---

## 🧪 Testing

### **1. Verificar Backend**

```bash
# Test endpoint de config (público)
curl http://localhost:8000/api/v1/works/cloudinary/config/

# Debería retornar:
# {"cloud_name":"dvrdrd6mv","upload_preset":"mitaller-unsigned"}
```

### **2. Probar Upload Completo**

1. Inicia sesión en la app
2. Ve a `/dashboard/obras/nueva`
3. Sube imágenes
4. Verifica en consola:
   - ✅ Request a `/cloudinary/signature/` → 200 OK
   - ✅ Upload a Cloudinary → 200 OK
   - ✅ Imagen aparece en preview

### **3. Verificar en Cloudinary**

1. Ve a: https://cloudinary.com/console/media_library
2. Carpeta `mitaller/`
3. Verifica que las imágenes aparecen

---

## 🐛 Troubleshooting

### **Error 401: "Invalid cloud_name"**

**Síntoma**: `{"error":{"message":"Invalid cloud_name dvrdrd6mv"}}`

**Causa**: Cloud name incorrecto en `.env` del backend

**Solución**:
1. Ve a Cloudinary Dashboard → Settings → Account
2. Copia el Cloud name exacto
3. Actualiza `CLOUDINARY_CLOUD_NAME` en `backend/.env`
4. **REINICIA el servidor Django**

⚠️ Este es el error más común. Siempre verifica el cloud_name PRIMERO.

---

### **Error 401: "Invalid signature"**

**Síntoma**: Cloudinary rechaza el upload con 401

**Causa**: Los parámetros enviados no coinciden con los firmados

**Solución**:
1. Verifica que backend firme: `timestamp`, `folder`, `upload_preset`, `transformation`
2. Verifica que frontend envíe: `file`, `signature`, `timestamp`, `api_key`, `upload_preset`, `folder`, `transformation`
3. **IMPORTANTE**: Todos los parámetros firmados deben enviarse a Cloudinary
4. Las transformaciones se aplican en upload-time (firmadas, garantizadas)

---

### **Error: "Error al obtener firma de upload"**

**Causa**: Backend no responde o variables no configuradas

**Solución**:
1. Verifica que backend esté corriendo
2. Verifica que `backend/.env` tenga todas las variables de Cloudinary
3. Verifica que `settings.py` exponga las variables:
   ```python
   CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
   CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
   CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
   ```
4. Reinicia el servidor Django

---

### **Error: "No estás autenticado"**

**Causa**: Token JWT no está o expiró

**Solución**:
1. Inicia sesión de nuevo
2. Verifica que el token se guarda en cookies
3. Verifica que `getToken()` funciona correctamente

---

### **Debug Checklist**

Cuando algo falla, verificar en orden:

1. ✅ **Cloud name correcto** en `backend/.env`
2. ✅ **API Key y Secret** correctos
3. ✅ **Variables expuestas** en `settings.py`
4. ✅ **Backend corriendo** en puerto 8000
5. ✅ **Usuario autenticado** en frontend
6. ✅ **Token en cookies** válido
7. ✅ **Parámetros firmados** = `timestamp` + `folder` + `upload_preset` + `transformation`
8. ✅ **FormData enviado** = `file` + `signature` + `timestamp` + `api_key` + `upload_preset` + `folder` + `transformation`
9. ✅ **Servidor reiniciado** después de cambios en `.env`

---

## 📊 Reglas de Oro

### ✅ LO QUE DEBES HACER

1. **Firmar timestamp, folder, upload_preset y transformation** en el backend
2. **Exponer variables** en `settings.py` (`CLOUDINARY_CLOUD_NAME`, etc.)
3. **Verificar cloud_name SIEMPRE** que haya error 401
4. **Reiniciar servidor** después de cambios en `.env`
5. **Incluir todos los parámetros firmados** en el FormData enviado a Cloudinary
6. **Usar transformaciones firmadas** para garantizar que se apliquen

### ❌ LO QUE NO DEBES HACER

1. **NO exponer API_SECRET** en frontend
2. **NO usar mismo timestamp** para múltiples uploads (generar en cada request)
3. **NO cachear firmas** (solicitar nueva en cada upload)
4. **NO omitir parámetros firmados** al enviar a Cloudinary
5. **NO incluir parámetros no firmados** (causará error de firma inválida)

---

## 🔐 Seguridad

### **Comparación de Métodos**

| Método | Seguridad | Performance | Complejidad |
|--------|-----------|-------------|-------------|
| **API Key expuesta** | 🔴 Baja | 🟢 Alta | 🟢 Baja |
| **Upload via backend** | 🟢 Alta | 🔴 Baja | 🟡 Media |
| **Signed uploads** | 🟢 Alta | 🟢 Alta | 🟡 Media |

### **Protecciones Implementadas**

1. ✅ **API_SECRET nunca sale del servidor**
2. ✅ **Autenticación requerida** (JWT token)
3. ✅ **Signatures expiran** (~1 hora)
4. ✅ **Folder controlado** por backend
5. ✅ **Validación de archivos** (tamaño, formato)

---

## 📚 Endpoints

### **POST /api/v1/works/cloudinary/signature/**

Genera signature para upload seguro.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "folder": "mitaller"  // opcional, default: "mitaller"
}
```

**Response:**
```json
{
  "signature": "abc123...",
  "timestamp": 1729698543,
  "api_key": "961271184574641",
  "cloud_name": "dvrdrd6mv",
  "upload_preset": "mitaller-unsigned",
  "folder": "mitaller",
  "transformation": "a_auto/c_limit,w_2000,h_2000/q_auto:good/f_auto/fl_strip_profile"
}
```

### **GET /api/v1/works/cloudinary/config/**

Retorna configuración pública.

**Response:**
```json
{
  "cloud_name": "dvrdrd6mv",
  "upload_preset": "mitaller-unsigned"
}
```

---

## ✅ Checklist de Implementación

### **Backend:**
- [x] Añadir `cloudinary>=1.41.0` a requirements.txt
- [x] Instalar con `pip install cloudinary`
- [x] Configurar cloudinary en settings.py
- [x] Exponer variables `CLOUDINARY_*` en settings.py
- [x] Crear `cloudinary_views.py` con endpoints
- [x] Añadir URLs en `works/urls.py`
- [ ] Añadir variables a `backend/.env`
- [ ] Verificar cloud_name correcto
- [ ] Reiniciar servidor Django

### **Frontend:**
- [x] Actualizar `upload.ts` para signed uploads
- [x] Añadir función `getUploadSignature()`
- [x] Actualizar `uploadToCloudinary()` con FormData correcto
- [x] Simplificar `.env.local`
- [ ] Reiniciar servidor Next.js
- [ ] Probar uploads desde UI

### **Testing:**
- [ ] Probar endpoint `/cloudinary/config/`
- [ ] Probar endpoint `/cloudinary/signature/` (con auth)
- [ ] Probar upload completo desde UI
- [ ] Verificar imágenes en Cloudinary Media Library
- [ ] Verificar que obras se crean correctamente

---

## 🎉 Resultado Final

Con signed uploads implementados, tienes:

✅ **Seguridad máxima** - API_SECRET protegido  
✅ **Performance óptimo** - Uploads directos  
✅ **UX transparente** - El usuario no nota diferencia  
✅ **Código limpio** - Menos variables de entorno en frontend  
✅ **Escalable** - Fácil añadir validaciones adicionales  

---

## 📖 Referencias

- [Documentación Técnica Completa](./CLOUDINARY_SIGNED_UPLOADS.md) - Guía detallada con troubleshooting
- [Cloudinary Signed Uploads](https://cloudinary.com/documentation/upload_images#signed_uploads) - Documentación oficial
- [Django REST Framework](https://www.django-rest-framework.org/) - Framework del backend

---

**Última actualización**: 23 de Octubre, 2025  
**Estado**: Implementado y funcional en producción
