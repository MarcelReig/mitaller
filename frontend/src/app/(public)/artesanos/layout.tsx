import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directorio de Artesanos',
  description: 'Explora todos los artesanos de Menorca. Encuentra ceramistas, joyeros, tejedores y más.',
  keywords: ['artesanos menorca', 'directorio', 'cerámica', 'joyería', 'artesanía local'],
};

export default function ArtesanosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


