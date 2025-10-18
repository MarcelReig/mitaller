'use client';

import Link from 'next/link';
import type { Artist } from '@/types';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sparkles } from 'lucide-react';

/**
 * Props del componente ArtistCard
 */
interface ArtistCardProps {
  artist: Artist;
}

/**
 * Componente para mostrar la tarjeta individual de un artesano
 * 
 * Muestra avatar, nombre, especialidad, ubicación y badge de destacado.
 * Toda la card es clickeable y lleva al perfil del artesano.
 */
export default function ArtistCard({ artist }: ArtistCardProps) {
  // Generar iniciales del nombre para el fallback del avatar
  const initials = artist.display_name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/artesanos/${artist.slug}`} className="block">
      <Card className="h-full hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-border/50">
        <CardContent className="p-6 flex flex-col items-center gap-4">
          {/* Avatar del artesano */}
          <Avatar className="w-24 h-24 ring-2 ring-primary/10">
            <AvatarImage 
              src={artist.avatar || undefined} 
              alt={`Avatar de ${artist.display_name}`}
            />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Información del artesano */}
          <div className="text-center space-y-2 w-full">
            {/* Nombre del artesano */}
            <h3 className="text-xl font-semibold text-foreground line-clamp-1">
              {artist.display_name}
            </h3>

            {/* Especialidad */}
            <p className="text-muted-foreground font-medium">
              {CRAFT_TYPE_LABELS[artist.craft_type]}
            </p>

            {/* Ubicación */}
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{LOCATION_LABELS[artist.location]}</span>
            </div>

            {/* Badge de destacado */}
            {artist.is_featured && (
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
              {artist.total_works > 0 && (
                <span key="works">{artist.total_works} obras</span>
              )}
              {artist.total_products > 0 && (
                <span key="products">{artist.total_products} productos</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
