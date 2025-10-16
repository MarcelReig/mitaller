'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, Heart, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Descubre el Arte Artesanal de Menorca
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conectamos artesanos locales con amantes del arte. Encuentra piezas únicas, 
            hechas a mano con pasión y tradición.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/artistas">
              <Button size="lg" className="text-lg">
                Explorar Artesanos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/obras">
              <Button size="lg" variant="outline" className="text-lg">
                Ver Obras
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir MiTaller.art?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Artesanos Locales</CardTitle>
                <CardDescription>
                  Apoyamos directamente a los artesanos de Menorca, sin intermediarios
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Piezas Únicas</CardTitle>
                <CardDescription>
                  Cada obra es única, hecha a mano con dedicación y técnicas tradicionales
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Compra Segura</CardTitle>
                <CardDescription>
                  Pagos seguros y protección al comprador en cada transacción
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explora por Categoría
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Cerámica', icon: '🏺', href: '/artistas?craft_type=ceramics' },
              { name: 'Joyería', icon: '💍', href: '/artistas?craft_type=jewelry' },
              { name: 'Madera', icon: '🪵', href: '/artistas?craft_type=wood' },
              { name: 'Textiles', icon: '🧵', href: '/artistas?craft_type=textiles' },
              { name: 'Marroquinería', icon: '👜', href: '/artistas?craft_type=leather' },
              { name: 'Vidrio', icon: '🫙', href: '/artistas?craft_type=glass' },
              { name: 'Pintura', icon: '🎨', href: '/obras' },
              { name: 'Ver Todos', icon: '✨', href: '/artistas' },
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <span className="text-4xl mb-2">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">
                ¿Eres Artesano?
              </CardTitle>
              <CardDescription className="text-primary-foreground/90 text-lg">
                Únete a nuestra comunidad y lleva tu arte a más personas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg">
                  Registrarse como Artesano
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Artesanos Registrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Obras Disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Clientes Satisfechos</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

