'use client';

import Link from 'next/link';
import type { Artisan } from '@/types';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sparkles } from 'lucide-react';
import { avatarUrl } from '@/lib/cloudinary';

/**
 * Props del componente ArtisanCard
 */
interface ArtisanCardProps {
  artisan: Artisan;
}

/**
 * Componente para mostrar la tarjeta individual de un artesano
 *
 * Muestra avatar, nombre, especialidad, ubicación y badge de destacado.
 * Toda la card es clickeable y lleva al perfil del artesano.
 */
export default function ArtisanCard({ artisan }: ArtisanCardProps) {
  // Generar iniciales del nombre para el fallback del avatar
  const initials = artisan.display_name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Optimizar avatar con Cloudinary (800x800px, aspect ratio 1:1, calidad alta)
  const optimizedAvatar = artisan.avatar ? avatarUrl(artisan.avatar) : undefined;

  return (
    <Link href={`/artesanos/${artisan.slug}`} className="block">
      <Card className="h-full hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-border/50 overflow-hidden p-0 gap-0">
        {/* Avatar del artesano - Imagen superior sin padding */}
        <div className="w-full aspect-square relative bg-muted">
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage
              src={optimizedAvatar}
              alt={`Avatar de ${artisan.display_name}`}
              className="object-cover"
            />
            <AvatarFallback className="text-4xl font-semibold bg-primary/10 text-primary rounded-none">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="p-6">
          {/* Información del artesano */}
          <div className="text-center space-y-2 w-full">
            {/* Nombre del artesano */}
            <h3 className="text-xl font-semibold text-foreground line-clamp-1">
              {artisan.display_name}
            </h3>

            {/* Especialidad */}
            <p className="text-muted-foreground font-medium">
              {CRAFT_TYPE_LABELS[artisan.craft_type]}
            </p>

            {/* Ubicación */}
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{LOCATION_LABELS[artisan.location]}</span>
            </div>

            {/* Badge de destacado */}
            {artisan.is_featured && (
              <Badge 
                variant="secondary" 
                className="mt-2 gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Destacado
              </Badge>
            )}

            {/* Estadísticas (obras y productos) */}
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
              {artisan.total_works > 0 && (
                <span key="works">{artisan.total_works} obras</span>
              )}
              {artisan.total_products > 0 && (
                <span key="products">{artisan.total_products} productos</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
