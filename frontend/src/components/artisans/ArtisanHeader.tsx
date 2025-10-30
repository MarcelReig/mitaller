/**
 * ArtisanHeader Component
 *
 * Hero minimalista horizontal del perfil público del artesano:
 * - Sin cover image (se usa en página "Sobre mí")
 * - Avatar pequeño a la izquierda (64px)
 * - Info inline horizontal
 * - Short description truncada (máx 2 líneas)
 * - 3 CTAs prominentes: Tienda (primario) → Sobre mí → Portfolio
 * - Altura total: ~220px
 * - Diseño responsive (stack vertical en mobile)
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Palette, ShoppingBag, User, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { avatarUrl } from '@/lib/cloudinary';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types/artisan';
import type { Artisan } from '@/types/artisan';

interface ArtisanHeaderProps {
  artisan: Artisan;
  className?: string;
}

export function ArtisanHeader({ artisan, className }: ArtisanHeaderProps) {
  // Optimizar avatar con Cloudinary
  const optimizedAvatar = artisan.avatar ? avatarUrl(artisan.avatar) : null;

  // Generar iniciales para fallback
  const initials = artisan.display_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('w-full bg-background border-b border-border/40', className)}>
      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">

        {/* Layout horizontal: Avatar + Info + CTAs */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">

          {/* ========================================
              AVATAR (Pequeño, a la izquierda)
              ======================================== */}
          <div className="relative flex-shrink-0">
            <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-border bg-muted overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
              {optimizedAvatar ? (
                <Image
                  src={optimizedAvatar}
                  alt={artisan.display_name}
                  fill
                  className="object-cover"
                  priority
                  sizes="80px"
                  quality={95}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/10">
                  <span className="text-2xl font-bold text-primary/80">
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================
              INFORMACIÓN (Centro, flex-grow)
              ======================================== */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Nombre + Badges */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {artisan.display_name}
              </h1>

              {/* Badges inline */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Craft Type */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium">
                  <Palette className="h-3 w-3" />
                  <span>{CRAFT_TYPE_LABELS[artisan.craft_type]}</span>
                </div>

                {/* Location */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground text-xs md:text-sm font-medium border border-border">
                  <MapPin className="h-3 w-3" />
                  <span>{LOCATION_LABELS[artisan.location]}</span>
                </div>
              </div>
            </div>

            {/* Short Description (truncada a 2 líneas) */}
            {artisan.short_description && (
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2">
                {artisan.short_description}
              </p>
            )}

            {/* ========================================
                CTAs (3 botones con jerarquía)
                ======================================== */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* CTA 1: Ver Tienda (PRIMARIO) */}
              <Button
                asChild
                size="default"
                className="gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Link href={`/artesanos/${artisan.slug}/tienda`}>
                  <ShoppingBag className="h-4 w-4" />
                  {artisan.total_products > 0
                    ? `Ver tienda (${artisan.total_products})`
                    : 'Ver tienda'
                  }
                </Link>
              </Button>

              {/* CTA 2: Sobre mí (SECUNDARIO) */}
              <Button
                asChild
                variant="outline"
                size="default"
                className="gap-2 font-medium"
              >
                <Link href={`/artesanos/${artisan.slug}/sobre-mi`}>
                  <User className="h-4 w-4" />
                  Sobre mí
                </Link>
              </Button>

              {/* CTA 3: Ver Portfolio (SECUNDARIO) */}
              <Button
                asChild
                variant="outline"
                size="default"
                className="gap-2 font-medium"
              >
                <Link href="#portfolio">
                  <ImageIcon className="h-4 w-4" />
                  {artisan.total_works > 0
                    ? `Portfolio (${artisan.total_works})`
                    : 'Portfolio'
                  }
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
