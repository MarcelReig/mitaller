import { redirect } from 'next/navigation';

/**
 * Redirect del sistema viejo /artesano al nuevo dashboard
 * Esta página ya no se usa - todo se consolidó en /dashboard
 */
export default function ArtesanoPage() {
  redirect('/dashboard');
}
