'use client';

import { useQuery } from '@tanstack/react-query';
import type { Artisan, CraftType, Location } from '@/types';
import axiosInstance from '@/lib/axios';
import ArtistCard from './ArtistCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search } from 'lucide-react';

/**
 * Props del componente ArtistsGrid
 */
interface ArtistsGridProps {
  artistSlug?: string;      // Filtrar por slug específico
  craftType?: CraftType;     // Filtrar por tipo de artesanía
  location?: Location;       // Filtrar por ubicación
  search?: string;           // Búsqueda por nombre
  featured?: boolean;        // Solo artesanos destacados
  limit?: number;            // Límite de resultados
}

/**
 * Componente skeleton para card de artesano
 * Se muestra durante el estado de carga
 */
function ArtistCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="text-center space-y-2 w-full">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente para mostrar un grid de artesanos con fetching de datos
 * 
 * Incluye estados de loading, error y empty.
 * Usa React Query para el fetching y caché de datos.
 */
export default function ArtistsGrid({
  artistSlug,
  craftType,
  location,
  search,
  featured,
  limit,
}: ArtistsGridProps) {
  // Fetching de artesanos con React Query
  const { data: artists, isLoading, error, refetch } = useQuery({
    queryKey: ['artists', { artistSlug, craftType, location, search, featured, limit }],
    queryFn: async () => {
      // Construir params dinámicamente
      const params: Record<string, string | number | boolean> = {
        page_size: limit || 100,
      };

      if (artistSlug) params.slug = artistSlug;
      if (craftType) params.craft_type = craftType;
      if (location) params.location = location;
      if (search) params.search = search;
      if (featured !== undefined) params.is_featured = featured;

      const response = await axiosInstance.get<{ results: Artisan[] }>(
        '/api/v1/artisans/',
        { params }
      );
      
      return response.data.results;
    },
    staleTime: 5 * 60 * 1000, // Los datos son válidos por 5 minutos
    retry: 2, // Reintentar 2 veces en caso de error
  });

  // Estado: Loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Array.from({ length: 6 }).map((_, index) => (
          <ArtistCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Estado: Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Error al cargar artesanos
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Ha ocurrido un error al intentar cargar la lista de artesanos. 
          Por favor, inténtalo de nuevo.
        </p>
        <Button 
          onClick={() => refetch()} 
          variant="default"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  // Estado: Empty (sin resultados)
  if (!artists || artists.length === 0) {
    const hasFilters = craftType || location || search || featured !== undefined;
    
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Search className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No se encontraron artesanos
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {hasFilters 
            ? 'No hay artesanos que coincidan con los filtros seleccionados. Intenta con otros criterios de búsqueda.'
            : 'Aún no hay artesanos registrados en la plataforma.'
          }
        </p>
        {hasFilters && (
          <Button 
            onClick={() => window.location.href = '/artesanos'} 
            variant="outline"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  }

  // Estado: Success (con resultados)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {artists.map((artist) => (
        <ArtistCard key={artist.slug} artist={artist} />
      ))}
    </div>
  );
}

