'use client';

import Link from 'next/link';
import { ShoppingBag, User, Truck, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CartItemRow } from './CartItemRow';
import { useCartStore } from '@/stores/cartStore';
import { useCartByArtisan, useCartTotals } from '@/hooks/useCartByArtisan';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Drawer lateral del carrito (estilo Shopify) con agrupación multi-vendor
 *
 * Features CRÍTICAS:
 * - Sheet (drawer desde la derecha)
 * - Agrupar items por artesano (multi-vendor)
 * - Mostrar subtotal por artesano
 * - Mostrar costes de envío por artesano
 * - Total general del carrito
 * - Botón "Finalizar Compra" grande
 * - Empty state si carrito vacío
 * - Animación de entrada/salida suave
 *
 * Estructura visual:
 * ```
 * ┌─────────────────────────────────┐
 * │ 🛒 Tu Carrito (3 items)        │
 * ├─────────────────────────────────┤
 * │ 👤 María - Cerámica             │
 * │   📦 Taza azul x2      30€      │
 * │   📦 Plato blanco x1   15€      │
 * │   Subtotal:           45€       │
 * │   Envío:              5€        │
 * │   ────────────────────────      │
 * │   Total artesano:     50€       │
 * ├─────────────────────────────────┤
 * │ 👤 Pere - Joyería               │
 * │   📦 Collar plata x1   80€      │
 * │   Subtotal:           80€       │
 * │   Envío:              3€        │
 * │   ────────────────────────      │
 * │   Total artesano:     83€       │
 * ├─────────────────────────────────┤
 * │ TOTAL CARRITO:        133€      │
 * │ [Finalizar Compra] →            │
 * └─────────────────────────────────┘
 * ```
 *
 * @example
 * ```tsx
 * const [isCartOpen, setIsCartOpen] = useState(false);
 *
 * <CartDrawer
 *   isOpen={isCartOpen}
 *   onClose={() => setIsCartOpen(false)}
 * />
 * ```
 */
export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const itemsByArtisan = useCartByArtisan();
  const { totalItems, totalProducts, totalShipping, grandTotal } =
    useCartTotals();

  const isEmpty = itemsByArtisan.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5" />
            Tu Carrito
            {totalItems > 0 && (
              <span className="text-muted-foreground">({totalItems})</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          // Empty state
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Descubre productos únicos de artesanos menorquines
              </p>
            </div>
            <Button asChild onClick={onClose}>
              <Link href="/explorar">Explorar productos</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Contenido del carrito */}
            <ScrollArea className="flex-1 -mx-6 px-6 overflow-hidden">
              <div className="space-y-6 py-4">
                {itemsByArtisan.map((group) => (
                  <div
                    key={group.artisan.id}
                    className="rounded-lg border bg-card p-4"
                  >
                    {/* Header del artesano */}
                    <Link
                      href={`/artesanos/${group.artisan.slug}`}
                      onClick={onClose}
                      className="mb-4 flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
                    >
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage
                          src={group.artisan.avatar || undefined}
                          alt={group.artisan.display_name}
                        />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {group.artisan.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ver perfil →
                        </p>
                      </div>
                    </Link>

                    {/* Items del artesano */}
                    <div className="space-y-2 border-t pt-2">
                      {group.items.map((item) => (
                        <CartItemRow
                          key={item.product.id}
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeItem}
                        />
                      ))}
                    </div>

                    {/* Totales del artesano */}
                    <div className="mt-4 space-y-1 border-t pt-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">
                          {group.subtotal.toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Truck className="h-3 w-3" />
                          Envío:
                        </span>
                        <span className="font-medium">
                          {group.shipping.toFixed(2)}€
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total artesano:</span>
                        <span>{group.total.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer con totales y botón checkout */}
            <SheetFooter className="flex-col gap-4 border-t pt-4">
              {/* Resumen de totales */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total productos:
                  </span>
                  <span className="font-medium">
                    {totalProducts.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total envíos:</span>
                  <span className="font-medium">
                    {totalShipping.toFixed(2)}€
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span className="text-primary">{grandTotal.toFixed(2)}€</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-2">
                <Button size="lg" className="w-full gap-2" asChild>
                  <Link href="/checkout" onClick={onClose}>
                    Finalizar Compra
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="w-full"
                >
                  Vaciar carrito
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
