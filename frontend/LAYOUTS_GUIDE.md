# Guía de Layouts - MiTaller.art

Sistema completo de layouts para Next.js 15 App Router con autenticación y roles.

## 📁 Estructura de Layouts

```
src/
├── app/
│   ├── layout.tsx                      # Root Layout (Server Component)
│   ├── (public)/
│   │   └── layout.tsx                  # Layout público (Navbar + Footer)
│   ├── (auth)/
│   │   └── layout.tsx                  # Layout auth (centrado, sin nav)
│   └── (dashboard)/
│       └── artesano/
│           └── layout.tsx              # Layout dashboard (Sidebar + protección)
│
└── components/
    └── providers/
        └── Providers.tsx               # Providers globales (Client Component)
```

## 🎯 1. Root Layout (`app/layout.tsx`)

**Type:** Server Component  
**Purpose:** Configuración global de la app

### Características

✅ **Server Component** con Metadata API  
✅ **Fuente Inter** de Google Fonts  
✅ **Metadata SEO completa**: title, description, openGraph, Twitter  
✅ **Providers globales**: React Query + Toaster  
✅ **HTML lang="es"**  
✅ **Importa globals.css**  

### Metadata Configurada

```typescript
title: {
  default: 'MiTaller.art - Marketplace de Artesanos de Menorca',
  template: '%s | MiTaller.art', // Para páginas anidadas
},
description: '...',
keywords: ['artesanos', 'Menorca', 'arte', ...],
openGraph: {
  type: 'website',
  locale: 'es_ES',
  title: '...',
  images: [{ url: '/og-image.png', width: 1200, height: 630 }],
},
twitter: {
  card: 'summary_large_image',
  creator: '@mitallerart',
},
```

### Estructura

```tsx
<html lang="es">
  <body>
    <Providers>
      {children} // Route groups aquí
    </Providers>
  </body>
</html>
```

## 🌐 2. Layout Público (`app/(public)/layout.tsx`)

**Type:** Server Component  
**Purpose:** Páginas accesibles para todos (home, artesanos, productos)

### Características

✅ **Navbar** con autenticación y carrito  
✅ **Footer** con links y redes sociales  
✅ **Contenido con max-width** responsive  
✅ **Sin restricciones** de acceso  

### Estructura

```tsx
<>
  <Navbar />
  <main className="flex-1 w-full">
    {children}
  </main>
  <Footer />
</>
```

### Rutas que usan este layout

- `/` - Home
- `/artesanos` - Directorio de artesanos
- `/artesanos/[slug]` - Perfil del artesano
- `/carrito` - Carrito de compras

## 🔐 3. Layout de Auth (`app/(auth)/layout.tsx`)

**Type:** Server Component  
**Purpose:** Páginas de autenticación (login, registro)

### Características

✅ **Sin Navbar ni Footer** (experiencia limpia)  
✅ **Centrado vertical y horizontal**  
✅ **Gradiente de fondo** sutil  
✅ **Logo superior** con link al home  
✅ **Card contenedor** con sombra  
✅ **Footer mínimo** con copyright  

### Estructura

```tsx
<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
  {/* Logo */}
  <Link href="/">
    <Palette /> MiTaller.art
  </Link>

  {/* Card */}
  <div className="max-w-md bg-card border rounded-lg shadow-lg p-8">
    {children}
  </div>

  {/* Footer */}
  <p className="text-muted-foreground">© 2025 MiTaller.art</p>
</div>
```

### Rutas que usan este layout

- `/login` - Iniciar sesión
- `/registro` - Crear cuenta

## 🎨 4. Layout Dashboard (`app/(dashboard)/artesano/layout.tsx`)

**Type:** Client Component (necesita hooks)  
**Purpose:** Dashboard del artesano con protección de rutas

### Características

✅ **Verifica autenticación** → redirect `/login` si no autenticado  
✅ **Verifica role='artisan'** → redirect `/` si no es artesano  
✅ **Loading state** mientras verifica auth  
✅ **Toast de aviso** si cuenta no aprobada  
✅ **Sidebar** con navegación del dashboard  
✅ **Layout 2 columnas**: Sidebar fijo | Contenido scroll  
✅ **Responsive**: Sidebar drawer en mobile  

### Protección de Rutas

```tsx
useEffect(() => {
  if (isLoading) return;

  if (!isAuthenticated) {
    toast.error('Debes iniciar sesión');
    router.push('/login');
    return;
  }

  if (!isArtisan) {
    toast.error('Solo artesanos pueden acceder');
    router.push('/');
    return;
  }

  if (!user.is_approved) {
    toast('Cuenta pendiente de aprobación', { icon: '⏳' });
  }
}, [isAuthenticated, isArtisan, isLoading]);
```

### Loading State

Muestra spinner mientras verifica auth:

```tsx
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
      <p>Verificando acceso...</p>
    </div>
  );
}
```

### Estructura

```tsx
<div className="flex min-h-screen">
  <Sidebar />
  <main className="flex-1 overflow-y-auto bg-muted/30">
    <div className="container mx-auto p-6 lg:p-8">
      {children}
    </div>
  </main>
</div>
```

### Rutas que usan este layout

- `/artesano` - Dashboard home
- `/artesano/portfolio` - Gestión de obras
- `/artesano/productos` - Gestión de productos
- `/artesano/ventas` - Historial de ventas
- `/artesano/configuracion` - Configuración

## 🎁 5. Providers Component (`components/providers/Providers.tsx`)

**Type:** Client Component  
**Purpose:** Envolver la app con providers necesarios

### Providers Incluidos

1. **QueryClientProvider** (React Query)
   ```typescript
   QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 60 * 1000, // 1 minuto
         retry: 1,
         refetchOnWindowFocus: false,
       },
     },
   })
   ```

2. **Toaster** (react-hot-toast)
   ```typescript
   <Toaster
     position="top-right"
     toastOptions={{
       duration: 4000,
       success: { duration: 3000 },
       error: { duration: 5000 },
     }}
   />
   ```

3. **AuthInitializer**
   ```typescript
   // Verifica auth al cargar la app
   useEffect(() => {
     checkAuth();
   }, []);
   ```

### Por qué Separar Providers

- **Root Layout debe ser Server Component** para metadata
- **Providers necesitan hooks** → Client Component
- **Separación de responsabilidades**

## 🎨 Estilos Globales

### Fuente

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

### CSS Variables (globals.css)

Tailwind 4 con CSS variables para temas:
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--muted`, `--accent`
- `--destructive`, `--border`
- Soporte para `.dark` mode

## 📊 Flujo de Autenticación

```mermaid
Usuario accede → Root Layout → Providers → checkAuth()
                                              ↓
                                    ¿Token válido?
                                    ↙            ↘
                                  Sí             No
                                  ↓              ↓
                    Carga datos usuario    No hace nada
                    Actualiza store
                    
Usuario intenta acceder a /artesano → Dashboard Layout
                                          ↓
                            Verifica isAuthenticated
                                    ↙            ↘
                                  Sí             No
                                  ↓              ↓
                      Verifica isArtisan    Redirect /login
                          ↙            ↘
                        Sí             No
                        ↓              ↓
                Muestra dashboard  Redirect /
```

## 🔄 Metadata en Páginas Anidadas

### Ejemplo: Página de Artesano

```tsx
// app/(public)/artesanos/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const artist = await fetchArtist(params.slug);
  
  return {
    title: artist.display_name,
    description: artist.bio,
    openGraph: {
      images: [artist.avatar],
    },
  };
}
```

El template del root layout genera:
```
"Juan Ceramista | MiTaller.art"
```

## 🚀 Ejemplos de Uso

### Crear Página Pública

```tsx
// app/(public)/artesanos/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directorio de Artesanos',
  description: 'Descubre artesanos de Menorca...',
};

export default function ArtesanosPage() {
  return <div>Lista de artesanos</div>;
}
```

### Crear Página de Auth

```tsx
// app/(auth)/login/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
};

export default function LoginPage() {
  return <LoginForm />;
}
```

### Crear Página de Dashboard

```tsx
// app/(dashboard)/artesano/productos/page.tsx
'use client';

export default function ProductosPage() {
  // Ya está protegida por el layout
  return <div>Gestión de productos</div>;
}
```

## 📱 Responsive Behavior

### Desktop (lg+)

- **Public**: Navbar horizontal, Footer grid 4 cols
- **Dashboard**: Sidebar fijo 256px, content scroll

### Mobile (<lg)

- **Public**: Navbar hamburguesa, Footer stack
- **Dashboard**: Sidebar drawer con overlay

## ✅ Ventajas de esta Arquitectura

1. **Separación de concerns**: Cada layout tiene un propósito claro
2. **Protección automática**: Dashboard verifica auth y rol
3. **SEO optimizado**: Server Components con metadata
4. **Performance**: Providers solo donde se necesitan
5. **Type-safe**: TypeScript estricto en todo
6. **Reusabilidad**: Componentes compartidos (Navbar, Footer, Sidebar)
7. **UX consistente**: Layouts coherentes entre secciones

## 🔜 Próximos Pasos

1. ✅ Layouts implementados
2. ⏳ Crear páginas que los usen
3. ⏳ Implementar formularios de auth
4. ⏳ Crear páginas del dashboard
5. ⏳ Añadir Suspense boundaries
6. ⏳ Implementar error boundaries

## 🐛 Debugging

### Verificar que layout se está usando

```tsx
// Temporal para debug
console.log('Layout activo:', pathname);
```

### Ver metadata generada

Inspeccionar `<head>` en DevTools o ver el HTML source.

### Verificar protección de rutas

1. Cerrar sesión
2. Intentar acceder `/artesano`
3. Debe redirigir a `/login` con toast

## 📝 Notas Importantes

- **Root layout DEBE ser Server Component** para metadata
- **Dashboard layout DEBE ser Client Component** para hooks
- **Route groups `(nombre)` no afectan la URL**
- **Metadata se hereda** y se puede sobrescribir
- **Providers se ejecutan UNA vez** al cargar la app

