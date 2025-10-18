/**
 * WorkCard Component
 * 
 * Card para mostrar la PORTADA de una colección/galería en el grid del portfolio.
 * Similar a PortfolioItem de Marina pero adaptado a Next.js 15.
 * 
 * IMPORTANTE: Work = Colección/Galería/Álbum (no obra individual)
 * - thumbnail_url = Portada de la colección (se muestra en el grid)
 * - Click → lleva a la galería completa con todas las fotos
 * 
 * Features:
 * - Thumbnail optimizado con Cloudinary (portada)
 * - Hover effect con overlay
 * - Link a página de galería completa (/artesanos/{slug}/obras/{workId})
 * - Badge para colecciones destacadas
 * - Animaciones suaves
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ImageIcon, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { thumbUrl } from '@/lib/cloudinary';
import type { WorkListItem } from '@/types/work';

interface WorkCardProps {
  work: WorkListItem;
  artisanSlug: string;
}

export function WorkCard({ work, artisanSlug }: WorkCardProps) {
  // Optimizar thumbnail con Cloudinary
  const optimizedThumbnail = thumbUrl(work.thumbnail_url);

  return (
    <Link
      href={`/artesanos/${artisanSlug}/obras/${work.id}`}
      className="block group"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border">
        {/* Thumbnail con overlay */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={optimizedThumbnail}
            alt={work.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Overlay oscuro en hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Badge de destacado */}
          {work.is_featured && (
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 shadow-md"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Destacado
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-3">
          {/* Título */}
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {work.title}
          </h3>

          {/* Meta info: categoría si existe */}
          {work.category && (
            <p className="text-sm text-muted-foreground">
              {/* Puedes importar WORK_CATEGORY_LABELS si quieres mostrar en español */}
              {work.category}
            </p>
          )}

          {/* Footer: contador de imágenes */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
            <ImageIcon className="w-4 h-4" />
            <span>Ver galería</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
