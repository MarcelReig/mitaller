import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

// Configuración de la fuente Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata de la aplicación
export const metadata: Metadata = {
  title: {
    default: 'MiTaller.art - Marketplace de Artesanos de Menorca',
    template: '%s | MiTaller.art',
  },
  description:
    'Marketplace de artesanos y artistas de Menorca. Conectamos creadores locales con amantes del arte y la artesanía tradicional.',
  keywords: [
    'artesanos',
    'artesanía',
    'Menorca',
    'arte',
    'marketplace',
    'hecho a mano',
    'cerámica',
    'joyería',
  ],
  authors: [
    {
      name: 'MiTaller.art',
      url: 'https://mitaller.art',
    },
  ],
  creator: 'MiTaller.art',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://mitaller.art',
    title: 'MiTaller.art - Marketplace de Artesanos de Menorca',
    description:
      'Descubre y compra piezas únicas de artesanos locales de Menorca. Arte y artesanía tradicional hecha a mano.',
    siteName: 'MiTaller.art',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MiTaller.art - Marketplace de Artesanos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiTaller.art - Marketplace de Artesanos de Menorca',
    description:
      'Descubre y compra piezas únicas de artesanos locales de Menorca.',
    images: ['/og-image.png'],
    creator: '@mitallerart',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

/**
 * Root Layout de la aplicación
 * 
 * Server Component que:
 * - Configura metadata SEO
 * - Carga fuente Inter
 * - Inicializa providers (React Query, Toast)
 * - Define estructura HTML base
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
