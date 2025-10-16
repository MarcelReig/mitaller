import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Inicio',
};

/**
 * Layout para páginas públicas
 * 
 * Incluye:
 * - Navbar con navegación y autenticación
 * - Contenido principal con max-width
 * - Footer con links y redes sociales
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </>
  );
}
