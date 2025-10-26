# Ejemplos de Uso - Componentes de Artistas

## 📘 Ejemplo 1: Página de directorio completo

```tsx
// src/app/artesanos/page.tsx
'use client';

import { useState } from 'react';
import type { ArtistFilters } from '@/types';
import { ArtistFilters as Filters, ArtistsGrid } from '@/components/artists';

export default function ArtesanosPage() {
  const [filters, setFilters] = useState<ArtistFilters>({});

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Directorio de Artesanos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descubre los talentosos artesanos de Menorca
        </p>
      </div>

      {/* Filtros */}
      <Filters
        initialFilters={filters}
        onFilterChange={setFilters}
      />

      {/* Grid */}
      <ArtistsGrid
        search={filters.search}
        craftType={filters.craft_type}
        location={filters.location}
      />
    </div>
  );
}
```

---

## 📘 Ejemplo 2: Artesanos destacados (home)

```tsx
// src/components/home/FeaturedArtists.tsx
'use client';

import { ArtistsGrid } from '@/components/artists';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FeaturedArtists() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Artesanos Destacados</h2>
          <p className="text-muted-foreground">
            Los mejores artesanos de Menorca
          </p>
        </div>
        
        <Link 
          href="/artesanos"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid de solo destacados, límite de 6 */}
      <ArtistsGrid 
        featured={true} 
        limit={6} 
      />
    </section>
  );
}
```

---

## 📘 Ejemplo 3: Filtrar por especialidad

```tsx
// src/app/artesanos/ceramica/page.tsx
'use client';

import { ArtistsGrid } from '@/components/artists';

export default function CeramicaPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Artesanos de Cerámica</h1>
        <p className="text-lg text-muted-foreground">
          Descubre los maestros de la cerámica en Menorca
        </p>
      </div>

      {/* Grid filtrado por tipo de artesanía */}
      <ArtistsGrid craftType="ceramics" />
    </div>
  );
}
```

---

## 📘 Ejemplo 4: Filtrar por ubicación

```tsx
// src/app/artesanos/ciutadella/page.tsx
'use client';

import { ArtistsGrid } from '@/components/artists';

export default function CiutadellaArtistsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Artesanos de Ciutadella</h1>
        <p className="text-lg text-muted-foreground">
          Artesanos locales en Ciutadella de Menorca
        </p>
      </div>

      {/* Grid filtrado por ubicación */}
      <ArtistsGrid location="ciutadella" />
    </div>
  );
}
```

---

## 📘 Ejemplo 5: Lista de artesanos relacionados

```tsx
// src/components/artists/RelatedArtists.tsx
'use client';

import { ArtistsGrid } from '@/components/artists';
import type { CraftType } from '@/types';

interface RelatedArtistsProps {
  craftType: CraftType;
  excludeSlug: string; // Excluir el artista actual
  limit?: number;
}

export default function RelatedArtists({ 
  craftType, 
  excludeSlug,
  limit = 3 
}: RelatedArtistsProps) {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">
        Artesanos Relacionados
      </h2>
      
      {/* 
        Nota: ArtistsGrid actualmente no soporta excludeSlug,
        tendrías que filtrarlo después en el componente padre
        o añadir esta funcionalidad
      */}
      <ArtistsGrid 
        craftType={craftType} 
        limit={limit}
      />
    </section>
  );
}
```

---

## 📘 Ejemplo 6: Card de artista individual

```tsx
// src/components/shop/ProductArtist.tsx
'use client';

import { ArtistCard } from '@/components/artists';
import type { Artist } from '@/types';

interface ProductArtistProps {
  artist: Artist;
}

/**
 * Mostrar información del artista en una página de producto
 */
export default function ProductArtist({ artist }: ProductArtistProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Sobre el Artesano
      </h3>
      
      <ArtistCard artist={artist} />
      
      <p className="text-sm text-muted-foreground">
        {artist.bio}
      </p>
    </div>
  );
}
```

---

## 📘 Ejemplo 7: Filtros con URL params (avanzado)

```tsx
// src/app/artesanos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ArtistFilters } from '@/types';
import { ArtistFilters as Filters, ArtistsGrid } from '@/components/artists';

export default function ArtesanosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Leer filtros desde URL params
  const [filters, setFilters] = useState<ArtistFilters>(() => ({
    search: searchParams.get('search') || undefined,
    craft_type: searchParams.get('craft_type') as any || undefined,
    location: searchParams.get('location') as any || undefined,
  }));

  // Actualizar URL cuando cambien los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.craft_type) params.set('craft_type', filters.craft_type);
    if (filters.location) params.set('location', filters.location);
    
    const newUrl = params.toString() 
      ? `/artesanos?${params.toString()}`
      : '/artesanos';
    
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center">
        Directorio de Artesanos
      </h1>

      <Filters
        initialFilters={filters}
        onFilterChange={setFilters}
      />

      <ArtistsGrid {...filters} />
    </div>
  );
}
```

---

## 📘 Ejemplo 8: Tabs por especialidad

```tsx
// src/app/artesanos/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArtistsGrid } from '@/components/artists';
import { CRAFT_TYPE_LABELS, type CraftType } from '@/types';

export default function ArtesanosPage() {
  const [activeTab, setActiveTab] = useState<CraftType | 'all'>('all');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-center">
        Directorio de Artesanos
      </h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {Object.entries(CRAFT_TYPE_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-8">
          <ArtistsGrid />
        </TabsContent>

        {Object.keys(CRAFT_TYPE_LABELS).map((craftType) => (
          <TabsContent key={craftType} value={craftType} className="mt-8">
            <ArtistsGrid craftType={craftType as CraftType} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

---

## 🎯 Consejos de Uso

### 1. **Performance**
- React Query cachea los resultados por 5 minutos
- El debounce en búsqueda evita requests innecesarios
- Usa `limit` para cargar solo lo necesario

### 2. **UX**
- Los filtros persisten mientras el usuario navega
- Los estados de loading/error son informativos
- Los mensajes están en español

### 3. **SEO (futuro)**
- Considera hacer las páginas de directorio Server Components
- Usa generateStaticParams para páginas estáticas
- Añade metadata apropiada

### 4. **Accesibilidad**
- Todos los inputs tienen labels
- Los estados de error son claros
- Keyboard navigation funciona correctamente

### 5. **Testing**
```tsx
// Ejemplo de test con React Testing Library
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArtistsGrid } from '@/components/artists';

const queryClient = new QueryClient();

test('muestra mensaje cuando no hay artesanos', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <ArtistsGrid />
    </QueryClientProvider>
  );
  
  // Esperar a que aparezca el mensaje de "no hay artesanos"
  expect(await screen.findByText(/no se encontraron artesanos/i))
    .toBeInTheDocument();
});
```

---

## 🔗 Links Útiles

- [Documentación completa](./README.md)
- [Tipos TypeScript](/src/types/artist.ts)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [React Query Docs](https://tanstack.com/query/latest)

