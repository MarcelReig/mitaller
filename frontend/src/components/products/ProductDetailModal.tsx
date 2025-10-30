'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Star,
  Package,
  MapPin,
  Minus,
  Plus,
  User,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de detalle completo del producto
 *
 * Features:
 * - Galería de imágenes (thumbnail + images array)
 * - Nombre, descripción, precio, stock
 * - Información del artesano (avatar, nombre, link a perfil)
 * - Selector de cantidad (1 a stock máximo)
 * - Botón "Añadir al carrito" grande
 * - Badge "Recogida disponible" si pickup_available = true
 * - Responsive (drawer en mobile, dialog en desktop)
 *
 * @example
 * ```tsx
 * const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 *
 * <ProductDetailModal
 *   product={selectedProduct}
 *   isOpen={!!selectedProduct}
 *   onClose={() => setSelectedProduct(null)}
 * />
 * ```
 */
export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Resetear cantidad cuando cambia el producto
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuantity(1);
      setSelectedImage(0);
      onClose();
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product.is_available) return;

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    addItem(product, quantity);
    setIsAdding(false);

    // Resetear y cerrar
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!product) return null;

  // Todas las imágenes disponibles (thumbnail + galería)
  const allImages = [
    product.thumbnail_url,
    ...(Array.isArray(product.images) ? product.images : []),
  ];
  const isOutOfStock = product.stock === 0;

  const content = (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Galería de imágenes */}
      <div className="space-y-4">
        {/* Imagen principal */}
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
          <Image
            src={allImages[selectedImage] || '/placeholder-product.png'}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />

          {/* Badges overlay */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600">
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
          </div>
        </div>

        {/* Miniaturas */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                  selectedImage === index
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-muted hover:border-muted-foreground'
                )}
              >
                <Image
                  src={img || '/placeholder-product.png'}
                  alt={`${product.name} - imagen ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold leading-tight md:text-3xl">
            {product.name}
          </h2>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              {parseFloat(product.price).toFixed(2)}€
            </span>
            <span className="text-sm text-muted-foreground">EUR</span>
          </div>
        </div>

        {/* Descripción */}
        {product.description && (
          <div className="space-y-2">
            <h3 className="font-semibold">Descripción</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Información del artesano */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Artesano</h3>
          <Link
            href={`/artesanos/${product.artisan.slug}`}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={product.artisan.avatar || undefined}
                alt={product.artisan.display_name}
              />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-sm">
              <p className="font-medium">{product.artisan.display_name}</p>
              <p className="text-xs text-muted-foreground">Ver perfil →</p>
            </div>
          </Link>
        </div>

        {/* Info adicional */}
        <div className="space-y-2">
          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>
              {isOutOfStock ? (
                <span className="text-destructive font-medium">Agotado</span>
              ) : product.stock < 5 ? (
                <span className="text-orange-600 font-medium">
                  Últimas {product.stock} unidades
                </span>
              ) : (
                <span className="text-green-600 font-medium">
                  {product.stock} disponibles
                </span>
              )}
            </span>
          </div>

          {/* Recogida disponible */}
          {product.pickup_available && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <MapPin className="h-4 w-4" />
              <span>Recogida en taller disponible</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Selector de cantidad y botón */}
        <div className="space-y-4">
          {/* Selector de cantidad */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Cantidad:</span>
              <div className="flex items-center rounded-lg border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-r-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex h-10 w-12 items-center justify-center border-x text-center font-medium">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10 rounded-l-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Botón añadir al carrito */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || !product.is_available || isAdding}
            className="w-full gap-2"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5" />
            {isAdding
              ? 'Añadiendo...'
              : isOutOfStock
              ? 'Producto agotado'
              : `Añadir ${quantity} al carrito`}
          </Button>
        </div>
      </div>
    </div>
  );

  // Renderizar como Drawer en mobile, Dialog en desktop
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="sr-only">{product.name}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
