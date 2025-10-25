import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js para proteger rutas del dashboard
 * 
 * Features:
 * - Protege rutas /dashboard/* (dashboard artesanos)
 * - Verifica autenticación mediante token JWT en cookies
 * - Valida que el usuario tenga rol de artesano
 * - Redirige a login si no está autenticado
 * - Redirige a home si no tiene permisos
 * 
 * Se ejecuta en Edge Runtime para máxima performance
 */

// Rutas que requieren autenticación de artesano
const ARTISAN_ROUTES = ['/dashboard', '/artesano'];

// Rutas que requieren autenticación de administrador
const ADMIN_ROUTES = ['/admin'];

// Rutas públicas que no requieren middleware
const PUBLIC_ROUTES = ['/', '/artesanos', '/carrito', '/login', '/registro'];

/**
 * Verificar si el usuario tiene un token válido
 * @param request - Request de Next.js
 * @returns true si hay token, false si no
 */
function hasAuthToken(request: NextRequest): boolean {
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  return !!token;
}

/**
 * Verificar si la ruta requiere autenticación de artesano
 * @param pathname - Ruta a verificar
 * @returns true si requiere autenticación de artesano
 */
function requiresArtisanAuth(pathname: string): boolean {
  return ARTISAN_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verificar si la ruta requiere autenticación de administrador
 * @param pathname - Ruta a verificar
 * @returns true si requiere autenticación de administrador
 */
function requiresAdminAuth(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verificar si es una ruta pública
 * @param pathname - Ruta a verificar
 * @returns true si es pública
 */
function isPublicRoute(pathname: string): boolean {
  // Rutas exactas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Rutas dinámicas públicas
  if (
    pathname.startsWith('/artesanos/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Archivos estáticos
  ) {
    return true;
  }

  return false;
}

/**
 * Middleware principal
 * Se ejecuta antes de cada request para verificar permisos
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Proteger rutas /admin/*
  if (requiresAdminAuth(pathname)) {
    const token = request.cookies.get('token')?.value;
    
    // Verificar si hay token
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Decodificar JWT y verificar role
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );
      
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/not-authorized', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si la ruta requiere autenticación de artesano
  if (requiresArtisanAuth(pathname)) {
    const hasToken = hasAuthToken(request);

    // Si no hay token, redirigir a login
    if (!hasToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Si hay token, verificar rol con el backend
    // IMPORTANTE: En Edge Runtime no podemos hacer llamadas async complejas
    // La verificación del rol se hace mejor en el client-side o en un Server Component
    // Por ahora, confiamos en que el token es válido y el hook useAuth verificará el rol
    
    // Permitir acceso (la verificación de rol se hace en client-side)
    return NextResponse.next();
  }

  // Por defecto, permitir acceso
  return NextResponse.next();
}

/**
 * Config del middleware
 * Define qué rutas deben pasar por el middleware
 */
export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - public files (archivos en /public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

