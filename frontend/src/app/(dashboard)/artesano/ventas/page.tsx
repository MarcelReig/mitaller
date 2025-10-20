import { redirect } from 'next/navigation';

/**
 * Redirect del sistema viejo /artesano/ventas al nuevo dashboard
 * Ahora la gestión de pedidos está en /dashboard/pedidos
 */
export default function ArtesanoVentasPage() {
  redirect('/dashboard/pedidos');
}
