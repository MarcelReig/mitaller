/**
 * WorkGrid Component
 * 
 * Grid responsive para mostrar las PORTADAS de todas las colecciones/galerías.
 * Equivalente a PortfolioContainer de Marina pero como Server Component.
 * 
 * IMPORTANTE: Muestra portadas (thumbnails) de colecciones, no obras individuales.
 * Cada card es una galería/álbum con múltiples fotos.
 * 
 * Features:
 * - Grid responsive (1/2/3 columnas)
 * - Empty state si no hay colecciones
 * - Server-rendered para mejor SEO
 */

import { WorkCard } from './WorkCard';
import type { WorkListItem } from '@/types/work';

interface WorkGridProps {
  works: WorkListItem[];
  artisanSlug: string;
}

export function WorkGrid({ works, artisanSlug }: WorkGridProps) {
  // Empty state
  if (!works || works.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-foreground">
            Sin colecciones publicadas
          </p>
          <p className="text-sm text-muted-foreground">
            Este artesano aún no ha añadido galerías a su portfolio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {works.map((work) => (
        <WorkCard
          key={work.id}
          work={work}
          artisanSlug={artisanSlug}
        />
      ))}
    </div>
  );
}

