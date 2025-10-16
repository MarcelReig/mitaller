# Sistema de Autenticación - MiTaller.art

Sistema completo de autenticación con JWT para Next.js 15 + Django REST Framework.

## 📁 Archivos Creados

```
src/
├── lib/
│   └── axios.ts              # Cliente Axios con interceptores JWT
├── stores/
│   └── authStore.ts          # Zustand store de autenticación
├── hooks/
│   └── useAuth.ts            # Hook personalizado
└── types/
    └── user.ts               # Tipos TypeScript
```

## 🔑 Características

### Cliente Axios (`lib/axios.ts`)

**Interceptor de Request:**
- ✅ Añade `Authorization: Bearer {token}` automáticamente
- ✅ Configura `Content-Type: application/json`
- ✅ Lee token de cookies con js-cookie

**Interceptor de Response:**
- ✅ **401 Unauthorized**: Auto-refresh del token
  - Intenta refresh con `/api/v1/auth/token/refresh/`
  - Si éxito: actualiza token y reintenta request
  - Si falla: redirect a `/login` y limpia cookies
- ✅ **403 Forbidden**: Muestra toast de error
- ✅ **500 Server Error**: Muestra toast genérico
- ✅ **400 Bad Request**: Maneja errores de validación

**Helper Functions:**
```typescript
getToken()              // Lee access token
setToken(token)         // Guarda access token (1h)
removeToken()           // Elimina access token
getRefreshToken()       // Lee refresh token
setRefreshToken(token)  // Guarda refresh token (7d)
removeAllTokens()       // Limpia todo
```

### Store de Autenticación (`stores/authStore.ts`)

**Estado:**
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Acciones:**
```typescript
login(email, password)  // Login con JWT
logout()                // Logout y limpieza
register(userData)      // Registro de nuevo usuario
checkAuth()             // Verifica sesión al iniciar app
refreshUser()           // Re-fetch datos del usuario
```

**Persistencia:**
- ✅ `isAuthenticated` se guarda en localStorage
- ✅ Tokens se guardan en cookies (más seguro)

### Hook Personalizado (`hooks/useAuth.ts`)

Wrapper simple sobre el store:

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  isArtisan,
  isAdmin,
  canSell
} = useAuth();
```

### Tipos (`types/user.ts`)

```typescript
interface User {
  id: number;
  email: string;
  username: string;
  role: 'artisan' | 'admin' | 'customer';
  artist_profile?: ArtistProfile;
}
```

## 🚀 Uso

### 1. Verificar Sesión al Iniciar App

En tu `app/layout.tsx` o un componente de nivel superior:

```tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthProvider({ children }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth(); // Verifica si hay sesión activa
  }, []);

  return <>{children}</>;
}
```

### 2. Login

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      // Redirige automáticamente si es exitoso
    } catch (error) {
      // Error ya mostrado por toast
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

### 3. Registro

```tsx
import { useAuth } from '@/hooks/useAuth';

export function RegisterForm() {
  const { register, isLoading } = useAuth();

  const handleSubmit = async (data) => {
    try {
      await register({
        email: data.email,
        username: data.username,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
      });
      // Redirige a /login automáticamente
    } catch (error) {
      // Error ya mostrado
    }
  };

  return <form>...</form>;
}
```

### 4. Mostrar Usuario Autenticado

```tsx
import { useAuth } from '@/hooks/useAuth';

export function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <a href="/login">Iniciar Sesión</a>;
  }

  return (
    <div>
      <p>Hola, {user.username}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### 5. Proteger Rutas (Verificar Roles)

```tsx
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export function ArtisanDashboard() {
  const { isAuthenticated, isArtisan, canSell } = useAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  if (!isArtisan) {
    return <div>Solo artesanos pueden acceder</div>;
  }

  if (!canSell) {
    return <div>Tu cuenta aún no está aprobada para vender</div>;
  }

  return <div>Dashboard del Artesano</div>;
}
```

### 6. Llamadas a la API

```tsx
import axiosInstance from '@/lib/axios';

// El token se añade automáticamente
const fetchProducts = async () => {
  const response = await axiosInstance.get('/api/v1/shop/products/');
  return response.data;
};

const createProduct = async (data) => {
  const response = await axiosInstance.post('/api/v1/shop/products/', data);
  return response.data;
};
```

## 🔒 Seguridad

✅ **Tokens en Cookies** con `secure` y `sameSite: 'strict'`  
✅ **Auto-refresh** transparente cuando el token expira  
✅ **Logout automático** si refresh falla  
✅ **No persiste datos sensibles** en localStorage  
✅ **Manejo de errores** con toasts informativos  

## 🎯 Próximos Pasos

1. ✅ Sistema de autenticación completo
2. ⏳ Implementar páginas de login y registro
3. ⏳ Crear middleware de protección de rutas
4. ⏳ Agregar refresh automático en background
5. ⏳ Implementar "Remember Me" opcional

## 📝 Notas Importantes

- Los **access tokens** expiran en **1 hora**
- Los **refresh tokens** expiran en **7 días**
- Django debe tener configurado **CORS** para `localhost:3000`
- Los endpoints del backend deben coincidir:
  - `POST /api/v1/auth/token/` → Login
  - `POST /api/v1/auth/token/refresh/` → Refresh
  - `POST /api/v1/auth/register/` → Registro
  - `GET /api/v1/auth/me/` → Usuario actual
  - `POST /api/v1/auth/logout/` → Logout (opcional)

