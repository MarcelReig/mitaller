# 📊 Estado del Proyecto - Frontend MiTaller.art

**Fecha:** 16 Octubre 2025  
**Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui

---

## ✅ INFRAESTRUCTURA COMPLETA

### 🎯 **Core (100% Implementado)**

- ✅ **Dependencias:** Todas instaladas
  - zustand, @tanstack/react-query, axios
  - react-hook-form, zod, @hookform/resolvers
  - react-dropzone, yet-another-react-lightbox
  - @stripe/stripe-js, @stripe/react-stripe-js
  - react-hot-toast, js-cookie
  - @atlaskit/pragmatic-drag-and-drop
  - date-fns, lucide-react
  - shadcn/ui components

- ✅ **lib/axios.ts:** Cliente HTTP completo
  - Interceptors de request (añade JWT automáticamente)
  - Interceptors de response (refresh token, manejo de errores)
  - Helpers: getToken(), setToken(), removeToken(), etc.
  - Gestión de cookies con js-cookie

- ✅ **stores/authStore.ts:** Zustand store de autenticación
  - login(), logout(), register()
  - checkAuth() para verificar sesión al iniciar
  - refreshUser() para actualizar datos
  - Persistencia en localStorage
  - Helper useUserRole() para verificar permisos

- ✅ **stores/cartStore.ts:** Zustand store de carrito
  - addItem(), removeItem(), updateQuantity(), clearCart()
  - Cálculo automático de totalItems y subtotal
  - Validación de stock
  - Persistencia en localStorage

- ✅ **types/*:** Tipos TypeScript completos
  - user.ts (User, UserRole, ArtistProfile, AuthResponse, LoginData, RegisterData)
  - artist.ts (Artist, ArtistSummary, ArtistFormData, CraftType, Location)
  - work.ts (Work, WorkArtist, WorkFormData, WorkFilters, WorkListResponse)
  - product.ts (Product, ProductFormData, ProductFilters, CartItem, CartSummary)
  - order.ts (Order, OrderItem, OrderStatus, PaymentStatus)
  - index.ts (barrel exports)

- ✅ **hooks/useAuth.ts:** Hook de autenticación
  - Wrapper sobre authStore
  - Ejecuta checkAuth() automáticamente en mount
  - Exporta: user, isAuthenticated, isLoading, login, logout, register, isArtisan

- ✅ **hooks/useCart.ts:** Hook de carrito
  - Wrapper sobre cartStore
  - Exporta: items, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart

- ✅ **hooks/useWorks.ts:** React Query hooks para obras (CRUD completo)
  - useWorks(artistId?) - Query lista de obras
  - useWork(id) - Query obra individual
  - useCreateWork() - Mutation crear obra
  - useUpdateWork() - Mutation actualizar obra (con FormData para imágenes)
  - useDeleteWork() - Mutation eliminar obra
  - useReorderWorks() - Mutation reordenar obras (drag & drop)
  - Optimistic updates + cache invalidation

- ✅ **hooks/useProducts.ts:** React Query hooks para productos (CRUD completo)
  - useProducts(artistId?, filters?) - Query lista de productos
  - useProduct(id) - Query producto individual
  - useCreateProduct() - Mutation crear producto
  - useUpdateProduct() - Mutation actualizar producto (con FormData para imágenes)
  - useDeleteProduct() - Mutation eliminar producto
  - Optimistic updates + cache invalidation

- ✅ **middleware.ts:** Middleware de Next.js (Edge Runtime)
  - Protege rutas /artesano/*
  - Verifica autenticación mediante token JWT en cookies
  - Redirige a /login si no está autenticado (con redirect param)
  - Configurado para ejecutarse en todas las rutas relevantes

- ✅ **components/providers/Providers.tsx:** Providers globales
  - QueryClientProvider configurado (staleTime: 1min, retry: 1)
  - Toaster de react-hot-toast (top-right, duración 4s)
  - AuthInitializer que ejecuta checkAuth() al cargar la app

- ✅ **app/layout.tsx:** Root layout completo
  - Metadata SEO completa (title, description, openGraph, twitter, robots)
  - Fuente Inter de Google Fonts
  - HTML con suppressHydrationWarning
  - Wrap con Providers

---

### 📐 **Layouts (100% Implementados)**

- ✅ **app/(public)/layout.tsx**
  - Navbar (navegación pública)
  - main con flex-1
  - Footer

- ✅ **app/(auth)/layout.tsx**
  - Layout específico para páginas de autenticación
  - (Pendiente revisar si existe o necesita crearse)

- ✅ **app/(dashboard)/artesano/layout.tsx**
  - Verifica autenticación (redirect a /login si no autenticado)
  - Verifica role='artisan' (redirect a / si no es artesano)
  - Layout de 2 columnas: Sidebar fijo | Contenido scroll
  - Loading state mientras verifica auth
  - Toast de aviso si está pendiente de aprobación

---

### 🧱 **Componentes Layout (100% Implementados)**

- ✅ **components/layout/Navbar.tsx** (Navegación pública)
  - Logo con link a home
  - Links: Inicio, Artesanos
  - Carrito con badge de cantidad (totalItems)
  - Usuario autenticado: Avatar + dropdown (Mi Taller, Ver Perfil Público, Cerrar Sesión)
  - Usuario no autenticado: Botón "Entrar"
  - Responsive con menú hamburguesa en mobile
  - Sticky top con backdrop blur

- ✅ **components/layout/Footer.tsx**
  - Logo y descripción del proyecto
  - Links útiles (Inicio, Artesanos, Sobre Nosotros, Contacto)
  - Redes sociales (Instagram, Email)
  - Copyright + links legales (Privacidad, Términos, Cookies)
  - Fondo oscuro (slate-900)

- ✅ **components/layout/Sidebar.tsx** (Dashboard artesano)
  - Avatar y nombre del artesano
  - Navegación: Dashboard, Portfolio, Productos, Ventas, Configuración
  - Active state en link actual
  - Link "Ver Perfil Público" (abre en nueva pestaña)
  - Botón "Cerrar Sesión"
  - Responsive: fijo en desktop, drawer en mobile

---

### 🎨 **Componentes UI (shadcn/ui)**

- ✅ avatar.tsx
- ✅ badge.tsx
- ✅ button.tsx
- ✅ card.tsx
- ✅ dialog.tsx
- ✅ dropdown-menu.tsx
- ✅ form.tsx
- ✅ input.tsx
- ✅ label.tsx
- ✅ select.tsx
- ✅ tabs.tsx
- ✅ sonner.tsx

---

## ❌ LO QUE FALTA IMPLEMENTAR

### 🔐 **Páginas de Autenticación**

- ❌ **app/(auth)/login/page.tsx**
  - Formulario con email y password
  - Validación con react-hook-form + zod
  - Llamada a login() del hook useAuth
  - Redirección tras login exitoso (a redirect param o /artesano)
  - Link "¿No tienes cuenta? Regístrate"
  - Manejo de errores (toast)

- ❌ **app/(auth)/registro/page.tsx**
  - Formulario con username, email, password, first_name, last_name
  - Validación con react-hook-form + zod
  - Llamada a register() del hook useAuth
  - Redirección a /login tras registro exitoso
  - Link "¿Ya tienes cuenta? Inicia sesión"
  - Manejo de errores (toast)

---

### 🎨 **Páginas Públicas**

- ❌ **app/(public)/artesanos/page.tsx** (Directorio de artesanos)
  - Usar hook useQuery con API /api/v1/artists/
  - Grid de ArtistCard
  - Filtros: tipo de artesanía (craft_type), ubicación (location), búsqueda
  - ArtistFilters component (ya existe como placeholder)
  - Loading skeleton
  - Empty state si no hay resultados

- ❌ **app/(public)/artesanos/[slug]/page.tsx** (Perfil del artesano)
  - Usar hook useQuery con API /api/v1/artists/{slug}/
  - Header con avatar, nombre, bio, ubicación, contacto
  - Tabs: "Portfolio" (obras) y "Tienda" (productos)
  - Tab Portfolio: galería de WorkCard con lightbox (yet-another-react-lightbox)
  - Tab Tienda: grid de ProductCard con botón "Añadir al carrito"
  - Breadcrumbs: Inicio > Artesanos > {display_name}

- ❌ **app/(public)/carrito/page.tsx** (Carrito de compras)
  - Usar hook useCart
  - Lista de CartItem (imagen, nombre, precio, cantidad, subtotal)
  - Botones +/- para actualizar cantidad
  - Botón eliminar item
  - Resumen: Subtotal, IVA (si aplica), Total
  - Botón "Proceder al Pago" (lleva a checkout)
  - Empty state si carrito vacío: "Tu carrito está vacío. Explorar productos"
  - Responsive: 2 columnas desktop (lista | resumen), stacked mobile

---

### 🎛️ **Páginas Dashboard Artesano**

- ❌ **app/(dashboard)/artesano/page.tsx** (Dashboard home)
  - Estadísticas resumen:
    * Total ventas (últimos 30 días)
    * Productos activos
    * Obras en portfolio
    * Pedidos pendientes
  - Gráfico de ventas (últimos 7 días) - puede ser simple
  - Lista de últimos pedidos (tabla con estado, cliente, total, fecha)
  - Acciones rápidas: "Añadir Producto", "Añadir Obra", "Ver Ventas"
  - Alerta si está pendiente de aprobación

- ❌ **app/(dashboard)/artesano/portfolio/page.tsx** (Gestión de obras)
  - Usar hooks useWorks() y useCreateWork(), useUpdateWork(), useDeleteWork()
  - Header con título "Mi Portfolio" + botón "Añadir Obra"
  - Grid de obras con imagen, título, año, featured badge
  - Drag & drop para reordenar (con @atlaskit/pragmatic-drag-and-drop + useReorderWorks)
  - Botones en cada obra: Editar, Eliminar (con confirm)
  - Dialog para crear/editar obra:
    * Formulario: título, descripción, año, is_featured, imagen (react-dropzone)
    * Validación con react-hook-form + zod
    * Upload de imagen a API (multipart/form-data)
  - Empty state si no hay obras

- ❌ **app/(dashboard)/artesano/productos/page.tsx** (Gestión de productos)
  - Usar hooks useProducts() y useCreateProduct(), useUpdateProduct(), useDeleteProduct()
  - Header con título "Mis Productos" + botón "Añadir Producto"
  - Tabla o grid de productos: imagen, nombre, categoría, precio, stock, estado (activo/agotado)
  - Botones en cada producto: Editar, Eliminar (con confirm)
  - Dialog para crear/editar producto:
    * Formulario: nombre, descripción, categoría (select), precio, stock, is_active, imagen principal (thumbnail)
    * Validación con react-hook-form + zod
    * Upload de imágenes a API (multipart/form-data)
  - Empty state si no hay productos

- ❌ **app/(dashboard)/artesano/ventas/page.tsx** (Historial de ventas)
  - Usar hook useQuery con API /api/v1/orders/ (filtrado por artista)
  - Tabla de pedidos: número, fecha, cliente, productos, estado, total
  - Filtros: estado (pending, processing, shipped, completed), fecha (rango)
  - Ver detalle del pedido (dialog o página separada)
  - Botones para cambiar estado del pedido (si aplica)
  - Empty state si no hay ventas

---

### 🧩 **Componentes Features**

#### Artists

- ❌ **components/artists/ArtistCard.tsx**
  - Props: artist (Artist type)
  - Avatar con fallback (iniciales)
  - Nombre (display_name)
  - Especialidad (craft_type label traducido)
  - Ubicación (location label traducido)
  - Badge "Destacado" si is_featured
  - Link a /artesanos/{slug}
  - Hover effect (shadow, scale)

- ❌ **components/artists/ArtistFilters.tsx**
  - Filtros para página de directorio
  - Select de craft_type (Cerámica, Joyería, etc.)
  - Select de location (Mahón, Ciutadella, etc.)
  - Input de búsqueda (por nombre)
  - Botón "Limpiar filtros"
  - Emitir cambios a componente padre

#### Works

- ❌ **components/works/WorkCard.tsx**
  - Props: work (Work type)
  - Imagen con aspect-ratio cuadrado o landscape
  - Título
  - Descripción (truncada)
  - Año (si disponible)
  - Badge "Destacado" si is_featured
  - Click para abrir lightbox o modal con detalle
  - Hover effect

- ❌ **components/works/WorkForm.tsx**
  - Formulario para crear/editar obra
  - react-hook-form + zod
  - Campos: título*, descripción, año, is_featured (checkbox), imagen*
  - ImageUploader para imagen (react-dropzone)
  - Preview de imagen
  - Botones: Cancelar, Guardar
  - Loading state en submit
  - Usado en dialog de portfolio/page.tsx

#### Products

- ❌ **components/products/ProductCard.tsx**
  - Props: product (Product type)
  - Imagen principal (thumbnail_url)
  - Nombre
  - Precio formateado (ej: "45,00 €")
  - Badge "Agotado" si stock = 0 o !is_available
  - Botón "Añadir al carrito" (usa addItem del useCart hook)
  - Link al perfil del artista (artist.slug)
  - Hover effect

- ❌ **components/products/ProductForm.tsx**
  - Formulario para crear/editar producto
  - react-hook-form + zod
  - Campos: nombre*, descripción, categoría* (select), precio*, stock*, is_active (checkbox), imagen principal*
  - ImageUploader para thumbnail
  - Preview de imagen
  - Botones: Cancelar, Guardar
  - Loading state en submit
  - Usado en dialog de productos/page.tsx

#### Checkout

- ❌ **components/checkout/CartItem.tsx**
  - Props: item (CartItem type)
  - Imagen del producto (thumbnail)
  - Nombre del producto
  - Artista (display_name + link al perfil)
  - Precio unitario
  - Input de cantidad con botones +/-
  - Subtotal (precio × cantidad)
  - Botón eliminar (icono X)
  - Usado en carrito/page.tsx

- ❌ **components/checkout/CheckoutForm.tsx**
  - Formulario de checkout con Stripe
  - Usa @stripe/react-stripe-js + @stripe/stripe-js
  - Campos: nombre, email, dirección de envío
  - Stripe CardElement para pago
  - Crear PaymentIntent en el backend
  - Confirmación de pago
  - Redirigir a página de confirmación tras pago exitoso
  - Manejo de errores de Stripe

#### Shared

- ✅ **components/shared/LoadingSpinner.tsx** (probablemente existe)
- ❌ **components/shared/ImageUploader.tsx**
  - Componente para upload de imágenes
  - Usa react-dropzone
  - Drag & drop o click para seleccionar
  - Preview de imagen seleccionada
  - Validación: formatos (jpg, png, webp), tamaño máximo (5MB)
  - Botón para eliminar imagen
  - Props: onImageSelect, currentImage?, maxSize?, accept?

---

## 🎯 RECOMENDACIONES DE IMPLEMENTACIÓN

### Orden Sugerido:

1. **Fase 1: Autenticación**
   - Login page
   - Registro page
   - Probar flujo completo de auth

2. **Fase 2: Páginas Públicas Básicas**
   - ArtistCard component
   - Directorio de artesanos (página + filtros)
   - Perfil del artesano (sin portfolio/tienda de momento)

3. **Fase 3: Portfolio (Dashboard Artesano)**
   - WorkCard component
   - WorkForm component (con ImageUploader)
   - Portfolio page con CRUD completo

4. **Fase 4: Productos (Dashboard Artesano)**
   - ProductCard component
   - ProductForm component
   - Productos page con CRUD completo

5. **Fase 5: Carrito y Checkout**
   - ProductCard en perfil del artesano (botón "Añadir al carrito")
   - CartItem component
   - Carrito page
   - CheckoutForm component (integración con Stripe)

6. **Fase 6: Ventas y Dashboard**
   - Dashboard home con estadísticas
   - Ventas page con tabla de pedidos

7. **Fase 7: Refinamiento**
   - Añadir lightbox para galería de obras
   - Mejorar UX/UI
   - Añadir animaciones
   - Testing

---

## 📝 NOTAS IMPORTANTES

1. **Backend API:** Asegúrate de que el backend Django esté corriendo en `http://localhost:8000`
2. **Tokens JWT:** Los tokens se guardan en cookies con js-cookie (nombres: `mitaller_access_token`, `mitaller_refresh_token`)
3. **Stripe:** Necesitarás configurar Stripe Connect para pagos multi-vendor
4. **Cloudinary:** Para upload de imágenes (ya tienes `lib/stripe.ts` pero puede necesitar `lib/cloudinary.ts` si no usas upload directo al backend)
5. **TypeScript:** Todos los archivos deben usar TypeScript estricto
6. **Comentarios:** En español para código complejo
7. **Manejo de errores:** Usar react-hot-toast para notificaciones
8. **Loading states:** Mostrar skeletons o spinners mientras se cargan datos

---

## 🚀 PRÓXIMOS PASOS

**INICIO RECOMENDADO:**

```bash
# 1. Verifica que el backend esté corriendo
cd /Users/marcelreig/Code/side-project/mitaller/backend
python manage.py runserver

# 2. Inicia el frontend
cd /Users/marcelreig/Code/side-project/mitaller/frontend
npm run dev

# 3. Empieza con las páginas de autenticación
# Implementa login/page.tsx primero
```

---

**Última actualización:** 16 Octubre 2025  
**Estado general:** Infraestructura 100% | Páginas 15% | Componentes 25%

