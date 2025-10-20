import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

/**
 * Página de Gestión de Tienda
 * 
 * Placeholder para PROMPT #3B
 * Aquí se gestionarán los productos en venta del artesano
 */
export default function TiendaPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tienda</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus productos en venta
        </p>
      </div>
      
      {/* Placeholder Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Gestión de Productos
          </CardTitle>
        </CardHeader>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium mb-2">
                Próximamente
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                La gestión de productos de tienda se implementará en{' '}
                <strong className="text-foreground">PROMPT #3B</strong>.
                Aquí podrás crear productos, gestionar inventario, y más.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

