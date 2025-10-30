'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  className?: string;
}

/**
 * Componente de tarjeta de producto reutilizable
 *
 * Features:
 * - Imagen con fallback a placeholder
 * - Nombre y precio formateado
 * - Badge "Agotado" si stock = 0
 * - Badge "Destacado" si is_featured = true
 * - Botón "Añadir al carrito" con validación de stock
 * - Click en card abre modal de detalle
 * - Optimistic UI al añadir al carrito
 * - Lazy loading de imágenes con Next/Image
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   onClick={(p) => setSelectedProduct(p)}
 * />
 * ```
 */
export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se abra el modal

    if (!product.is_available || product.stock === 0) {
      return;
    }

    setIsAdding(true);

    // Simular pequeño delay para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 300));

    addItem(product, 1);
    setIsAdding(false);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <Card
      className={cn(
        'h-full hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-border/50 overflow-hidden p-0 gap-0',
        isOutOfStock && 'opacity-60',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Imagen del producto */}
      <div className="relative aspect-square bg-muted">
        <Image
          src={imageError ? '/placeholder-product.png' : product.thumbnail_url}
          alt={product.name}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges en la esquina superior */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              Destacado
            </Badge>
          )}

          {isOutOfStock && (
            <Badge variant="destructive" className="gap-1">
              <Package className="h-3 w-3" />
              Agotado
            </Badge>
          )}

          {isLowStock && !isOutOfStock && (
            <Badge variant="secondary" className="gap-1">
              <Package className="h-3 w-3" />
              Últimas {product.stock} unidades
            </Badge>
          )}
        </div>
      </div>

      {/* Información del producto */}
      <CardContent className="p-6">
        <div className="flex flex-col space-y-3 w-full">
          {/* Nombre del producto */}
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {/* Nombre del artesano */}
          <p className="text-sm text-muted-foreground">
            {product.artisan.display_name}
          </p>

          {/* Badge de recogida disponible */}
          {product.pickup_available && (
            <Badge variant="secondary" className="gap-1 w-fit">
              <Package className="h-3 w-3" />
              Recogida disponible
            </Badge>
          )}

          {/* Spacer flexible */}
          <div className="flex-1" />

          {/* Precio */}
          <div className="flex items-baseline gap-1 pt-2">
            <span className="text-2xl font-bold text-primary">
              {parseFloat(product.price).toFixed(2)}€
            </span>
          </div>

          {/* Botón añadir al carrito */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || !product.is_available || isAdding}
            className="w-full gap-2"
            variant={isOutOfStock ? 'secondary' : 'default'}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAdding
              ? 'Añadiendo...'
              : isOutOfStock
              ? 'Agotado'
              : 'Añadir al carrito'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
