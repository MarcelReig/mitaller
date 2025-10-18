'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { Artist, Work, Product } from '@/types';
import { CRAFT_TYPE_LABELS } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ExternalLink, ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import Image from 'next/image';

export default function ArtistProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  // Fetch artista
  const { data: artist, isLoading: isLoadingArtist, error: errorArtist } = useQuery({
    queryKey: ['artist', slug],
    queryFn: async () => {
      const response = await axiosInstance.get<Artist>(`/api/v1/artists/${slug}/`);
      return response.data;
    },
    enabled: !!slug,
  });

  // Fetch obras del artista
  const { data: works, isLoading: isLoadingWorks } = useQuery({
    queryKey: ['works', slug],
    queryFn: async () => {
      const response = await axiosInstance.get<{ results: Work[] }>(
        '/api/v1/works/',
        { params: { artist: slug } }
      );
      return response.data.results;
    },
    enabled: !!slug,
  });

  // Fetch productos del artista
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', slug],
    queryFn: async () => {
      const response = await axiosInstance.get<{ results: Product[] }>(
        '/api/v1/shop/products/',
        { params: { artist: slug, is_active: true } }
      );
      return response.data.results;
    },
    enabled: !!slug,
  });

  // Loading state
  if (isLoadingArtist) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (errorArtist || !artist) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Artesano no encontrado</h1>
        <p className="text-muted-foreground mb-8">
          No pudimos encontrar el perfil de este artesano.
        </p>
        <Button asChild>
          <Link href="/artesanos">Ver todos los artesanos</Link>
        </Button>
      </div>
    );
  }

  // Handler para añadir al carrito
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/artesanos" className="hover:text-primary">
              Artesanos
            </Link>
            <span>/</span>
            <span className="text-foreground">{artist.display_name}</span>
          </nav>

          {/* Header del artesano */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Avatar */}
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={artist.avatar || undefined} alt={artist.display_name} />
                  <AvatarFallback className="text-4xl">
                    {artist.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl md:text-4xl font-bold">
                        {artist.display_name}
                      </h1>
                      {artist.is_featured && (
                        <Badge variant="secondary" className="text-sm">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Destacado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {CRAFT_TYPE_LABELS[artist.craft_type]}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {artist.full_location}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {artist.bio && (
                    <p className="text-muted-foreground leading-relaxed">
                      {artist.bio}
                    </p>
                  )}

                  {/* Contacto */}
                  {artist.website && (
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={artist.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Sitio web
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Portfolio y Tienda */}
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="portfolio">
                Portfolio ({works?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="tienda">
                Tienda ({products?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Tab Portfolio */}
            <TabsContent value="portfolio" className="mt-8">
              {isLoadingWorks ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : works && works.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {works.map((work) => (
                    <Card key={work.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square">
                        <Image
                          src={work.image_url}
                          alt={work.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {work.is_featured && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{work.title}</h3>
                        {work.year && (
                          <p className="text-sm text-muted-foreground mb-2">{work.year}</p>
                        )}
                        {work.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {work.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Este artesano aún no ha añadido obras a su portfolio
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab Tienda */}
            <TabsContent value="tienda" className="mt-8">
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-96 rounded-lg" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square">
                        <Image
                          src={product.thumbnail_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {!product.is_available && (
                          <Badge className="absolute top-2 right-2" variant="destructive">
                            Agotado
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-2xl font-bold text-primary">
                            {product.formatted_price}
                          </span>
                          
                          <Button
                            size="sm"
                            disabled={!product.is_available}
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.is_available ? 'Añadir' : 'Agotado'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Este artesano aún no tiene productos disponibles
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton component
 * Muestra placeholders mientras se cargan los datos del artesano
 */
function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumbs skeleton */}
        <Skeleton className="h-4 w-64" />

        {/* Header skeleton */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs skeleton */}
        <div className="space-y-8">
          <Skeleton className="h-10 w-96 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
