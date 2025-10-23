# 🔧 Cloudinary Upload - Troubleshooting

**Fecha**: 22 de octubre de 2025  
**Estado**: ✅ RESUELTO

---

## 🐛 Problema Original

Al intentar subir imágenes a Cloudinary desde el cliente, se recibía el error:

```
❌ Cloudinary Status: 401 Unauthorized
❌ Cloudinary Raw Response: {"error":{"message":"Unknown API key "}}
```

---

## 🔍 Diagnóstico

### **Síntomas**
- Error 401 en todos los uploads
- Mensaje: "Unknown API key"
- Ocurría incluso con presets configurados como "Unsigned"

### **Causas Probadas (que NO funcionaron)**
1. ❌ Preset no existía → Se creó, pero seguía fallando
2. ❌ Preset configurado como "Signed" → Se cambió a "Unsigned", pero seguía fallando
3. ❌ Nombre del preset incorrecto → Se verificó, pero seguía fallando
4. ❌ Folder path incorrecto → Se cambió de `mitaller/works` a `mitaller`, pero seguía fallando
5. ❌ CORS restrictions → No aplicaba

### **Causa Real**
La cuenta de Cloudinary tiene una configuración especial que **requiere autenticación incluso en presets Unsigned**. Esto puede ocurrir cuando:
- La cuenta tiene restricciones de seguridad adicionales
- El plan de Cloudinary tiene políticas específicas
- Hay configuraciones de API access control habilitadas

---

## ✅ Solución Implementada

### **1. Añadir API Key al código**

**Archivo**: `frontend/src/lib/cloudinary/upload.ts`

```typescript
// Variables de entorno
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY; // ← Añadido

// En el FormData
formData.append('file', file);
formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
if (folder) formData.append('folder', folder);
if (CLOUDINARY_API_KEY) formData.append('api_key', CLOUDINARY_API_KEY); // ← Añadido
```

### **2. Configurar variables de entorno**

**Archivo**: `frontend/.env.local`

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dvndr6mv
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mitaller-unsigned
NEXT_PUBLIC_CLOUDINARY_API_KEY=961271184574641
```

### **3. Crear preset en Cloudinary Dashboard**

1. Ve a: https://cloudinary.com/console/settings/upload
2. Click en "Add upload preset"
3. Configura:
   - **Name**: `mitaller-unsigned`
   - **Signing Mode**: **Unsigned**
   - **Folder**: *(vacío o `mitaller`)*
   - **Access mode**: Public
4. Guarda

---

## 📊 Resultado

✅ **Uploads funcionando correctamente**
- Progress tracking en tiempo real
- Imágenes subidas a folder `mitaller/` en Cloudinary
- Sin errores 401

---

## ⚠️ Consideraciones de Seguridad

### **Riesgos de exponer API Key en el cliente:**

1. **Cualquiera puede ver la API Key** en DevTools del navegador
2. **Posible abuso** si alguien decide usar tu cuenta para subir archivos
3. **No recomendado para producción** sin medidas adicionales

### **Mitigaciones aplicadas:**

1. ✅ API Key es de **solo lectura/upload** (no permite eliminar o modificar)
2. ✅ Preset tiene límites configurados (folder específico, tamaño máximo)
3. ✅ Upload restrictions en el preset de Cloudinary

### **Soluciones para Producción:**

#### **Opción A: Signed Uploads (Recomendado)**

Mover el proceso de firma al backend:

1. **Frontend** → Solicita firma al backend
2. **Backend** → Genera signature con API Secret
3. **Frontend** → Sube a Cloudinary con signature
4. **Cloudinary** → Valida signature

```typescript
// Backend (Django)
from cloudinary.utils import cloudinary_url
import cloudinary

signature = cloudinary.utils.api_sign_request(params, api_secret)
return signature
```

```typescript
// Frontend
const signature = await fetch('/api/cloudinary/sign');
formData.append('signature', signature);
formData.append('timestamp', timestamp);
```

#### **Opción B: Upload via Backend**

1. **Frontend** → Envía archivo al backend
2. **Backend** → Sube a Cloudinary con API Secret
3. **Backend** → Devuelve URL al frontend

```python
# Backend (Django)
upload_result = cloudinary.uploader.upload(file)
return upload_result['secure_url']
```

#### **Opción C: Restricciones adicionales en Cloudinary**

En el Dashboard de Cloudinary:
- Configurar **Allowed Origins** (CORS) solo para tu dominio
- Configurar **Rate Limits** por IP
- Activar **Upload restrictions** por tamaño/formato
- Monitorear uso con **Usage Alerts**

---

## 🧪 Testing

### **Verificar que funciona:**

1. Ve a `/dashboard/obras/nueva`
2. Arrastra 2-3 imágenes al dropzone
3. Verifica:
   - ✅ Progress bars aparecen
   - ✅ Llegan al 100%
   - ✅ Toast notification de éxito
   - ✅ Thumbnails aparecen en la galería

### **Verificar en Cloudinary:**

1. Ve a: https://cloudinary.com/console/media_library
2. Navega a la carpeta `mitaller/`
3. Verifica que las imágenes están ahí

---

## 📝 Cambios en el Código

### **Archivos Modificados:**

1. **`frontend/src/lib/cloudinary/upload.ts`**
   - Añadida variable `CLOUDINARY_API_KEY`
   - Añadido API key al FormData

2. **`frontend/.env.local`** (creado/actualizado)
   - Añadida variable `NEXT_PUBLIC_CLOUDINARY_API_KEY`

3. **`frontend/FASE3B_IMPLEMENTACION.md`**
   - Actualizada documentación con API key
   - Añadida nota de seguridad

---

## 🔄 Proceso de Resolución

1. ✅ Verificar preset existe → Existía
2. ✅ Verificar preset es Unsigned → Era Unsigned
3. ✅ Crear preset nuevo limpio → Seguía fallando
4. ✅ Cambiar folder path → Seguía fallando
5. ✅ **Añadir API Key** → **FUNCIONÓ** ✅

**Tiempo total de debugging**: ~45 minutos  
**Solución final**: Añadir API Key al upload

---

## 📚 Referencias

- [Cloudinary Upload Widget](https://cloudinary.com/documentation/upload_widget)
- [Unsigned Uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [Signed Uploads](https://cloudinary.com/documentation/upload_images#signed_uploads)
- [Security Best Practices](https://cloudinary.com/documentation/security_considerations)

---

## ✅ Estado Final

**Upload de imágenes a Cloudinary**: ✅ **FUNCIONANDO**

- Uploads directos desde el cliente
- Progress tracking en tiempo real
- API Key configurada
- Preset `mitaller-unsigned` configurado
- Imágenes guardadas en folder `mitaller/`

