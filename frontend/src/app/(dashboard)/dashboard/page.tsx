/**
 * Dashboard Root Page
 *
 * Redirige automáticamente a la página de obras (primera opción útil del dashboard).
 * Esta redirección permite que los usuarios que naveguen directamente a /dashboard
 * sean enviados a una página con contenido real.
 */

import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/dashboard/obras');
}
