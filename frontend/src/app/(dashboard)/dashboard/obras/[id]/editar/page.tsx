/**
 * Editar Obra Page (Placeholder)
 * Se implementará en PROMPT #3B
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditarObraPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/obras">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Mis Obras
        </Link>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Editar Obra #{params.id}</CardTitle>
        </CardHeader>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground mb-4">
            El formulario de edición se implementará en <strong>PROMPT #3B</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

