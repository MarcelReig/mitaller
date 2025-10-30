'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ArtisanFilters, CraftType, Location } from '@/types';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

/**
 * Props del componente ArtisanFilters
 */
interface ArtisanFiltersProps {
  onFilterChange: (filters: ArtisanFilters) => void;
  initialFilters?: ArtisanFilters;
}

/**
 * Componente para filtrar la búsqueda de artesanos
 *
 * Incluye búsqueda por nombre, especialidad y ubicación.
 * El input de búsqueda tiene debounce de 500ms.
 */
export default function ArtisanFilters({
  onFilterChange,
  initialFilters = {},
}: ArtisanFiltersProps) {
  // Estado local de los filtros
  const [filters, setFilters] = useState<ArtisanFilters>(initialFilters);

  // Estado separado para el input de búsqueda (para el debounce)
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');

  // Comprobar si hay filtros activos
  const hasActiveFilters =
    filters.search ||
    filters.craft_type ||
    filters.location;

  // Debounce para el input de búsqueda
  useEffect(() => {
    // Si el searchInput está vacío, actualizar inmediatamente
    if (searchInput === '') {
      setFilters(prev => ({ ...prev, search: undefined }));
      return;
    }

    // Crear timeout para el debounce
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500); // Debounce de 500ms

    // Cleanup: cancelar el timeout si el usuario sigue escribiendo
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Notificar al padre cuando cambien los filtros
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handler para cambio de especialidad
  const handleCraftTypeChange = useCallback((value: string) => {
    const craftType = value === 'all' ? undefined : (value as CraftType);
    setFilters(prev => ({ ...prev, craft_type: craftType }));
  }, []);

  // Handler para cambio de ubicación
  const handleLocationChange = useCallback((value: string) => {
    const location = value === 'all' ? undefined : (value as Location);
    setFilters(prev => ({ ...prev, location }));
  }, []);

  // Handler para limpiar todos los filtros
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setFilters({});
  }, []);

  return (
    <div className="w-full space-y-4 p-6 bg-card rounded-lg border border-border/50 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Input de búsqueda por nombre */}
        <div className="flex-1 w-full space-y-2">
          <Label htmlFor="search-input" className="text-sm font-medium">
            Buscar artesano
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search-input"
              type="text"
              placeholder="Buscar por nombre..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Select de especialidad */}
        <div className="w-full md:w-56 space-y-2">
          <Label htmlFor="craft-type-select" className="text-sm font-medium">
            Especialidad
          </Label>
          <Select
            value={filters.craft_type || 'all'}
            onValueChange={handleCraftTypeChange}
          >
            <SelectTrigger id="craft-type-select">
              <SelectValue placeholder="Todas las especialidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las especialidades</SelectItem>
              {Object.entries(CRAFT_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select de ubicación */}
        <div className="w-full md:w-56 space-y-2">
          <Label htmlFor="location-select" className="text-sm font-medium">
            Ubicación
          </Label>
          <Select
            value={filters.location || 'all'}
            onValueChange={handleLocationChange}
          >
            <SelectTrigger id="location-select">
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {Object.entries(LOCATION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={handleClearFilters}
            className="gap-2 w-full md:w-auto"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <span key="label" className="text-sm text-muted-foreground">Filtros activos:</span>
          {filters.search && (
            <span key="search" className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
              Búsqueda: {filters.search}
            </span>
          )}
          {filters.craft_type && (
            <span key="craft-type" className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
              {CRAFT_TYPE_LABELS[filters.craft_type]}
            </span>
          )}
          {filters.location && (
            <span key="location" className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
              {LOCATION_LABELS[filters.location]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}