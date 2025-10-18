'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Sparkles, Heart, ArrowRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import type { Artist } from '@/types';
import { CRAFT_TYPE_LABELS } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Landing Page - MiTaller.art Marketplace
 *
 * Página principal con Hero, Featured Artists, Features y CTA final
 */
export default function HomePage() {
  // Fetch de artesanos destacados (máximo 6)
  const { data: featuredArtists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ['artists', 'featured'],
    queryFn: async () => {
      const response = await axiosInstance.get<{ results: Artist[] }>(
        '/api/v1/artists/',
        {
          params: {
            is_featured: true,
            page_size: 6,
          },
        }
      );
      return response.data.results;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ============================================
            HERO SECTION
            ============================================ */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="text-sm">
              ✨ Artesanía 100% de Menorca
            </Badge>

            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Artesanía Auténtica
              <br />
              <span className="text-primary">de Menorca</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Descubre creaciones únicas hechas a mano por artesanos locales.
              Cada pieza cuenta una historia.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/artesanos">
                  Explorar Artesanos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/registro">Únete como Artesano</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t">
              <div>
                <p className="text-3xl font-bold text-primary">20+</p>
                <p className="text-sm text-muted-foreground">Artesanos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">Productos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">8</p>
                <p className="text-sm text-muted-foreground">Localidades</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED ARTISTS SECTION
          ============================================ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Artesanos Destacados
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conoce a algunos de los talentosos artesanos que forman parte de
                nuestra comunidad
              </p>
            </div>

            {/* Grid de artesanos */}
            {isLoadingArtists ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 flex flex-col items-center gap-4">
                      <Skeleton className="h-24 w-24 rounded-full" />
                      <div className="space-y-2 text-center w-full">
                        <Skeleton className="h-6 w-32 mx-auto" />
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredArtists && featuredArtists.length > 0 ? (
              // Grid con artistas
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArtists.map((artist) => (
                  <Link
                    key={artist.slug}
                    href={`/artesanos/${artist.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                          <AvatarImage
                            src={artist.avatar || undefined}
                            alt={artist.display_name}
                          />
                          <AvatarFallback className="text-2xl">
                            {artist.display_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {artist.display_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {CRAFT_TYPE_LABELS[artist.craft_type]}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {artist.full_location}
                          </p>
                        </div>

                        {/* Badge destacado */}
                        {artist.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            Destacado
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No hay artesanos destacados por el momento
                </p>
              </div>
            )}

            {/* Link "Ver todos" */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/artesanos">
                  Ver todos los artesanos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                ¿Por qué MiTaller.art?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conectamos artesanos locales con personas que valoran la
                artesanía auténtica
              </p>
            </div>

            {/* Grid de features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Artesanía Local</h3>
                  <p className="text-muted-foreground">
                    Todos nuestros artesanos son de Menorca. Conoce la historia
                    detrás de cada pieza.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Piezas Únicas</h3>
                  <p className="text-muted-foreground">
                    Cada producto es hecho a mano con dedicación. No encontrarás
                    dos piezas exactamente iguales.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Apoyo Directo</h3>
                  <p className="text-muted-foreground">
                    Tu compra va directamente al artesano. Apoya el talento local
                    y preserva las tradiciones.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA FINAL SECTION (Artesanos)
          ============================================ */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 text-primary-foreground">
            {/* Título */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              ¿Eres artesano de Menorca?
            </h2>

            {/* Descripción */}
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              Únete a nuestra comunidad y vende tus creaciones. Sin costes
              iniciales, solo una pequeña comisión por venta.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="space-y-2">
                <p className="text-lg font-semibold">✓ Gratis durante 6 meses</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">✓ Solo 10% de comisión</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  ✓ Cobros directos con Stripe
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/registro">
                  Crear Cuenta de Artesano
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Small print */}
            <p className="text-sm opacity-75 pt-4">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="underline hover:opacity-100">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
