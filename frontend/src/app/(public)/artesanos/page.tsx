'use client';

import { useState } from 'react';
import type { ArtisanFilters } from '@/types';
import ArtisansGrid from '@/components/artisans/ArtisansGrid';
import ArtisanFilters from '@/components/artisans/ArtisanFilters';

/**
 * Página del directorio de artesanos con filtros funcionales
 * 
 * Permite buscar y filtrar artesanos por nombre, especialidad y ubicación.
 * Los filtros se aplican en tiempo real con React Query.
 */
export default function ArtesanosPage() {
  // State para filtros
  const [filters, setFilters] = useState<ArtisanFilters>({
    search: '',
    craft_type: undefined,
    location: undefined,
  });

  // Handler para cuando cambian los filtros
  const handleFilterChange = (newFilters: ArtisanFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Directorio de Artesanos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Descubre el talento local de Menorca. Explora perfiles de artesanos, 
              conoce su trabajo y encuentra piezas únicas.
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <ArtisanFilters
              initialFilters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Grid de artesanos */}
          <div>
            <ArtisansGrid
              search={filters.search}
              craftType={filters.craft_type}
              location={filters.location}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
