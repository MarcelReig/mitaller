/**
 * WorkDetailHeader Component
 * 
 * Muestra información de la obra:
 * - Título
 * - Descripción
 * - Badge de categoría
 * - Link al artista
 * - Botón volver
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarUrl } from '@/lib/cloudinary';
import { WORK_CATEGORY_LABELS } from '@/types/work';
import type { Work } from '@/types/work';

interface WorkDetailHeaderProps {
  work: Work;
  artisanSlug: string;
}

export function WorkDetailHeader({ work, artisanSlug }: WorkDetailHeaderProps) {
  // Optimizar avatar con Cloudinary
  const optimizedAvatar = work.artisan?.avatar 
    ? avatarUrl(work.artisan.avatar) 
    : null;

  // Iniciales del artesano para fallback
  const artisanInitials = work.artisan?.display_name
    ? work.artisan.display_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AR';

  return (
    <Card className="border-border">
      <CardContent className="p-6 md:p-8">
        
        {/* Botón volver */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6 -ml-2"
        >
          <Link href={`/artesanos/${artisanSlug}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al portfolio
          </Link>
        </Button>

        <div className="space-y-6">
          
          {/* Título y categoría */}
          <div>
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground flex-1">
                {work.title}
              </h1>
              
              {work.is_featured && (
                <Badge variant="secondary">
                  ✨ Destacado
                </Badge>
              )}
            </div>

            {work.category && (
              <Badge variant="outline" className="text-sm">
                {WORK_CATEGORY_LABELS[work.category]}
              </Badge>
            )}
          </div>

          {/* Descripción */}
          {work.description && (
            <p className="text-foreground/90 leading-relaxed text-lg max-w-3xl">
              {work.description}
            </p>
          )}

          {/* Info del artesano */}
          {work.artisan && (
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              {/* Avatar con dimensiones cuadradas exactas para evitar deformación */}
              <div className="h-10 w-10 shrink-0">
                <Avatar className="h-full w-full">
                  <AvatarImage 
                    src={optimizedAvatar || undefined}
                    alt={work.artisan.display_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm">
                    {artisanInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Creado por</p>
                <Link 
                  href={`/artesanos/${artisanSlug}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {work.artisan.display_name}
                </Link>
              </div>
            </div>
          )}

          {/* Contador de imágenes */}
          <p className="text-sm text-muted-foreground">
            {work.images.length} {work.images.length === 1 ? 'imagen' : 'imágenes'} en esta colección
          </p>

        </div>
      </CardContent>
    </Card>
  );
}

