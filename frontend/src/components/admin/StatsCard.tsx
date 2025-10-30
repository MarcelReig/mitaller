import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 md:px-6">
        <CardTitle className="text-xs md:text-sm font-medium">{title}</CardTitle>
        <Icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground shrink-0" />
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <div className="text-xl md:text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className={`text-[10px] md:text-xs mt-1 font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
