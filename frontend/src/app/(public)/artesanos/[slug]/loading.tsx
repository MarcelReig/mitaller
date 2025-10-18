/**
 * Loading State para Página de Artesano
 * 
 * Muestra skeletons mientras se cargan los datos del artesano.
 * Next.js muestra automáticamente este componente durante Suspense.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Breadcrumbs skeleton */}
      <div className="border-b border-border bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Container principal */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-12">
          
          {/* Header skeleton */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                
                {/* Avatar skeleton */}
                <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full flex-shrink-0" />

                {/* Info skeleton */}
                <div className="flex-1 space-y-4 w-full">
                  {/* Nombre */}
                  <Skeleton className="h-10 w-64 max-w-full" />
                  
                  {/* Ubicación y especialidad */}
                  <div className="flex gap-6">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full max-w-3xl" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-3/4 max-w-xl" />
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Título de sección */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                {/* Imagen skeleton */}
                <Skeleton className="aspect-square w-full rounded-lg" />
                
                {/* Content skeleton */}
                <div className="space-y-2 p-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

