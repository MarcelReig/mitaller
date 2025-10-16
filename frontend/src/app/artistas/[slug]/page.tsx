'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Palette, Package, Mail, ExternalLink, Star } from 'lucide-react';

// Tipos
interface ArtistProfile {
  slug: string;
  display_name: string;
  craft_type: string;
  location: string;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  instagram: string | null;
  phone: string | null;
  is_featured: boolean;
  stripe_account_status: string;
  total_works: number;
  total_products: number;
}

interface Work {
  id: number;
  title: string;
  description: string;
  image: string;
  year?: number;
  category: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  main_image: string;
  stock: number;
  is_active: boolean;
}

// Mapeos
const CRAFT_TYPES: Record<string, string> = {
  ceramics: 'Cerámica',
  jewelry: 'Joyería',
  leather: 'Marroquinería',
  textiles: 'Textiles',
  wood: 'Madera',
  glass: 'Vidrio',
  other: 'Otro',
};

const LOCATIONS: Record<string, string> = {
  mao: 'Maó',
  ciutadella: 'Ciutadella',
  alaior: 'Alaior',
  es_castell: 'Es Castell',
  ferreries: 'Ferreries',
  es_mercadal: 'Es Mercadal',
  es_migjorn: 'Es Migjorn Gran',
  sant_lluis: 'Sant Lluís',
  other: 'Otro',
};

export default function ArtistDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch artist profile
        const artistResponse = await axios.get(`/api/v1/artists/${slug}/`);
        setArtist(artistResponse.data);

        // Fetch artist works
        const worksResponse = await axios.get(`/api/v1/works/?artist=${slug}`);
        setWorks(worksResponse.data.results || worksResponse.data);

        // Fetch artist products
        const productsResponse = await axios.get(`/api/v1/shop/products/?artist=${slug}`);
        setProducts(productsResponse.data.results || productsResponse.data);
      } catch (err: any) {
        console.error('Error fetching artist data:', err);
        setError('No se pudo cargar la información del artista');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArtistData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando perfil del artista...</p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-destructive">{error || 'Artista no encontrado'}</p>
          <Link href="/artistas">
            <Button className="mt-4">Volver a Artistas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header del Artista */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Avatar */}
        <div className="md:col-span-1">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {artist.avatar ? (
              <Image
                src={artist.avatar}
                alt={artist.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Palette className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Info del Artista */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{artist.display_name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {CRAFT_TYPES[artist.craft_type] || artist.craft_type}
                </Badge>
                {artist.is_featured && (
                  <Badge className="bg-yellow-500 text-sm">
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                {LOCATIONS[artist.location] || artist.location}
              </div>
            </div>
          </div>

          {/* Bio */}
          {artist.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Sobre mí</h3>
              <p className="text-muted-foreground whitespace-pre-line">{artist.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-4">
                <Palette className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">{artist.total_works}</div>
                  <div className="text-sm text-muted-foreground">Obras</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Package className="h-8 w-8 text-primary mr-3" />
                <div>
                  <div className="text-2xl font-bold">{artist.total_products}</div>
                  <div className="text-sm text-muted-foreground">Productos</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {artist.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={artist.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Sitio Web
                </a>
              </Button>
            )}
            {artist.instagram && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://instagram.com/${artist.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </Button>
            )}
            {artist.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${artist.phone}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contactar
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Portfolio y Tienda */}
      <Tabs defaultValue="works" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="works">Portfolio ({works.length})</TabsTrigger>
          <TabsTrigger value="products">Tienda ({products.length})</TabsTrigger>
        </TabsList>

        {/* Tab: Portfolio */}
        <TabsContent value="works" className="mt-8">
          {works.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Este artista aún no ha publicado obras en su portfolio
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  <div className="relative h-64 bg-muted">
                    {work.image && (
                      <Image
                        src={work.image}
                        alt={work.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{work.title}</CardTitle>
                    {work.year && (
                      <CardDescription>Año: {work.year}</CardDescription>
                    )}
                  </CardHeader>
                  {work.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {work.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Productos */}
        <TabsContent value="products" className="mt-8">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Este artista aún no tiene productos a la venta
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.is_active).map((product) => (
                <Link key={product.id} href={`/tienda/${product.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-64 bg-muted">
                      {product.main_image && (
                        <Image
                          src={product.main_image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      {product.stock === 0 && (
                        <Badge className="absolute top-2 right-2" variant="destructive">
                          Agotado
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription className="text-lg font-bold text-primary">
                        {parseFloat(product.price).toFixed(2)} €
                      </CardDescription>
                    </CardHeader>
                    {product.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

