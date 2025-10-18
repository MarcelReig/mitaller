/**
 * Página de Galería Individual
 * 
 * Muestra todas las imágenes de una obra/colección específica.
 * 
 * Ruta: /artesanos/[slug]/obras/[workId]
 * Ejemplo: /artesanos/juan-ceramista/obras/1
 * 
 * Features:
 * - Server Component para SEO
 * - Metadata dinámica (OG images)
 * - Client Component solo para lightbox
 * - Breadcrumbs completos
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { WorkDetailClient } from './WorkDetailClient';
import type { Work } from '@/types/work';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch obra completa con todas las imágenes
 */
async function getWork(workId: string): Promise<Work | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/works/${workId}/`, {
      next: { 
        revalidate: process.env.NODE_ENV === 'development' ? 60 : 3600 
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch work: ${res.status}`);
    }

    const data = await res.json();
    
    // Validar que images sea un array
    if (!Array.isArray(data.images)) {
      console.warn('Work images is not an array, setting to empty');
      data.images = [];
    }
    
    return data;

  } catch (error) {
    console.error('Error fetching work:', error);
    throw error;
  }
}

/**
 * Verificar que el artista corresponde al slug
 */
async function verifyArtistSlug(work: Work, slug: string): Promise<boolean> {
  return work.artist?.slug === slug;
}

interface PageParams {
  params: {
    slug: string;
    workId: string;
  };
}

/**
 * Server Component principal
 */
export default async function WorkDetailPage({ params }: PageParams) {
  const { slug, workId } = params;

  // Fetch obra
  const work = await getWork(workId);

  // 404 si no existe
  if (!work) {
    notFound();
  }

  // Verificar que el artista corresponde al slug de la URL
  const isCorrectArtist = await verifyArtistSlug(work, slug);
  if (!isCorrectArtist) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 py-4">
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
            <Link 
              href={`/artesanos/${slug}`}
              className="hover:text-primary transition-colors"
            >
              {work.artist?.display_name || 'Artesano'}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium line-clamp-1">
              {work.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Container principal */}
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Client Component con lightbox */}
        <WorkDetailClient work={work} artisanSlug={slug} />

      </div>
    </main>
  );
}

/**
 * Metadata dinámica para SEO
 */
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { workId } = params;
  const work = await getWork(workId);

  if (!work) {
    return {
      title: 'Obra no encontrada | Mitaller.art',
    };
  }

  const description = work.description
    ? work.description.slice(0, 160) + (work.description.length > 160 ? '...' : '')
    : `Galería de ${work.title} por ${work.artist?.display_name}`;

  // Usar primera imagen para Open Graph
  const ogImage = work.images[0] || work.thumbnail_url;

  return {
    title: `${work.title} - ${work.artist?.display_name} | Mitaller.art`,
    description,
    openGraph: {
      title: work.title,
      description,
      images: ogImage ? [ogImage] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: work.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

