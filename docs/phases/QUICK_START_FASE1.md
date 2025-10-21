# 🚀 Quick Start - Fase 1: Portfolio Gallery

## ✅ Implementación Completada

Todo el código está listo y funcionando. Solo necesitas arrancar los servidores.

---

## 📋 Pre-requisitos

✅ Python virtual environment configurado
✅ Node.js y npm instalados
✅ PostgreSQL corriendo (si usas base de datos local)

---

## 🎯 Arrancar en 3 Pasos

### 1️⃣ Backend (Django)

```bash
# Navegar al backend
cd /Users/marcelreig/Code/side-project/mitaller/backend

# Activar entorno virtual
source venv/bin/activate

# Verificar que Django funciona
python manage.py check

# Aplicar migraciones (si es necesario)
python manage.py migrate

# Arrancar servidor
python manage.py runserver
```

✅ Backend corriendo en: **http://localhost:8000**

**Verificar endpoint nuevo:**
```bash
# En otra terminal:
curl http://localhost:8000/api/v1/artists/
# Debería retornar lista de artistas (puede estar vacía)
```

---

### 2️⃣ Frontend (Next.js)

```bash
# Nueva terminal
cd /Users/marcelreig/Code/side-project/mitaller/frontend

# Instalar dependencias (si es primera vez)
npm install

# Verificar variables de entorno
# Crea .env.local con:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Arrancar Next.js
npm run dev
```

✅ Frontend corriendo en: **http://localhost:3000**

---

### 3️⃣ Probar la Implementación

Abre en tu navegador:

```
http://localhost:3000/artesanos/[slug-de-un-artesano]
```

**Ejemplo:**
```
http://localhost:3000/artesanos/juan-ceramista
```

---

## 🧪 Crear Datos de Prueba

Si no tienes artesanos en la base de datos:

```bash
cd /Users/marcelreig/Code/side-project/mitaller/backend
source venv/bin/activate
python create_test_data.py
```

Esto creará artesanos de ejemplo con obras.

---

## 🔍 Verificar Endpoints

### Artista individual:
```bash
curl http://localhost:8000/api/v1/artists/juan-ceramista/
```

### **Nuevo endpoint - Obras del artista:**
```bash
curl http://localhost:8000/api/v1/artists/juan-ceramista/works/
```

Debería retornar:
```json
[
  {
    "id": 1,
    "title": "Vasija tradicional",
    "thumbnail_url": "https://...",
    "category": "ceramics",
    "is_featured": false,
    "display_order": 1
  }
]
```

---

## ❌ Troubleshooting

### Error: "No module named 'django'"
```bash
# Asegúrate de activar el venv:
cd backend
source venv/bin/activate
```

### Error: "fetch failed" en Next.js
```bash
# Verifica que Django esté corriendo:
curl http://localhost:8000/api/v1/artists/

# Verifica .env.local:
cat frontend/.env.local
# Debe contener: NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Error: 404 Not Found en /artesanos/[slug]
```bash
# Verifica que existan artesanos:
curl http://localhost:8000/api/v1/artists/

# Si está vacío, crea datos de prueba:
cd backend
python create_test_data.py
```

### Error: CORS en el navegador
```bash
# Verifica CORS en backend/config/settings.py:
# Debe tener:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

---

## 📦 Archivos Creados/Modificados

### Backend:
- ✅ `backend/artists/views.py` - Añadido método `works()`

### Frontend:
- ✅ `frontend/src/lib/cloudinary.ts` - Helper de imágenes
- ✅ `frontend/src/types/work.ts` - Tipos actualizados
- ✅ `frontend/src/components/works/WorkCard.tsx`
- ✅ `frontend/src/components/works/WorkGrid.tsx`
- ✅ `frontend/src/components/artists/ArtisanHeader.tsx`
- ✅ `frontend/src/app/(public)/artesanos/[slug]/page.tsx` - **Reemplazado**
- ✅ `frontend/src/app/(public)/artesanos/[slug]/loading.tsx`

---

## 🎨 Cloudinary (Opcional)

Por ahora, las transformaciones de Cloudinary están **preparadas pero no son requeridas**.

Para configurar Cloudinary:
1. Lee: `frontend/CLOUDINARY_SETUP.md`
2. Crea cuenta en https://cloudinary.com
3. Añade variables a `.env.local`:
   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-preset
   ```

Mientras tanto, las imágenes se cargarán directamente sin transformaciones.

---

## 📸 Screenshots de lo que Deberías Ver

### 1. Página de artesano:
- ✅ Header con avatar, nombre, ubicación
- ✅ Grid de obras (1/2/3 columnas según pantalla)
- ✅ Cards con hover effect
- ✅ Badge "Destacado" si aplica

### 2. Loading state:
- ✅ Skeletons animados mientras carga

### 3. Empty state:
- ✅ Mensaje elegante si no hay obras

### 4. 404:
- ✅ Página de error si artesano no existe

---

## 🔄 Reiniciar Servidores

### Backend:
```bash
# En la terminal de Django:
Ctrl + C

# Volver a arrancar:
cd backend
source venv/bin/activate
python manage.py runserver
```

### Frontend:
```bash
# En la terminal de Next.js:
Ctrl + C

# Volver a arrancar:
cd frontend
npm run dev
```

---

## ✅ Checklist de Verificación

- [ ] Backend Django corriendo en :8000
- [ ] Frontend Next.js corriendo en :3000
- [ ] `.env.local` creado con `NEXT_PUBLIC_API_URL`
- [ ] Endpoint `/api/v1/artists/` funciona
- [ ] **Nuevo endpoint** `/api/v1/artists/{slug}/works/` funciona
- [ ] Página `/artesanos/[slug]` carga correctamente
- [ ] Grid de obras se muestra
- [ ] Hover effects funcionan
- [ ] Loading skeleton aparece al throttlear network
- [ ] Sin errores en consola del navegador
- [ ] Sin errores TypeScript

---

## 🎯 Siguiente Paso

Una vez que todo funcione:

**Fase 2: Galería Individual con Lightbox**
- Crear página `/artesanos/{slug}/obras/{workId}`
- Implementar lightbox con `yet-another-react-lightbox`
- Galería completa de imágenes

---

## 💡 Tips

### Ver logs en tiempo real:

**Backend:**
```bash
# Terminal 1: Django
cd backend
source venv/bin/activate
python manage.py runserver
# Verás logs de requests aquí
```

**Frontend:**
```bash
# Terminal 2: Next.js
cd frontend
npm run dev
# Verás compilación y hot reload aquí
```

**Navegador:**
```
F12 > Console
# Verás errores de JavaScript aquí
```

### Comandos útiles:

```bash
# Ver artistas en DB
cd backend
source venv/bin/activate
python manage.py shell
>>> from artists.models import ArtistProfile
>>> ArtistProfile.objects.all()
>>> exit()

# Ver obras en DB
python manage.py shell
>>> from works.models import Work
>>> Work.objects.all()
>>> exit()
```

---

## 📚 Documentación

- `frontend/CLOUDINARY_SETUP.md` - Configuración de imágenes
- `frontend/ENV_VARS_REFERENCE.md` - Variables de entorno
- `frontend/MIGRACION_PORTFOLIO_FASE1.md` - Resumen completo
- `backend/artists/README.md` - API de artistas
- `backend/works/README.md` - API de obras

---

¿Necesitas ayuda? Revisa el Troubleshooting arriba o pregunta. 🚀

