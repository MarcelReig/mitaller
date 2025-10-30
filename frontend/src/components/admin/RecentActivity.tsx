import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart } from 'lucide-react';

export interface RecentActivityItem {
  type: 'artisan' | 'product' | 'order';
  timestamp: string;
  message: string;
  status?: string;
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'artisan':
        return <Users className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return '';
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'COMPLETED':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base md:text-lg">Actividad Reciente</CardTitle>
        <CardDescription className="text-xs md:text-sm">Últimas acciones en la plataforma</CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <div className="space-y-3 md:space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 md:gap-4">
              <div className="mt-0.5 md:mt-1 rounded-full bg-accent p-1.5 md:p-2 shrink-0">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-xs md:text-sm font-medium leading-none">
                  {activity.message}
                </p>
                <p className="text-[10px] md:text-sm text-muted-foreground">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
              {activity.status && (
                <span className={`text-[10px] md:text-xs font-medium shrink-0 ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
