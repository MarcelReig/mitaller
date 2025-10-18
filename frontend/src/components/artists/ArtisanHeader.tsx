/**
 * ArtisanHeader Component
 * 
 * Header con toda la información del artesano:
 * - Avatar con fallback
 * - Nombre y badges (destacado)
 * - Ubicación y especialidad
 * - Biografía
 * - Links a redes sociales
 * 
 * Server Component para mejor SEO.
 */

import Image from 'next/image';
import { MapPin, Palette, ExternalLink, Instagram } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { avatarUrl } from '@/lib/cloudinary';
import { CRAFT_TYPE_LABELS } from '@/types/artist';
import type { Artist } from '@/types/artist';

interface ArtisanHeaderProps {
  artisan: Artist;
}

export function ArtisanHeader({ artisan }: ArtisanHeaderProps) {
  // Optimizar avatar con Cloudinary
  const optimizedAvatar = artisan.avatar ? avatarUrl(artisan.avatar) : null;

  // Generar iniciales para fallback con múltiples fallbacks
  const initials = (artisan.display_name || artisan.slug || 'AR')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-border">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          
          {/* Avatar */}
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl flex-shrink-0">
            <AvatarImage 
              src={optimizedAvatar || undefined} 
              alt={artisan.display_name}
            />
            <AvatarFallback className="text-2xl md:text-4xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-4">
            
            {/* Nombre y badges */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {artisan.display_name}
                </h1>
                
                {artisan.is_featured && (
                  <Badge variant="secondary" className="text-sm">
                    ✨ Destacado
                  </Badge>
                )}
              </div>

              {/* Ubicación y especialidad */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    {CRAFT_TYPE_LABELS[artisan.craft_type]}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    {artisan.full_location}
                  </span>
                </div>
              </div>
            </div>

            {/* Biografía */}
            {artisan.bio && (
              <p className="text-foreground/90 leading-relaxed max-w-3xl">
                {artisan.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm text-muted-foreground pt-2">
              <div>
                <span className="font-semibold text-foreground">{artisan.total_works}</span>
                {' '}obras
              </div>
              <div>
                <span className="font-semibold text-foreground">{artisan.total_products}</span>
                {' '}productos
              </div>
            </div>

            {/* Links de contacto */}
            <div className="flex flex-wrap gap-3 pt-2">
              {artisan.website && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={artisan.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Sitio web
                  </a>
                </Button>
              )}

              {artisan.instagram_url && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={artisan.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

