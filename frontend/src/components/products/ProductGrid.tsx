'use client';

import { AlertCircle, PackageOpen } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Product } from '@/types';

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onProductClick?: (product: Product) => void;
}

/**
 * Grid responsivo de productos con estados de carga
 *
 * Features:
 * - Grid responsivo: 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop)
 * - Skeleton loading state (6 skeletons)
 * - Empty state si no hay productos
 * - Error state con retry
 * - Gap consistente entre cards
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useProducts();
 *
 * <ProductGrid
 *   products={data}
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 *   onProductClick={(p) => setSelectedProduct(p)}
 * />
 * ```
 */
export function ProductGrid({
  products,
  isLoading,
  error,
  onRetry,
  onProductClick,
}: ProductGridProps) {
  // Estado de carga
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar productos</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-2">
          <p>{error.message || 'Ha ocurrido un error inesperado'}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="w-fit">
              Reintentar
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Estado vacío
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <PackageOpen className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay productos disponibles</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Aún no se han añadido productos a esta tienda.
        </p>
      </div>
    );
  }

  // Grid de productos
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton de tarjeta de producto para estado de carga
 */
function ProductCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
