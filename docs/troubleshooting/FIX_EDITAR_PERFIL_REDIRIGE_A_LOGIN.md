# Fix: "Editar Perfil" redirige a Login

## Fecha: 2025-10-23

## Problema
Al hacer click en "Editar perfil" desde el dropdown del header, redirige a `/login` en lugar de mostrar la página de perfil.

## Cambios Realizados

### 1. `DashboardHeader.tsx` - Cambiado `<a>` a `<Link>` ✅

**Problema**: El link usaba `<a href="/dashboard/perfil">` que causa una navegación completa de página (hard navigation), recargando todo el layout y perdiendo el estado de autenticación.

**Solución**: Usar el componente `Link` de Next.js para navegación client-side.

```tsx
// ANTES (MAL):
<a href="/dashboard/perfil" className="cursor-pointer">
  <User className="mr-2 h-4 w-4" />
  <span>Editar perfil</span>
</a>

// AHORA (BIEN):
<Link href="/dashboard/perfil" className="cursor-pointer flex items-center">
  <User className="mr-2 h-4 w-4" />
  <span>Editar perfil</span>
</Link>
```

### 2. `authStore.ts` - checkAuth() pone isLoading inmediatamente ✅

**Problema**: `checkAuth()` verificaba si había token antes de poner `isLoading: true`, causando una condición de carrera donde el layout redirigía prematuramente.

**Solución**: Poner `isLoading: true` INMEDIATAMENTE al inicio de `checkAuth()`.

```typescript
// ANTES (MAL):
checkAuth: async () => {
  const token = getToken();
  if (!token) {
    set({ user: null, isAuthenticated: false, isLoading: false });
    return;
  }
  set({ isLoading: true }); // Demasiado tarde!
  // ...
}

// AHORA (BIEN):
checkAuth: async () => {
  set({ isLoading: true }); // PRIMERO!
  const token = getToken();
  if (!token) {
    set({ user: null, isAuthenticated: false, isLoading: false });
    return;
  }
  // ...
}
```

### 3. Dashboard Layout - Simplificado ✅

**Problema**: Lógica compleja con múltiples useEffects causaba condiciones de carrera.

**Solución**: Simplificar la lógica de verificación.

```typescript
// Mostrar loader mientras verifica
if (isLoading) {
  return <Loader />;
}

// Redirigir si no autenticado (después de verificar)
if (!isAuthenticated || !user) {
  router.push('/login');
  return <Loader />;
}

// Renderizar dashboard con usuario autenticado
return <Dashboard user={user} />;
```

### 4. Todas las páginas del dashboard ahora son Client Components ✅

Convertidas a `'use client'`:
- `dashboard/page.tsx`
- `dashboard/perfil/page.tsx`
- `dashboard/pedidos/page.tsx`
- `dashboard/tienda/page.tsx`
- `dashboard/preview/page.tsx`

### 5. Middleware redirige a `/login` en lugar de `/` ✅

```typescript
// ANTES:
if (!hasToken) {
  const homeUrl = new URL('/', request.url);
  return NextResponse.redirect(homeUrl);
}

// AHORA:
if (!hasToken) {
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}
```

### 6. Página de Debug creada ✅

Nueva ruta: `/dashboard/debug-auth`

Muestra:
- Estado de autenticación (isAuthenticated, isLoading, user)
- Tokens JWT en cookies
- Botones para test de navegación
- Instrucciones de debugging

## Cómo Probar

### 1. Limpia todo y recarga
```bash
# En la consola del navegador (DevTools)
localStorage.clear();
location.reload();
```

### 2. Haz login
Ve a `/login` e inicia sesión con un usuario válido.

### 3. Verifica el dashboard
En `/dashboard` deberías ver:
- Tu email correcto en el dropdown (NO "artista@mitaller.art")
- El dashboard carga normalmente

### 4. Test: Click en "Editar perfil"

**Resultado esperado**:
- ✅ Navega a `/dashboard/perfil`
- ✅ Muestra tu información real
- ✅ NO redirige a login

**Logs esperados en consola**:
```
[DROPDOWN] Click en Editar perfil
[DROPDOWN] Usuario actual: tu_email@test.com
[DASHBOARD LAYOUT] Estado actualizado: { isAuthenticated: true, isLoading: false, hasUser: true }
```

### 5. Si sigue fallando: Página de Debug

Ve a: `http://localhost:3000/dashboard/debug-auth`

Esta página muestra:
- ✅ Estado de autenticación actual
- ✅ Tokens en cookies
- ✅ Usuario completo
- ✅ Botones para test de navegación

**Qué verificar**:
1. `isAuthenticated` debe ser **true**
2. `isLoading` debe ser **false**
3. `user` debe tener tus datos (no null)
4. Debe haber tokens en cookies (no "NO TOKEN")

Si alguno de estos falla, comparte lo que ves en la página de debug.

## Diagnóstico de Problemas

### Síntoma: Redirige a login inmediatamente

**Posibles causas**:
1. No hay token en cookies → Hacer login de nuevo
2. Token expirado → Hacer login de nuevo
3. `checkAuth()` no se ejecuta correctamente → Ver logs en consola

**Logs a buscar**:
```
[AUTH] checkAuth iniciado. Token presente: true/false
[AUTH] Token encontrado. Verificando sesión con backend...
[AUTH] Sesión válida. Usuario: email@example.com
```

Si no ves estos logs, `checkAuth()` no se está ejecutando.

### Síntoma: Muestra datos del usuario anterior

**Causa**: Datos hardcodeados o localStorage corrupto

**Solución**:
```javascript
// En consola del navegador
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
});
location.reload();
```

### Síntoma: Loader infinito

**Causa**: `isLoading` se queda en `true`

**Solución**: Ver logs de `[AUTH]` en consola. Si `checkAuth()` falla silenciosamente, revisar:
- Backend corriendo
- Token válido
- Endpoint `/api/v1/auth/profile/` funcionando

## Test Completo

```bash
# 1. Backend: Test de autenticación
cd backend
python test_auth_flow.py

# 2. Frontend: Limpiar y recargar
# En DevTools Console:
localStorage.clear(); location.reload();

# 3. Login con usuario de prueba
# Ir a /login y usar credenciales del test

# 4. Test navegación
# Click en "Editar perfil" en dropdown

# 5. Verificar página de perfil
# Debe mostrar tu información, no redirigir a login
```

## Archivos Modificados

### Frontend
1. ✅ `components/dashboard/DashboardHeader.tsx` - `<a>` → `<Link>`
2. ✅ `stores/authStore.ts` - `checkAuth()` mejorado
3. ✅ `app/(dashboard)/layout.tsx` - Lógica simplificada
4. ✅ `app/(dashboard)/dashboard/perfil/page.tsx` - Client Component
5. ✅ `app/(dashboard)/dashboard/page.tsx` - Client Component
6. ✅ `app/(dashboard)/dashboard/pedidos/page.tsx` - Client Component
7. ✅ `app/(dashboard)/dashboard/tienda/page.tsx` - Client Component
8. ✅ `app/(dashboard)/dashboard/preview/page.tsx` - Client Component
9. ✅ `app/(dashboard)/dashboard/debug-auth/page.tsx` - NUEVA página de debug
10. ✅ `middleware.ts` - Redirige a `/login`

### Backend
- Sin cambios (los cambios anteriores ya estaban aplicados)

## Próximos Pasos

Si después de estos cambios SIGUE fallando:

1. **Comparte la URL completa** de la página de debug:
   - Ve a `/dashboard/debug-auth`
   - Toma screenshot o copia los datos

2. **Comparte los logs de consola**:
   - Abre DevTools → Console
   - Filtra por `[AUTH]` y `[DASHBOARD]`
   - Copia todo lo que veas

3. **Verifica las cookies**:
   - DevTools → Application → Cookies
   - Busca `token` y `refresh_token`
   - ¿Están presentes? ¿Tienen valores?

Con esa información podré identificar exactamente qué está fallando.

## Causa Raíz

El problema era **doble**:

1. **Hard navigation** con `<a>` en lugar de `<Link>`:
   - Causaba recarga completa del layout
   - Perdía el estado de autenticación en memoria
   - Forzaba nuevo `checkAuth()` desde cero

2. **Condición de carrera en checkAuth()**:
   - `isLoading` se ponía en `true` demasiado tarde
   - Layout verificaba estado antes de que terminara `checkAuth()`
   - Redirigía prematuramente a login

Ambos problemas combinados causaban el redirect constante a login.

