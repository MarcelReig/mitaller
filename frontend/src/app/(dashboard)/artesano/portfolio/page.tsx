import { redirect } from 'next/navigation';

/**
 * Redirect del sistema viejo /artesano/portfolio al nuevo dashboard
 * Ahora la gestión de obras está en /dashboard/obras
 */
export default function ArtesanoPortfolioPage() {
  redirect('/dashboard/obras');
}
