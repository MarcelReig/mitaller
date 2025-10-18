# 🚀 START HERE - Fase 1 Completada

## ✅ Todo está listo. Solo arranca los servidores:

### 1️⃣ Backend (Terminal 1)
```bash
cd /Users/marcelreig/Code/side-project/mitaller/backend
source venv/bin/activate
python manage.py runserver
```
✅ Django en: **http://localhost:8000**

---

### 2️⃣ Frontend (Terminal 2)
```bash
cd /Users/marcelreig/Code/side-project/mitaller/frontend
npm run dev
```
✅ Next.js en: **http://localhost:3000**

---

### 3️⃣ Visita en tu navegador
```
http://localhost:3000/artesanos/[slug-de-un-artesano]
```

**Ejemplo:**
```
http://localhost:3000/artesanos/juan-ceramista
```

---

## 🧪 Test Rápido

```bash
cd /Users/marcelreig/Code/side-project/mitaller
./test_fase1.sh
```

---

## 📚 ¿Necesitas más info?

| Lee esto | Para qué |
|----------|----------|
| `README_IMPLEMENTACION.md` | Overview completo |
| `QUICK_START_FASE1.md` | Guía paso a paso |
| `CLOUDINARY_SETUP.md` | Configurar imágenes (opcional) |

---

## ❌ ¿Problemas?

### No hay artesanos
```bash
cd backend
source venv/bin/activate
python create_test_data.py
```

### Error "No module named 'django'"
```bash
# Activa el venv primero:
source venv/bin/activate
```

### Página en blanco
1. Verifica que Django esté corriendo en :8000
2. Verifica que Next.js esté corriendo en :3000
3. Revisa la consola del navegador (F12)

---

## 🎯 Implementado

✅ Endpoint: `GET /api/v1/artists/{slug}/works/`
✅ Página: `/artesanos/[slug]` con **grid de galerías/colecciones**
✅ Componentes: WorkCard (portada), WorkGrid, ArtisanHeader
✅ Helper Cloudinary (listo para configurar)
✅ Server Components + TypeScript
✅ Loading states + SEO

**Importante**: Cada "Work" es una COLECCIÓN de fotos (como álbum en Marina).
Ver: `ACLARACION_CONCEPTUAL.md`

---

**🚀 ¡A probar!**

