/**
 * FeaturedProducts Component
 *
 * Sección de productos destacados del artesano para mostrar en su perfil.
 *
 * Features:
 * - Muestra hasta 4 productos destacados (is_featured=true)
 * - Fallback a primeros 4 productos si no hay destacados
 * - Estado vacío amigable si no hay productos
 * - Link a tienda completa
 * - Copy estilo Menorca (informal, familiar)
 *
 * @example
 * ```tsx
 * <Suspense fallback={<ProductsSkeleton />}>
 *   <FeaturedProducts slug="juan-ceramista" />
 * </Suspense>
 * ```
 */

'use client';

import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductCard } from './ProductCard';
import { useArtisanProducts } from '@/hooks/useProducts';

interface FeaturedProductsProps {
  slug: string;
  artisanName: string;
}

export function FeaturedProducts({ slug, artisanName }: FeaturedProductsProps) {
  // Intentar obtener productos destacados primero
  const {
    data: featuredProducts,
    isLoading: featuredLoading,
    error: featuredError,
  } = useArtisanProducts(slug, { is_featured: true });

  // Si no hay destacados, obtener todos (limitamos a 4 en el render)
  const {
    data: allProducts,
    isLoading: allLoading,
    error: allError,
  } = useArtisanProducts(slug, {});

  const isLoading = featuredLoading || allLoading;
  const error = featuredError || allError;

  // Decidir qué productos mostrar
  const productsToShow =
    featuredProducts && featuredProducts.length > 0
      ? featuredProducts.slice(0, 4)
      : allProducts
      ? allProducts.slice(0, 4)
      : [];

  const totalProducts = allProducts?.length || 0;
  const showingFeatured = featuredProducts && featuredProducts.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No pudimos cargar los productos"
        description="Algo salió mal al cargar la tienda. Inténtalo de nuevo más tarde."
      />
    );
  }

  // Empty state
  if (productsToShow.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 p-8">
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Este artesano no tiene productos todavía"
          description={`${artisanName} está preparando su tienda. Mientras tanto, echa un vistazo a su portfolio más abajo.`}
          action={
            <Button asChild variant="outline">
              <Link href="#portfolio">
                Ver portfolio
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {showingFeatured ? 'Productos destacados' : 'Productos disponibles'}
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            {showingFeatured
              ? `Lo mejor de ${artisanName}, hecho a mano con dedicación`
              : `Echa un vistazo a lo que ${artisanName} tiene disponible`}
          </p>
        </div>

        {/* Link a tienda completa si hay más de 4 productos */}
        {totalProducts > 4 && (
          <Button asChild variant="ghost" className="gap-2 group">
            <Link href={`/artesanos/${slug}/tienda`}>
              Ver toda la tienda ({totalProducts})
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        )}
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {productsToShow.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* CTA final a tienda completa */}
      <div className="flex justify-center pt-4">
        <Button asChild size="lg" className="gap-2">
          <Link href={`/artesanos/${slug}/tienda`}>
            Explorar toda la tienda
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
