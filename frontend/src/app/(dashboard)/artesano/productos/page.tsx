import { redirect } from 'next/navigation';

/**
 * Redirect del sistema viejo /artesano/productos al nuevo dashboard
 * Ahora la gestión de productos está en /dashboard/tienda
 */
export default function ArtesanoProductosPage() {
  redirect('/dashboard/tienda');
}
