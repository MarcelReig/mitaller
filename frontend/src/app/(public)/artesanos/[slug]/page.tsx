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
import type { Metadata } from 'next';
import { ArtistHeader, ArtistSocials } from '@/components/artists';
import { WorkGrid } from '@/components/works';
import type { Artist } from '@/types/artist';
import type { WorkListItem } from '@/types/work';

// Base URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch datos del artesano desde Django
 */
async function getArtisan(slug: string): Promise<Artist | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/artists/${slug}/`, {
      // Revalidar según entorno: 60s en dev, 1h en prod
      next: { 
        revalidate: process.env.NODE_ENV === 'development' ? 60 : 3600 
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
    const res = await fetch(`${API_URL}/api/v1/artists/${slug}/works/`, {
      // Revalidar según entorno: 60s en dev, 1h en prod
      next: { 
        revalidate: process.env.NODE_ENV === 'development' ? 60 : 3600 
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
  params: {
    slug: string;
  };
}

/**
 * Server Component principal
 */
export default async function ArtisanProfilePage({ params }: PageParams) {
  const { slug } = params;

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
      
      {/* Header del artesano con cover image */}
      <ArtistHeader artist={artisan} />

      {/* Container principal */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-12">
          
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

          {/* Links de contacto y estadísticas */}
          <ArtistSocials artist={artisan} />

          {/* Sección de colecciones/galerías */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Portfolio
              </h2>
              <p className="text-muted-foreground">
                {works.length > 0 
                  ? `${works.length} ${works.length === 1 ? 'colección' : 'colecciones'} en el portfolio`
                  : 'Sin colecciones publicadas'
                }
              </p>
            </div>

            {/* Grid de portadas de colecciones */}
            <WorkGrid 
              works={works} 
              artisanSlug={artisan.slug} 
            />
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
  const { slug } = params;
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
    const res = await fetch(`${API_URL}/api/v1/artists/?is_featured=true`);
    const data = await res.json();
    
    return data.results?.map((artist: Artist) => ({
      slug: artist.slug,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
*/
