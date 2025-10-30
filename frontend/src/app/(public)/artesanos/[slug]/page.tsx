/**
 * Página de Perfil de Artesano Individual
 * 
 * Muestra el perfil del artesano + grid de PORTADAS de sus galerías/colecciones.
 * 
 * IMPORTANTE: Work = Colección/Galería (como álbum en Marina)
 * - Esta página muestra las PORTADAS de las colecciones en un grid
 * - Click en una portada → lleva a la galería completa (Fase 2)
 * 
 * Migración de Marina a Mitaller:
 * - De Client Component (React Query) a Server Component (fetch directo)
 * - De PortfolioContainer.jsx a WorkGrid.tsx
 * - Integración con Cloudinary para optimización de imágenes
 * 
 * Ruta: /artesanos/[slug]
 * Ejemplo: /artesanos/juan-ceramista
 * 
 * Features:
 * - Server-side rendering para mejor SEO
 * - Fetch paralelo de artista y colecciones
 * - Metadata dinámica para redes sociales
 * - 404 automático si no existe
 * - Breadcrumbs para navegación
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ArtisanHeader, ArtisanSocials } from '@/components/artisans';
import { WorkGrid } from '@/components/works';
import { FeaturedProducts } from '@/components/products';
import type { Artisan } from '@/types/artisan';
import type { WorkListItem } from '@/types/work';

// Base URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch datos del artesano desde Django
 */
async function getArtisan(slug: string): Promise<Artisan | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/artisans/${slug}/`, {
      // Revalidar: sin caché en dev, 1 hora en prod (se revalida on-demand al actualizar)
      next: { 
        revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 
      },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      
      // Para errores de servidor (500, 502, 503), lanzar error
      throw new Error(
        `Error fetching artist: ${res.status} ${res.statusText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching artisan:', error);
    throw error; // Propagar error en lugar de retornar null
  }
}

/**
 * Fetch colecciones/galerías del artesano desde nuevo endpoint custom
 * Retorna lista de colecciones con sus portadas (thumbnails)
 */
async function getArtisanWorks(slug: string): Promise<WorkListItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/artisans/${slug}/works/`, {
      // Revalidar: sin caché en dev, 1 hora en prod (se revalida on-demand al actualizar)
      next: { 
        revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 
      },
    });

    if (!res.ok) {
      console.error(`Error fetching works: ${res.status}`);
      
      // Si es 404, el artesano simplemente no tiene obras
      if (res.status === 404) return [];
      
      // Para otros errores, lanzar
      throw new Error(
        `Error fetching works: ${res.status} ${res.statusText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching works:', error);
    // Si hay error obteniendo obras, retornar array vacío
    // para no romper toda la página del artesano
    return [];
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
export default async function ArtisanProfilePage({ params }: PageParams) {
  const { slug } = await params;

  // Fetch paralelo de artista y obras
  const [artisan, works] = await Promise.all([
    getArtisan(slug),
    getArtisanWorks(slug),
  ]);

  // 404 si no existe el artesano
  if (!artisan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">

      {/* Header del artesano compacto con dual CTA */}
      <ArtisanHeader artisan={artisan} />

      {/* Container principal */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-12 md:space-y-16">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-primary transition-colors"
            >
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/artesanos"
              className="hover:text-primary transition-colors"
            >
              Artesanos
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {artisan.display_name}
            </span>
          </nav>

          {/* ========================================
              SECCIÓN: PRODUCTOS DESTACADOS
              ======================================== */}
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            }
          >
            <FeaturedProducts
              slug={artisan.slug}
              artisanName={artisan.display_name}
            />
          </Suspense>

          {/* ========================================
              SECCIÓN: PORTFOLIO (Obras)
              ======================================== */}
          <section id="portfolio" className="scroll-mt-20">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Portfolio
                </h2>
                <span className="text-sm text-muted-foreground">
                  — Obras y proyectos
                </span>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                {works.length > 0
                  ? `${works.length} ${works.length === 1 ? 'colección' : 'colecciones'} de trabajos realizados`
                  : 'Sin colecciones publicadas todavía'
                }
              </p>
            </div>

            {/* Grid de portadas de colecciones */}
            <WorkGrid
              works={works}
              artisanSlug={artisan.slug}
            />
          </section>

          {/* ========================================
              SECCIÓN: CONTACTO Y REDES SOCIALES
              ======================================== */}
          <section>
            <ArtisanSocials artisan={artisan} />
          </section>

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
      description: 'El artesano que buscas no existe o ha sido eliminado.',
    };
  }

  // Descripción truncada para meta
  const description = artisan.bio 
    ? artisan.bio.slice(0, 160) + (artisan.bio.length > 160 ? '...' : '')
    : `Portfolio de ${artisan.display_name}, artesano en ${artisan.full_location}`;

  // Priorizar cover_image para redes sociales (más visual), fallback a avatar
  const socialImage = artisan.cover_image || artisan.avatar;

  return {
    title: `${artisan.display_name} - Artesano | Mitaller.art`,
    description,
    openGraph: {
      title: artisan.display_name,
      description,
      images: socialImage ? [socialImage] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: artisan.display_name,
      description,
      images: socialImage ? [socialImage] : [],
    },
  };
}

/**
 * Generar rutas estáticas en build time (opcional)
 * Descomenta si quieres pre-renderizar perfiles de artesanos destacados
 */
/*
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/v1/artisans/?is_featured=true`);
    const data = await res.json();
    
    return data.results?.map((artisan: Artisan) => ({
      slug: artisan.slug,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
*/
