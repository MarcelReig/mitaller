/**
 * Perfil Page (Placeholder)
 * Se implementará en PROMPT #3D
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Edita tu información
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">
            Se implementará en <strong>PROMPT #3D</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

