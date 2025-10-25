# Componentes de Perfil de Artista

Componentes para mostrar el perfil público de artistas en MiTaller.

## 🎯 Ubicación

`/artesanos/[slug]` - Página pública del perfil del artista

## 📦 Componentes Principales

### 1. ArtisanHeader

Componente de encabezado que muestra toda la información del perfil:
- Cover image (imagen de portada)
- Avatar circular
- Nombre y display name
- Badges (Featured, tipo de artesanía)
- Bio del artista
- Ubicación
- Redes sociales y contacto

**Ubicación:** `@/components/artists/ArtisanHeader`

**Props:**
```typescript
interface ArtisanHeaderProps {
  artisan: Artist;
  className?: string;
}
```

**Uso:**
```tsx
<ArtisanHeader artisan={artist} />
```

### 2. WorkGrid

Grid responsive de colecciones/galerías del artista con:
- Grid 2-4 columnas (responsive)
- Hover effects con overlay
- Links a galería completa
- Badge para obras destacadas
- Empty state si no hay obras

**Ubicación:** `@/components/works/WorkGrid`

**Props:**
```typescript
interface WorkGridProps {
  works: WorkListItem[];
  artisanSlug: string;
  className?: string;
}
```

**Uso:**
```tsx
<WorkGrid works={works} artisanSlug={artist.slug} />
```

## 🚀 Página completa

La página `/artesanos/[slug]/page.tsx` es un Server Component que:

```tsx
import { ArtisanHeader } from '@/components/artists';
import { WorkGrid } from '@/components/works';

export default async function ArtisanProfilePage({ params }: PageParams) {
  const { slug } = params;

  // Fetch paralelo de artista y obras
  const [artisan, works] = await Promise.all([
    getArtisan(slug),
    getArtisanWorks(slug),
  ]);

  if (!artisan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-muted/30">
        <nav>...</nav>
      </div>

      {/* Container principal */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <ArtisanHeader artisan={artisan} />
        <WorkGrid works={works} artisanSlug={artisan.slug} />
      </div>
    </main>
  );
}
```

## 🔧 API

Los datos se obtienen directamente en el Server Component mediante fetch:

- `GET /api/v1/artists/{slug}/` - Obtener perfil de artista
- `GET /api/v1/artists/{slug}/works/` - Obtener colecciones del artista

## 🎨 Features

✅ **SEO optimizado** - Metadata dinámica con Open Graph  
✅ **Server Components** - Fetch en servidor para mejor performance  
✅ **Responsive** - Adaptado a mobile, tablet y desktop  
✅ **Error handling** - 404 automático si artista no existe  
✅ **Breadcrumbs** - Navegación contextual (Inicio > Artesanos > Nombre)  
✅ **ISR** - Revalidación según entorno (60s dev, 1h prod)  
✅ **Empty states** - Mensajes amigables si no hay contenido  

## 🧪 Testing

```bash
# Iniciar servidor
npm run dev

# Navegar a
http://localhost:3000/artesanos/[slug-de-artista]

# Verificar:
# - Header se muestra correctamente
# - Breadcrumbs funcionan
# - Redes sociales aparecen (si están configuradas)
# - Obras se cargan en grid
# - 404 si artista no existe
```

## 📝 Tipos

```typescript
// Artist
type Artist = {
  slug: string;
  display_name: string;
  craft_type: string;
  location: string;
  full_location: string;
  avatar: string | null;
  cover_image: string | null;
  bio: string | null;
  website: string | null;
  instagram: string | null;
  instagram_url: string | null;
  is_featured: boolean;
  total_works: number;
  total_products: number;
  user: {
    email: string;
  };
};

// Work
type Work = {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  category: WorkCategory | null;
  is_featured: boolean;
};
```

## 🔮 Mejoras futuras

- Breadcrumbs (Home > Artesanos > Nombre)
- Filtro de obras por categoría
- Share buttons (compartir perfil)
- Tabs: Portfolio / Productos
- Galería con prev/next en lightbox
- Zoom en lightbox

