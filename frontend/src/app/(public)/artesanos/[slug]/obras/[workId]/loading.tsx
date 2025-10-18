/**
 * Loading state para página de galería individual
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Breadcrumbs skeleton */}
      <div className="border-b border-border bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="h-5 bg-muted rounded w-96 animate-pulse" />
        </div>
      </div>

      {/* Container */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-8">
          
          {/* Header skeleton */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded w-full" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
            </div>
          </div>

          {/* Gallery skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

