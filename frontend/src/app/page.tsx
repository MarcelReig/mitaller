'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Sparkles, Heart, ArrowRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import type { Artisan } from '@/types';
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
      const response = await axiosInstance.get<{ results: Artisan[] }>(
        '/api/v1/artisans/',
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
        <section className="relative overflow-hidden">
          {/* Background image container */}
          <div className="absolute inset-0">
            <Image
              src="/images/landing-hero.jpg"
              alt="Artesanía y Arte de Menorca"
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
            />
            {/* Overlay oscuro para legibilidad del texto */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <Badge variant="secondary" className="text-sm font-medium shadow-lg bg-white/90 text-gray-900 hover:bg-white">
                ✨ Arte y Artesanía 100% de Menorca
              </Badge>

              {/* Título principal - más emocional */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white drop-shadow-2xl">
                Descubre el Arte y Artesanía
                <br />
                <span className="text-white">que Cuenta Historias</span>
              </h1>

              {/* Subtítulo - más específico y emocional */}
              <p className="text-lg md:text-xl lg:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Conecta con artistas y artesanos de Menorca. Descubre desde cerámica
                tradicional hasta arte contemporáneo, cada pieza hecha con pasión
                y dedicación. Cada creación es una historia de talento auténtico.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button asChild size="lg" className="text-base md:text-lg px-8 py-6 shadow-lg hover:shadow-xl">
                  <Link href="/artesanos">
                    Explorar Creadores
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-8 py-6 bg-background/80 backdrop-blur-sm">
                  <Link href="/registro">Únete como Creador</Link>
                </Button>
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
                Creadores Destacados
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conoce a algunos de los artistas y artesanos que forman parte de
                nuestra comunidad menorquina
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
              // Grid con artistas - Diseño moderno
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredArtists.map((artist) => {
                  const initials = artist.display_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <Link
                      key={artist.slug}
                      href={`/artesanos/${artist.slug}`}
                      className="group"
                    >
                      <div className="relative">
                        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 p-0 gap-0">
                          {/* Imagen */}
                          <div className="relative aspect-square overflow-hidden bg-muted">
                            {artist.avatar ? (
                              <img
                                src={artist.avatar}
                                alt={artist.display_name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                <span className="text-6xl font-bold text-primary/30">
                                  {initials}
                                </span>
                              </div>
                            )}
                            {/* Overlay sutil en hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                          </div>

                          {/* Contenido */}
                          <CardContent className="p-5">
                            <div className="space-y-3">
                              {/* Nombre */}
                              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                {artist.display_name}
                              </h3>

                              {/* Meta info */}
                              <div className="space-y-1.5">
                                <p className="text-sm text-muted-foreground font-medium">
                                  {CRAFT_TYPE_LABELS[artist.craft_type]}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{artist.full_location}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Badge destacado flotante */}
                        {artist.is_featured && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-amber-500 text-white border-0 shadow-lg">
                              ⭐ Destacado
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No hay creadores destacados por el momento
                </p>
              </div>
            )}

            {/* Link "Ver todos" */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/artesanos">
                  Ver todos los creadores
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
                Conectamos artistas y artesanos locales con personas que valoran
                el talento auténtico y las creaciones únicas
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
                  <h3 className="text-xl font-semibold">100% Menorca</h3>
                  <p className="text-muted-foreground">
                    Solo creadores verificados de Menorca. Desde artesanía tradicional
                    hasta arte contemporáneo, cada pieza lleva el sello de nuestra isla.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Conexión Personal</h3>
                  <p className="text-muted-foreground">
                    Conoce al creador detrás de cada pieza. Ve su taller o estudio,
                    descubre su proceso y entiende el valor real de cada creación.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Comercio Justo Local</h3>
                  <p className="text-muted-foreground">
                    Tu dinero va directo al creador, sin grandes plataformas que se
                    queden con la mayoría. Impulsa la economía creativa local y apoya
                    el talento menorquín.
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
              ¿Eres artista o artesano de Menorca?
            </h2>

            {/* Descripción */}
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              Únete a nuestra comunidad y muestra tu trabajo al mundo.
              Ya sea arte contemporáneo o artesanía tradicional, vende directamente
              sin intermediarios y recibe tus pagos al instante.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="space-y-2">
                <p className="text-lg font-semibold">✓ Sin cuota mensual</p>
                <p className="text-sm opacity-75">Gratis durante la fase beta</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">✓ Solo 10% por venta</p>
                <p className="text-sm opacity-75">Comisión justa y transparente</p>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  ✓ Cobros con Stripe
                </p>
                <p className="text-sm opacity-75">Pagos seguros y directos</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/registro">
                  Crear Cuenta de Creador
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
