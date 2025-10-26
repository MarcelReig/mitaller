/**
 * Dashboard Overview Page (Client Component)
 * 
 * Muestra resumen de estadísticas y actividad reciente.
 * NOTA: Contenido simulado - se implementará con datos reales en Fase 3D
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Images, 
  ShoppingBag, 
  Receipt, 
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMyArtisanProfile } from '@/lib/hooks/useArtisans';

export default function DashboardPage() {
  // Obtener perfil del artesano para construir URL del portfolio
  const { data: artisan } = useMyArtisanProfile();
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de tu actividad y estadísticas
        </p>
      </div>
      
      {/* Aviso de contenido simulado */}
      <Alert className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Vista previa:</strong> Este dashboard muestra contenido simulado. 
          Las estadísticas y métricas reales se implementarán en una fase posterior 
          con analytics completo.
        </AlertDescription>
      </Alert>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Obras */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Obras
            </CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              +2 este mes
            </p>
          </CardContent>
        </Card>
        
        {/* Productos en Tienda */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 sin stock
            </p>
          </CardContent>
        </Card>
        
        {/* Pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              5 pendientes
            </p>
          </CardContent>
        </Card>
        
        {/* Ventas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.245€</div>
            <p className="text-xs text-muted-foreground">
              +18% vs. mes anterior
            </p>
          </CardContent>
        </Card>
        
      </div>
      
      {/* Grid 2 columnas */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Últimas Obras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Obras Recientes</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/obras">Ver todas</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Obra simulada 1 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Images className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Cala en Turqueta</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    234 vistas
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    18 likes
                  </span>
                </div>
              </div>
            </div>
            
            {/* Obra simulada 2 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Images className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Abstracción Mediterránea No. 7</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    189 vistas
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    12 likes
                  </span>
                </div>
              </div>
            </div>
            
            {/* Obra simulada 3 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Images className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Barca en el Puerto</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    156 vistas
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    9 likes
                  </span>
                </div>
              </div>
            </div>
            
          </CardContent>
        </Card>
        
        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Actividad Reciente</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/pedidos">Ver todo</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Actividad 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                <Receipt className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <strong>Nuevo pedido</strong> - Cerámica Azul
                </p>
                <p className="text-xs text-muted-foreground">
                  45,00€ • Hace 2 horas
                </p>
              </div>
            </div>
            
            {/* Actividad 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <strong>Nuevo comentario</strong> en &ldquo;Cala en Turqueta&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">
                  Hace 5 horas
                </p>
              </div>
            </div>
            
            {/* Actividad 3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <strong>5 nuevos likes</strong> en tus obras
                </p>
                <p className="text-xs text-muted-foreground">
                  Hace 1 día
                </p>
              </div>
            </div>
            
            {/* Actividad 4 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <strong>Tu portfolio</strong> alcanzó 1.000 visitas
                </p>
                <p className="text-xs text-muted-foreground">
                  Hace 2 días
                </p>
              </div>
            </div>
            
          </CardContent>
        </Card>
        
      </div>
      
      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/obras/nueva">
                <Images className="mr-2 h-4 w-4" />
                Nueva Obra
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/tienda">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Añadir Producto
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/pedidos">
                <Receipt className="mr-2 h-4 w-4" />
                Ver Pedidos
              </Link>
            </Button>
            {artisan?.slug && (
              <Button variant="outline" asChild>
                <Link href={`/artesanos/${artisan.slug}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver perfil público
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
