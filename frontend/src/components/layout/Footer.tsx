import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">MiTaller.art</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Marketplace de artesanos y artistas. Conectamos creadores con amantes del arte.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/artistas" className="text-muted-foreground hover:text-primary transition-colors">
                  Artistas
                </Link>
              </li>
              <li>
                <Link href="/obras" className="text-muted-foreground hover:text-primary transition-colors">
                  Obras
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="text-muted-foreground hover:text-primary transition-colors">
                  Tienda
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ayuda" className="text-muted-foreground hover:text-primary transition-colors">
                  Ayuda
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-muted-foreground hover:text-primary transition-colors">
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} MiTaller.art. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}


