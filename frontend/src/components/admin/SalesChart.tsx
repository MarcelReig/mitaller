import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface SalesChartData {
  date: string;
  sales: number;
}

interface SalesChartProps {
  data: SalesChartData[];
}

export default function SalesChart({ data }: SalesChartProps) {
  // Encontrar el valor máximo para escalar las barras
  const maxSales = Math.max(...data.map(d => d.sales), 1);

  // Tomar solo los últimos 14 días para mejor visualización
  const recentData = data.slice(-14);

  return (
    <Card className="lg:col-span-4">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base md:text-lg">Ventas</CardTitle>
        <CardDescription className="text-xs md:text-sm">Últimos 14 días</CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <div className="space-y-2">
          {recentData.map((item, index) => {
            const date = new Date(item.date);
            const dateStr = date.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            });
            const percentage = (item.sales / maxSales) * 100;

            return (
              <div key={index} className="flex items-center gap-2 md:gap-3">
                <div className="w-12 md:w-16 text-[10px] md:text-xs text-muted-foreground shrink-0">
                  {dateStr}
                </div>
                <div className="flex-1 relative h-7 md:h-8">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary rounded transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                  {item.sales > 0 && (
                    <span className="absolute top-1/2 -translate-y-1/2 left-2 text-[10px] md:text-xs font-medium text-primary-foreground">
                      €{item.sales.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">
              €{data.reduce((sum, item) => sum + item.sales, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
