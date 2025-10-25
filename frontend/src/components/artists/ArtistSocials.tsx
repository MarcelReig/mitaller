/**
 * ArtistSocials Component
 * 
 * Links de contacto y redes sociales del artista:
 * - Sitio web
 * - Instagram
 * - Teléfono
 * - Estadísticas (total_works, total_products)
 * 
 * Server Component para mejor SEO.
 */

import { ExternalLink, Instagram, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Artist } from '@/types/artist';

interface ArtistSocialsProps {
  artist: Artist;
}

export function ArtistSocials({ artist }: ArtistSocialsProps) {
  // Si no hay ningún link de contacto, no mostrar nada
  const hasContacts = artist.website || artist.instagram_url || artist.phone;
  
  if (!hasContacts && artist.total_works === 0 && artist.total_products === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Stats */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground text-lg">
                {artist.total_works}
              </span>
              {' '}
              <span className="text-muted-foreground">
                {artist.total_works === 1 ? 'obra' : 'obras'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-foreground text-lg">
                {artist.total_products}
              </span>
              {' '}
              <span className="text-muted-foreground">
                {artist.total_products === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>

          {/* Contact Links */}
          {hasContacts && (
            <div className="flex flex-wrap gap-3">
              {artist.website && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={artist.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Sitio web
                  </a>
                </Button>
              )}

              {artist.instagram_url && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={artist.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </Button>
              )}

              {artist.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`tel:${artist.phone}`}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

