'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Store, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductDetailModal } from '@/components/products/ProductDetailModal';
import { useArtisan } from '@/hooks/useArtisans';
import { useArtisanProducts } from '@/hooks/useProducts';
import type { Product, CraftType } from '@/types';
import { CRAFT_TYPE_LABELS } from '@/types';

/**
 * Página de tienda del artesano
 *
 * URL: /artesanos/{slug}/tienda
 *
 * Features:
 * - Server Component (fetch inicial en servidor) -> Convertido a Client por necesidad de estado
 * - Header del artesano (nombre, avatar, bio corta)
 * - ProductGrid con productos del artesano
 * - Filtro por categoría (tabs)
 * - Toggle "Solo destacados"
 * - Breadcrumb: Inicio > Artesanos > {nombre} > Tienda
 * - SEO metadata dinámico
 * - Link "Ver perfil completo"
 */
export default function ArtisanShopPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Obtener datos del artesano
  const { data: artisan, isLoading: artisanLoading } = useArtisan(slug);

  // Obtener productos con filtros
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
    refetch,
  } = useArtisanProducts(slug, {
    ...(selectedCategory !== 'all' && { category: selectedCategory }),
    ...(showFeaturedOnly && { is_featured: true }),
  });

  const isLoading = artisanLoading || productsLoading;

  // Obtener categorías únicas de los productos
  const categories = products
    ? Array.from(new Set(products.map((p) => p.category)))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/artesanos" className="hover:text-primary">
          Artesanos
        </Link>
        <span>/</span>
        {artisan && (
          <>
            <Link href={`/artesanos/${slug}`} className="hover:text-primary">
              {artisan.display_name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">Tienda</span>
      </div>

      {/* Botón volver */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/artesanos/${slug}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al perfil
        </Link>
      </Button>

      {/* Header del artesano */}
      {artisan && (
        <div className="mb-8 rounded-lg border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h1 className="text-3xl font-bold">
                  Tienda de {artisan.display_name}
                </h1>
              </div>
              {artisan.bio && (
                <p className="text-muted-foreground line-clamp-2">
                  {artisan.bio}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {CRAFT_TYPE_LABELS[artisan.craft_type]}
                </span>
                <span className="text-muted-foreground">
                  {artisan.total_products} productos
                </span>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href={`/artesanos/${slug}`}>Ver perfil completo</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filtro por categoría */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {CRAFT_TYPE_LABELS[category as CraftType]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Toggle destacados */}
        <Button
          variant={showFeaturedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
          className="w-full sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          {showFeaturedOnly ? 'Mostrando destacados' : 'Solo destacados'}
        </Button>
      </div>

      {/* Grid de productos */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        error={productsError}
        onRetry={refetch}
        onProductClick={setSelectedProduct}
      />

      {/* Modal de detalle del producto */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
