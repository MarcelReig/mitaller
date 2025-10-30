'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Store, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductDetailModal } from '@/components/products/ProductDetailModal';
import { useProducts } from '@/hooks/useProducts';
import type { Product, CraftType } from '@/types';
import { CRAFT_TYPE_LABELS } from '@/types';

/**
 * Página de exploración de productos
 *
 * URL: /explorar
 *
 * Features:
 * - Mostrar todos los productos de la plataforma
 * - Filtro por categoría (tabs)
 * - Búsqueda de texto libre
 * - Grid responsivo de productos
 * - Modal de detalle del producto
 * - Breadcrumb de navegación
 *
 * Esta es la página principal de descubrimiento de productos
 * de todos los artesanos de la plataforma.
 */
export default function ExplorarPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener todos los productos con filtros
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useProducts(undefined, {
    ...(selectedCategory !== 'all' && { category: selectedCategory }),
    ...(searchTerm && { search: searchTerm }),
  });

  // Categorías disponibles (hardcoded basado en CraftType)
  const allCategories: CraftType[] = [
    'ceramics',
    'jewelry',
    'textiles',
    'wood',
    'leather',
    'glass',
    'other',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-foreground">Explorar productos</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Store className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Explorar Productos</h1>
        </div>
        <p className="text-muted-foreground">
          Descubre productos únicos hechos a mano por artesanos menorquines
        </p>
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filtro por categoría */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto overflow-x-auto flex-nowrap">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {allCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {CRAFT_TYPE_LABELS[category]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Contador de resultados */}
        {products && products.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}{' '}
            {selectedCategory !== 'all' && (
              <>en {CRAFT_TYPE_LABELS[selectedCategory as CraftType]}</>
            )}
            {searchTerm && (
              <>
                {' '}
                con &quot;{searchTerm}&quot;
              </>
            )}
          </div>
        )}
      </div>

      {/* Botones de acción rápida */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="mb-6 flex gap-2">
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
            >
              Limpiar búsqueda
            </Button>
          )}
          {selectedCategory !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todas las categorías
            </Button>
          )}
        </div>
      )}

      {/* Grid de productos */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onProductClick={setSelectedProduct}
      />

      {/* Sección de llamada a la acción si no hay productos */}
      {!isLoading && products && products.length === 0 && !searchTerm && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            ¿Eres artesano? Únete a nuestra comunidad
          </p>
          <Button asChild>
            <Link href="/registro">Registrarme como artesano</Link>
          </Button>
        </div>
      )}

      {/* Modal de detalle del producto */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
