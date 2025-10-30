/**
 * Página "Sobre mí" del Artesano
 *
 * URL: /artesanos/{slug}/sobre-mi
 *
 * Muestra información personal del artesano:
 * - Cover image grande a la derecha (40%)
 * - Biografía completa + contacto a la izquierda (60%)
 * - Responsive: stack vertical en mobile
 *
 * Features:
 * - Server Component (fetch directo)
 * - Metadata dinámica para SEO
 * - Breadcrumb: Inicio > Artesanos > {nombre} > Sobre mí
 * - Layout imagen + texto (desktop)
 * - Stack vertical (mobile)
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowLeft, MapPin, Phone, Globe, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { coverUrl } from '@/lib/cloudinary';
import { CRAFT_TYPE_LABELS, LOCATION_LABELS } from '@/types/artisan';
import type { Artisan } from '@/types/artisan';

// Base URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch datos del artesano desde Django
 */
async function getArtisan(slug: string): Promise<Artisan | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/artisans/${slug}/`, {
      next: {
        revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600
      },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Error fetching artisan: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching artisan:', error);
    throw error;
  }
}

/**
 * Params del componente
 */
interface PageParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Server Component principal
 */
export default async function AboutArtisanPage({ params }: PageParams) {
  const { slug } = await params;
  const artisan = await getArtisan(slug);

  // 404 si no existe el artesano
  if (!artisan) {
    notFound();
  }

  // Optimizar cover image
  const optimizedCover = artisan.cover_image ? coverUrl(artisan.cover_image) : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/artesanos" className="hover:text-primary transition-colors">
            Artesanos
          </Link>
          <span>/</span>
          <Link
            href={`/artesanos/${slug}`}
            className="hover:text-primary transition-colors"
          >
            {artisan.display_name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Sobre mí</span>
        </nav>

        {/* Botón volver */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/artesanos/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al perfil
          </Link>
        </Button>

        {/* Layout principal: Texto (izquierda 60%) + Imagen (derecha 40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* ========================================
              COLUMNA IZQUIERDA: Contenido
              ======================================== */}
          <div className="lg:col-span-3 space-y-8">

            {/* Header de la sección */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {artisan.display_name}
              </h1>

              {/* Subtítulo con oficio y ubicación */}
              <p className="text-lg md:text-xl text-muted-foreground">
                {CRAFT_TYPE_LABELS[artisan.craft_type]} en {LOCATION_LABELS[artisan.location]}
              </p>
            </div>

            {/* Biografía completa */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-foreground mb-4">Mi historia</h2>
              {artisan.bio ? (
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                  {artisan.bio}
                </p>
              ) : (
                <p className="text-base text-muted-foreground italic">
                  Este artesano todavía no ha escrito su biografía.
                </p>
              )}
            </div>

            {/* Información de contacto */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h2 className="text-xl font-semibold text-foreground">Contacto</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ubicación */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Ubicación</p>
                    <p className="text-sm text-muted-foreground">{artisan.full_location}</p>
                  </div>
                </div>

                {/* Teléfono */}
                {artisan.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Teléfono</p>
                      <a
                        href={`tel:${artisan.phone}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {artisan.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {artisan.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Web</p>
                      <a
                        href={artisan.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {artisan.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {artisan.instagram && (
                  <div className="flex items-start gap-3">
                    <Instagram className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Instagram</p>
                      <a
                        href={artisan.instagram_url || `https://instagram.com/${artisan.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        @{artisan.instagram}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA para ver productos */}
            <div className="flex flex-wrap gap-3 pt-6">
              <Button asChild size="lg" className="gap-2">
                <Link href={`/artesanos/${slug}/tienda`}>
                  Ver tienda
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href={`/artesanos/${slug}`}>
                  Ver perfil completo
                </Link>
              </Button>
            </div>
          </div>

          {/* ========================================
              COLUMNA DERECHA: Imagen Cover
              ======================================== */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              {optimizedCover ? (
                <div className="relative aspect-[3/4] lg:aspect-[2/3] w-full rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={optimizedCover}
                    alt={`Foto de ${artisan.display_name}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    quality={90}
                  />
                </div>
              ) : (
                <div className="relative aspect-[3/4] lg:aspect-[2/3] w-full rounded-lg overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Sin imagen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Metadata dinámica para SEO
 */
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const artisan = await getArtisan(slug);

  if (!artisan) {
    return {
      title: 'Artesano no encontrado | Mitaller.art',
    };
  }

  return {
    title: `Sobre ${artisan.display_name} | Mitaller.art`,
    description: artisan.bio || `Conoce más sobre ${artisan.display_name}, ${CRAFT_TYPE_LABELS[artisan.craft_type]} en ${LOCATION_LABELS[artisan.location]}.`,
    openGraph: {
      title: `Sobre ${artisan.display_name}`,
      description: artisan.bio || `${CRAFT_TYPE_LABELS[artisan.craft_type]} en ${LOCATION_LABELS[artisan.location]}`,
      images: artisan.cover_image ? [artisan.cover_image] : [],
    },
  };
}
