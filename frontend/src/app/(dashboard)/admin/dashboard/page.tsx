'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Palette, ShoppingBag, Package } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // TODO: Fetch real stats cuando implementemos el endpoint
  const stats = {
    total_artists: 0,
    pending_artists: 0,
    total_works: 0,
    total_products: 0,
    total_orders: 0,
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">🛠️ Panel de Administración</h1>
        <p className="text-gray-600">Gestiona tu marketplace</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Artesanos</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_artists}</div>
            <p className="text-xs text-gray-600">
              {stats.pending_artists} pendientes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Obras</CardTitle>
            <Palette className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_works}</div>
            <p className="text-xs text-gray-600">Publicadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_products}</div>
            <p className="text-xs text-gray-600">En tienda</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_orders}</div>
            <p className="text-xs text-gray-600">Totales</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/admin/artesanos">
            <Card className="hover:bg-gray-50 cursor-pointer transition">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Gestionar Artesanos</h3>
                    <p className="text-sm text-gray-600">
                      Aprobar y administrar artistas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="opacity-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-600">Ver Pedidos</h3>
                  <p className="text-sm text-gray-500">Próximamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

