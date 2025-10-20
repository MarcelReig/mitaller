/**
 * Preview Page (Placeholder)
 * Se implementará en PROMPT #3D
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function PreviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preview Portfolio</h1>
        <p className="text-muted-foreground mt-1">
          Visualiza tu portfolio público
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
        </CardHeader>
        <CardContent className="py-16 text-center space-y-4">
          <p className="text-muted-foreground">
            Se implementará en <strong>PROMPT #3D</strong>.
          </p>
          <Button asChild>
            <a href="/artesanos/artista-demo" target="_blank">
              Ver Portfolio Público
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

