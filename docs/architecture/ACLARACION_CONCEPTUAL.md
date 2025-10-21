# 📸 Aclaración Conceptual: Work = Colección/Galería

## ⚠️ Importante: Nomenclatura

### En el Código Backend (Django)
Por razones técnicas, el modelo se llama `Work`, pero representa una **COLECCIÓN/GALERÍA/ÁLBUM** de fotos, NO una obra individual.

### Concepto Real
```
Work = Colección de Imágenes
```

**Ejemplo:**
```python
Work {
    id: 1,
    title: "Vasijas Tradicionales 2024",    # ← Nombre del ÁLBUM
    description: "Colección de vasijas...",  # ← Descripción del ÁLBUM
    thumbnail_url: "url/portada.jpg",        # ← PORTADA del álbum (para el grid)
    images: [                                # ← TODAS las fotos del álbum
        "url/vasija1.jpg",
        "url/vasija2.jpg",
        "url/vasija3.jpg",
        "url/vasija4.jpg",
        ...
    ]
}
```

---

## 🔄 Equivalencia Marina ↔ Mitaller

| Concepto | Marina | Mitaller | Descripción |
|----------|--------|----------|-------------|
| **Álbum/Colección** | `Portfolio Item` | `Work` | Una colección de fotos |
| **Portada** | `thumb_img_url` | `thumbnail_url` | Imagen que se muestra en el grid |
| **Fotos** | Array de imágenes | `images[]` | Todas las fotos del álbum |
| **Grid** | `PortfolioContainer` | `WorkGrid` | Grid de portadas |
| **Card** | `PortfolioItem` | `WorkCard` | Card de cada álbum |
| **Galería** | Vista individual | Fase 2 (pendiente) | Todas las fotos + lightbox |

---

## 🎯 Flujo de Usuario

### 1. Página de Artesano (FASE 1 - Actual)
```
/artesanos/juan-ceramista

Muestra:
┌─────────────────────────────────────────┐
│ [Avatar] Juan Pérez - Ceramista        │
│ Taller en Ciutadella, Menorca          │
│ Bio: Ceramista tradicional...          │
└─────────────────────────────────────────┘

Portfolio (3 colecciones)

┌────────────┐  ┌────────────┐  ┌────────────┐
│ [Portada]  │  │ [Portada]  │  │ [Portada]  │
│ Vasijas    │  │ Platos     │  │ Jarrones   │
│ 2024       │  │ decorativos│  │ Grandes    │
└────────────┘  └────────────┘  └────────────┘
     ↓               ↓                ↓
   Click          Click            Click
```

### 2. Galería Individual (FASE 2 - Siguiente)
```
/artesanos/juan-ceramista/obras/1

Muestra TODAS las fotos de la colección "Vasijas 2024":

[← Volver al portfolio]

Vasijas Tradicionales 2024
Colección de 12 imágenes

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Foto 1 │ │ Foto 2 │ │ Foto 3 │ │ Foto 4 │
└────────┘ └────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Foto 5 │ │ Foto 6 │ │ Foto 7 │ │ Foto 8 │
└────────┘ └────────┘ └────────┘ └────────┘
...

Click en cualquiera → Lightbox con navegación
```

---

## 🗂️ Estructura de Datos

### Endpoint: GET /api/v1/artists/{slug}/works/
```json
[
  {
    "id": 1,
    "title": "Vasijas Tradicionales 2024",
    "thumbnail_url": "https://cloudinary.com/.../portada-vasijas.jpg",
    "category": "ceramics",
    "is_featured": true,
    "display_order": 1
  },
  {
    "id": 2,
    "title": "Platos Decorativos",
    "thumbnail_url": "https://cloudinary.com/.../portada-platos.jpg",
    "category": "ceramics",
    "is_featured": false,
    "display_order": 2
  }
]
```

**Nota**: En este endpoint solo se envía `thumbnail_url` (portada) porque es para el GRID. No necesita el array completo de imágenes.

### Endpoint: GET /api/v1/works/1/ (Detalle - Fase 2)
```json
{
  "id": 1,
  "title": "Vasijas Tradicionales 2024",
  "description": "Colección de vasijas hechas a mano...",
  "thumbnail_url": "https://cloudinary.com/.../portada-vasijas.jpg",
  "images": [
    "https://cloudinary.com/.../vasija1.jpg",
    "https://cloudinary.com/.../vasija2.jpg",
    "https://cloudinary.com/.../vasija3.jpg",
    "https://cloudinary.com/.../vasija4.jpg",
    "https://cloudinary.com/.../vasija5.jpg"
  ],
  "total_images": 6,
  "artist": {
    "id": 1,
    "slug": "juan-ceramista",
    "display_name": "Juan Pérez"
  },
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Nota**: En el detalle SÍ se envía todo el array `images[]` para mostrar en la galería/lightbox.

---

## 🎨 Uso en Frontend

### WorkCard (Muestra solo portada)
```tsx
<WorkCard work={work} artisanSlug={artisan.slug} />

// Internamente usa:
<Image src={thumbUrl(work.thumbnail_url)} />
```

### GalleryPage (Fase 2 - Muestra todas las imágenes)
```tsx
// Fetch completo del Work
const work = await getWork(workId);

// Lightbox con todas las imágenes
<Lightbox
  slides={work.images.map(url => ({ src: galleryUrl(url) }))}
/>
```

---

## ✅ Confirmación: Está Correcto

**Lo que implementamos en Fase 1:**
- ✅ Endpoint retorna lista de "colecciones" con sus portadas
- ✅ WorkGrid muestra grid de portadas
- ✅ WorkCard muestra una portada por colección
- ✅ Click lleva a `/artesanos/{slug}/obras/{workId}` (Fase 2)

**Es EXACTAMENTE como Marina:**
- Marina: Grid de álbums con portadas
- Mitaller: Grid de colecciones con portadas

---

## 🚀 Próxima Fase

**Fase 2: Galería Individual**
1. Crear página `/artesanos/[slug]/obras/[workId]/page.tsx`
2. Fetch del Work completo (con array `images[]`)
3. Implementar lightbox con `yet-another-react-lightbox`
4. Mostrar TODAS las fotos de la colección
5. Navegación entre fotos
6. Botón volver al portfolio

---

## 💡 Por Qué se Llama "Work"

En Django, el modelo se llama `Work` porque:
1. Es el término estándar en inglés para "obra artística"
2. Puede representar tanto una obra única como una colección
3. Mantiene consistencia con la terminología del dominio de arte

Pero en la **interfaz de usuario** (español), se puede mostrar como:
- "Colecciones"
- "Galerías"
- "Álbumes"
- "Portfolio"

Depende del contexto y preferencia del diseño.

---

## 📝 Resumen Visual

```
Artesano
  └── Works (Colecciones)
        ├── Work 1: "Vasijas 2024"
        │     ├── thumbnail_url (portada)
        │     └── images[] (12 fotos)
        │
        ├── Work 2: "Platos Decorativos"
        │     ├── thumbnail_url (portada)
        │     └── images[] (8 fotos)
        │
        └── Work 3: "Jarrones Grandes"
              ├── thumbnail_url (portada)
              └── images[] (15 fotos)
```

**Grid muestra**: 3 portadas (thumbnails)
**Click en portada**: Abre galería con todas las fotos

---

✅ **Confirmado: La implementación está correcta según el concepto de Marina.**

