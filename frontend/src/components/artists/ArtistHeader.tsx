/**
 * ArtistHeader Component
 * 
 * Hero minimalista del perfil público del artista:
 * - Cover image de fondo con overlay oscuro
 * - Avatar grande centrado sobrelapando
 * - Información limpia y bien espaciada
 * - Diseño responsive y moderno
 */

'use client';

import Image from 'next/image';
import { MapPin, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarUrl, coverUrl } from '@/lib/cloudinary';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types/artist';
import type { Artist } from '@/types/artist';

interface ArtistHeaderProps {
  artist: Artist;
  className?: string;
}

export function ArtistHeader({ artist, className }: ArtistHeaderProps) {
  // Optimizar imágenes con Cloudinary
  const optimizedAvatar = artist.avatar ? avatarUrl(artist.avatar) : null;
  const optimizedCover = artist.cover_image ? coverUrl(artist.cover_image) : null;
  
  // Generar iniciales para fallback
  const initials = artist.display_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('relative w-full', className)}>
      {/* ========================================
          COVER IMAGE SECTION
          ======================================== */}
      <div className="relative h-48 md:h-64 lg:h-72 w-full overflow-hidden">
        {optimizedCover ? (
          <>
            {/* Cover Image */}
            <Image
              src={optimizedCover}
              alt={`Portada de ${artist.display_name}`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              quality={90}
            />
            {/* Overlay oscuro para mejor legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-background/95" />
          </>
        ) : (
          /* Placeholder minimalista sin cover */
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60" />
        )}
      </div>

      {/* ========================================
          CONTENT SECTION
          ======================================== */}
      <div className="container relative px-4 md:px-6">
        {/* Avatar Container - Sobrelapando el cover */}
        <div className="flex flex-col items-center -mt-16 md:-mt-20 lg:-mt-24">
          
          {/* Avatar */}
          <div className="relative group">
            <div className="relative h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 rounded-full border-4 md:border-[6px] border-background bg-muted overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105">
              {optimizedAvatar ? (
                <Image
                  src={optimizedAvatar}
                  alt={artist.display_name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                  quality={95}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/10">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary/80">
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información del Artista */}
          <div className="text-center mt-6 md:mt-8 space-y-4 max-w-3xl">
            
            {/* Nombre */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              {artist.display_name}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Craft Type */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
                <Palette className="h-3.5 w-3.5" />
                <span>{CRAFT_TYPE_LABELS[artist.craft_type]}</span>
              </div>

              {/* Location */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium border border-border hover:bg-muted/80 transition-colors">
                <MapPin className="h-3.5 w-3.5" />
                <span>{LOCATION_LABELS[artist.location]}</span>
              </div>

              {/* Featured Badge */}
              {artist.is_featured && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium shadow-sm">
                  <span className="text-xs">⭐</span>
                  <span>Destacado</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {artist.bio && (
              <div className="pt-4">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {artist.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Espaciado inferior */}
        <div className="h-12 md:h-16" />
      </div>
    </div>
  );
}

