import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

/**
 * Página de Gestión de Pedidos
 * 
 * Placeholder para PROMPT #3D
 * Aquí se gestionarán los pedidos y ventas del artesano
 */
export default function PedidosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus ventas y pedidos
        </p>
      </div>
      
      {/* Placeholder Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Gestión de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium mb-2">
                Próximamente
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                La gestión de pedidos y ventas se implementará en{' '}
                <strong className="text-foreground">PROMPT #3D</strong>.
                Aquí podrás ver el historial de pedidos, gestionar estados, y más.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

