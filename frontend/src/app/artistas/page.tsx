'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Palette, Package, Star } from 'lucide-react';

// Tipos
interface Artist {
  slug: string;
  display_name: string;
  craft_type: string;
  location: string;
  avatar: string | null;
  total_works: number;
  total_products: number;
  is_featured: boolean;
}

// Mapeo de tipos de artesanía (backend -> display)
const CRAFT_TYPES: Record<string, string> = {
  ceramics: 'Cerámica',
  jewelry: 'Joyería',
  leather: 'Marroquinería',
  textiles: 'Textiles',
  wood: 'Madera',
  glass: 'Vidrio',
  other: 'Otro',
};

// Mapeo de ubicaciones
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

export default function ArtistasPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCraftType, setSelectedCraftType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Cargar artistas desde la API
  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCraftType) params.append('craft_type', selectedCraftType);
        if (selectedLocation) params.append('location', selectedLocation);

        const response = await axios.get(`/api/v1/artists/?${params.toString()}`);
        setArtists(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [searchTerm, selectedCraftType, selectedLocation]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Descubre Nuestros Artesanos</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Conecta con talentosos artesanos de Menorca y descubre sus creaciones únicas
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar artesanos por nombre, bio, especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros de selección */}
        <div className="flex flex-wrap gap-4">
          {/* Filtro por tipo de artesanía */}
          <select
            value={selectedCraftType}
            onChange={(e) => setSelectedCraftType(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(CRAFT_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* Filtro por ubicación */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="">Todas las ubicaciones</option>
            {Object.entries(LOCATIONS).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* Botón para limpiar filtros */}
          {(searchTerm || selectedCraftType || selectedLocation) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCraftType('');
                setSelectedLocation('');
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Grid de artistas */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando artesanos...</p>
        </div>
      ) : artists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron artesanos con estos criterios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Link key={artist.slug} href={`/artistas/${artist.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {/* Avatar */}
                <div className="relative h-48 w-full bg-muted">
                  {artist.avatar ? (
                    <Image
                      src={artist.avatar}
                      alt={artist.display_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Palette className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {artist.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle>{artist.display_name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {LOCATIONS[artist.location] || artist.location}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">
                      {CRAFT_TYPES[artist.craft_type] || artist.craft_type}
                    </Badge>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                      <div className="flex items-center">
                        <Palette className="h-4 w-4 mr-1" />
                        {artist.total_works} obras
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {artist.total_products} productos
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

