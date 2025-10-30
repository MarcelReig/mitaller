# Componentes de Artesanos

Componentes React para el directorio de artesanos de MiTaller.art.

## Componentes

### 🎨 ArtisanCard

Tarjeta individual de artesano con avatar, información básica y link al perfil.

**Props:**
```typescript
interface ArtisanCardProps {
  artisan: Artisan;
}
```

**Características:**
- Avatar circular con fallback de iniciales
- Nombre, especialidad y ubicación
- Badge de "Destacado" para artesanos destacados
- Estadísticas de obras y productos
- Hover effects (scale + shadow)
- Link al perfil del artesano

**Ejemplo:**
```tsx
import { ArtisanCard } from '@/components/artisans';

<ArtisanCard artisan={artisan} />
```

---

### 📋 ArtisansGrid

Grid responsivo de artesanos con fetching de datos usando React Query.

**Props:**
```typescript
interface ArtisansGridProps {
  artisanSlug?: string;      // Filtrar por slug
  craftType?: CraftType;     // Filtrar por especialidad
  location?: Location;       // Filtrar por ubicación
  search?: string;           // Búsqueda por nombre
  featured?: boolean;        // Solo destacados
  limit?: number;            // Límite de resultados
}
```

**Estados:**
- ⏳ **Loading**: Grid de 6 skeleton cards
- ❌ **Error**: Mensaje con botón de reintento
- 🔍 **Empty**: Mensaje cuando no hay resultados (con sugerencia de limpiar filtros)
- ✅ **Success**: Grid de ArtisanCard components

**Características:**
- Fetching con React Query (cache de 5 minutos)
- Grid responsivo: 1 columna (mobile) → 2 (tablet) → 3 (desktop)
- Retry automático (2 intentos)
- Manejo completo de errores

**Ejemplo:**
```tsx
import { ArtisansGrid } from '@/components/artisans';

<ArtisansGrid
  craftType="ceramics"
  location="ciutadella"
  search="Juan"
  featured={true}
  limit={12}
/>
```

---

### 🔍 ArtisanFilters

Panel de filtros para búsqueda de artesanos con debounce.

**Props:**
```typescript
interface ArtisanFiltersProps {
  onFilterChange: (filters: ArtisanFilters) => void;
  initialFilters?: ArtisanFilters;
}

type ArtisanFilters = {
  search?: string;
  craft_type?: CraftType;
  location?: Location;
};
```

**Características:**
- Input de búsqueda con debounce de 500ms
- Select de especialidad (CRAFT_TYPE_LABELS)
- Select de ubicación (LOCATION_LABELS)
- Botón "Limpiar filtros" (solo visible si hay filtros activos)
- Indicador visual de filtros activos
- Labels accesibles en todos los inputs

**Ejemplo:**
```tsx
import { useState } from 'react';
import { ArtisanFilters } from '@/components/artisans';

const [filters, setFilters] = useState<ArtisanFilters>({});

<ArtisanFilters
  initialFilters={filters}
  onFilterChange={setFilters}
/>
```

---

### 👤 ArtisanHeader

Hero minimalista del perfil público del artesano con cover image.

**Props:**
```typescript
interface ArtisanHeaderProps {
  artisan: Artisan;
  className?: string;
}
```

**Características:**
- Cover image de fondo con overlay oscuro
- Avatar grande centrado sobrelapando
- Información limpia y bien espaciada
- Badges de especialidad, ubicación y destacado
- Biografía del artesano
- Diseño responsive y moderno

**Ejemplo:**
```tsx
import { ArtisanHeader } from '@/components/artisans';

<ArtisanHeader artisan={artisan} />
```

---

### 🔗 ArtisanSocials

Links de contacto y redes sociales del artesano con estadísticas.

**Props:**
```typescript
interface ArtisanSocialsProps {
  artisan: Artisan;
}
```

**Características:**
- Estadísticas: total de obras y productos
- Links: Sitio web, Instagram, Teléfono
- Se oculta si no hay contenido
- Diseño responsive

**Ejemplo:**
```tsx
import { ArtisanSocials } from '@/components/artisans';

<ArtisanSocials artisan={artisan} />
```

---

## 📦 Uso completo (página de directorio)

```tsx
'use client';

import { useState } from 'react';
import type { ArtisanFilters } from '@/types';
import { ArtisanFilters as Filters, ArtisansGrid } from '@/components/artisans';

export default function ArtesanosPage() {
  const [filters, setFilters] = useState<ArtisanFilters>({});

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold">Directorio de Artesanos</h1>

      {/* Filtros */}
      <Filters
        initialFilters={filters}
        onFilterChange={setFilters}
      />

      {/* Grid */}
      <ArtisansGrid
        search={filters.search}
        craftType={filters.craft_type}
        location={filters.location}
      />
    </div>
  );
}
```

---

## 🎯 Tipos utilizados

Todos los tipos están definidos en `@/types`:

```typescript
import type {
  Artisan,
  ArtisanFilters,
  CraftType,
  Location
} from '@/types';

import {
  CRAFT_TYPE_LABELS,
  LOCATION_LABELS
} from '@/types';
```

---

## 🧩 Dependencias

- **shadcn/ui**: Card, Avatar, Badge, Button, Input, Select, Skeleton, Label
- **React Query**: useQuery para fetching
- **Next.js**: Link para navegación
- **lucide-react**: Iconos (Search, MapPin, Sparkles, AlertCircle, X, Palette, etc.)
- **axios**: Via `@/lib/axios` para llamadas API
- **Cloudinary**: Transformaciones de imágenes vía `@/lib/cloudinary`

---

## 🎨 Estilos

Todos los componentes usan:
- **Tailwind CSS** para estilos
- **Variables CSS del tema** (text-muted-foreground, border, etc.)
- **Responsive design** mobile-first
- **Hover effects** suaves y consistentes

---

## ♿ Accesibilidad

- Labels en todos los inputs
- Alt text en imágenes
- Estructura semántica HTML
- Mensajes de error descriptivos
- Keyboard navigation compatible

---

## 🚀 Rendimiento

- **React Query cache**: 5 minutos de staleTime
- **Debounce**: 500ms en búsqueda para evitar requests innecesarios
- **Lazy loading**: Compatible con scroll infinito (futuro)
- **Skeleton loading**: UX mejorada durante carga
- **Cloudinary**: Optimización automática de imágenes (formato, calidad, DPR)

---

## 📝 Notas

1. Todos los componentes de fetching son **'use client'** (usan hooks y eventos)
2. TypeScript estricto (no 'any')
3. Comentarios en español
4. Código production-ready
5. Preparado para testing

---

## 🔮 Mejoras futuras

- [ ] Scroll infinito en ArtisansGrid
- [ ] Ordenación (por nombre, fecha, etc.)
- [ ] Vista de lista alternativa (además del grid)
- [ ] Compartir filtros via URL params
- [ ] Favoritos de artesanos
- [ ] Mapa de ubicaciones