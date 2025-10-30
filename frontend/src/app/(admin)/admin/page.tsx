'use client';

import { useEffect, useState } from 'react';
import { adminApi, DashboardStats } from '@/lib/api/admin';
import StatsCard from '@/components/admin/StatsCard';
import SalesChart from '@/components/admin/SalesChart';
import RecentActivity from '@/components/admin/RecentActivity';
import {
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Error al cargar las estadísticas del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error || 'No se pudieron cargar las estadísticas'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Vista general de MiTaller.art
        </p>
      </div>

      {/* Stats Grid - 6 cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
        <StatsCard
          title="Artesanos"
          value={stats.total_artisans}
          description={`${stats.pending_artisans} pendientes de aprobación`}
          icon={Users}
          trend={
            stats.new_artisans_this_week > 0
              ? {
                  value: `+${stats.new_artisans_this_week} esta semana`,
                  isPositive: true,
                }
              : undefined
          }
        />

        <StatsCard
          title="Productos"
          value={stats.total_products}
          description={
            stats.products_created_today > 0
              ? `${stats.products_created_today} creados hoy`
              : 'Ninguno creado hoy'
          }
          icon={Package}
        />

        <StatsCard
          title="Ventas Totales"
          value={`€${stats.total_sales.toFixed(2)}`}
          description={`€${stats.sales_last_month.toFixed(2)} último mes`}
          icon={TrendingUp}
          trend={
            stats.sales_last_month > 0
              ? {
                  value: `${((stats.sales_last_month / stats.total_sales) * 100).toFixed(1)}% del total`,
                  isPositive: true,
                }
              : undefined
          }
        />

        <StatsCard
          title="Pedidos"
          value={stats.total_orders}
          description={
            stats.recent_orders_count > 0
              ? `${stats.recent_orders_count} recientes`
              : 'Sin pedidos recientes'
          }
          icon={ShoppingCart}
        />

        <StatsCard
          title="Pendientes"
          value={stats.pending_artisans}
          description="Artesanos por aprobar"
          icon={Clock}
          trend={
            stats.pending_artisans > 0
              ? {
                  value: 'Requiere atención',
                  isPositive: false,
                }
              : undefined
          }
        />

        <StatsCard
          title="Productos Agotados"
          value={stats.products_out_of_stock}
          description="Sin stock disponible"
          icon={AlertTriangle}
          trend={
            stats.products_out_of_stock > 0
              ? {
                  value: 'Requiere reposición',
                  isPositive: false,
                }
              : undefined
          }
        />
      </div>

      {/* Charts and Activity - 2 column layout */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-7">
        <SalesChart data={stats.sales_chart} />
        <RecentActivity activities={stats.recent_activity} />
      </div>
    </div>
  );
}
