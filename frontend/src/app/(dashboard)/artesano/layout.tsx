/**
 * Layout del sistema viejo /artesano
 * 
 * DEPRECADO: Este layout ya no se usa.
 * Todo el sistema se consolidó en /dashboard con el nuevo layout moderno.
 * 
 * Este archivo se mantiene solo para los redirects de las páginas hijas.
 * Las páginas bajo /artesano redirigen automáticamente a /dashboard.
 */
export default function ArtesanoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No necesitamos verificación de auth aquí porque las páginas redirigen
  return <>{children}</>;
}
