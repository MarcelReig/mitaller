# Guía de API de Autenticación JWT

Sistema completo de autenticación con JWT para MiTaller marketplace.

## Endpoints Disponibles

### 1. Registro de Usuario (Artesano)

**POST** `/api/v1/auth/register/`

Registra un nuevo artesano. Por defecto, los artesanos se crean con `is_approved=False` y necesitan aprobación manual de un admin antes de poder vender.

**Request Body:**
```json
{
  "email": "artesano@example.com",
  "username": "mi-taller",
  "password": "password123",
  "password_confirm": "password123",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```

**Validaciones:**
- `email`: Único, formato válido
- `username`: Único, solo letras, números, guiones y guiones bajos (slug-friendly)
- `password`: Mínimo 8 caracteres, al menos 1 letra y 1 número
- `password_confirm`: Debe coincidir con password
- `first_name` y `last_name`: Requeridos

**Response (201 Created):**
```json
{
  "message": "Registro exitoso. Tu cuenta está pendiente de aprobación. Recibirás un email cuando puedas comenzar a vender.",
  "user": {
    "id": 1,
    "email": "artesano@example.com",
    "username": "mi-taller",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "artisan",
    "is_approved": false,
    "is_active": true,
    "can_sell": false,
    "date_joined": "2025-10-12T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Error en el registro.",
  "errors": {
    "email": ["Ya existe un usuario registrado con este email."],
    "username": ["Este nombre de usuario ya está en uso."]
  }
}
```

---

### 2. Login

**POST** `/api/v1/auth/login/`

Autentica usuario con email y password. Retorna tokens JWT y datos del usuario.

**Request Body:**
```json
{
  "email": "artesano@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login exitoso.",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "artesano@example.com",
    "username": "mi-taller",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "artisan",
    "is_approved": true,
    "is_active": true,
    "can_sell": true,
    "date_joined": "2025-10-12T10:30:00Z"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Error en el login.",
  "errors": {
    "detail": "No se encontraron credenciales de autenticación válidas."
  }
}
```

---

### 3. Refresh Token

**POST** `/api/v1/auth/token/refresh/`

Obtiene un nuevo access token usando el refresh token.

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Nota:** Con `ROTATE_REFRESH_TOKENS=True`, también retorna un nuevo refresh token.

---

### 4. Logout

**POST** `/api/v1/auth/logout/`

Invalida el refresh token (blacklist).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (205 Reset Content):**
```json
{
  "message": "Sesión cerrada exitosamente."
}
```

---

### 5. Ver/Actualizar Perfil

**GET** `/api/v1/auth/profile/`

Obtiene datos del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "artesano@example.com",
  "username": "mi-taller",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "artisan",
  "is_approved": true,
  "is_active": true,
  "can_sell": true,
  "date_joined": "2025-10-12T10:30:00Z"
}
```

---

**PUT/PATCH** `/api/v1/auth/profile/`

Actualiza datos del usuario. Solo permite modificar `first_name` y `last_name`.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "first_name": "Juan Carlos",
  "last_name": "Pérez García"
}
```

**Response (200 OK):**
```json
{
  "message": "Perfil actualizado exitosamente.",
  "user": {
    "id": 1,
    "email": "artesano@example.com",
    "username": "mi-taller",
    "first_name": "Juan Carlos",
    "last_name": "Pérez García",
    "role": "artisan",
    "is_approved": true,
    "is_active": true,
    "can_sell": true,
    "date_joined": "2025-10-12T10:30:00Z"
  }
}
```

---

### 6. Verificar Token

**POST** `/api/v1/auth/token/verify/`

Verifica si un token es válido.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

## Flujo de Autenticación

### 1. Registro de Artesano

```
Usuario → POST /register/ → Backend crea User con:
                                - role = ARTISAN
                                - is_approved = False
                                - can_sell = False
                                
Admin → Aprueba en Django Admin → is_approved = True
                                 → can_sell = True
```

### 2. Login y Uso de Tokens

```
1. Login:
   POST /login/ con email + password
   → Retorna access_token (1h) + refresh_token (7d) + user data

2. Hacer Requests Autenticados:
   GET /profile/
   Headers: Authorization: Bearer <access_token>
   → Si token válido: retorna data
   → Si token expirado: 401 Unauthorized

3. Refresh Token:
   POST /token/refresh/ con refresh_token
   → Retorna nuevo access_token + nuevo refresh_token

4. Logout:
   POST /logout/ con refresh_token
   → Blacklist el refresh_token (ya no se puede usar)
```

---

## Configuración JWT (settings.py)

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),      # Access token expira en 1h
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),      # Refresh token expira en 7d
    'ROTATE_REFRESH_TOKENS': True,                    # Genera nuevo refresh en cada refresh
    'BLACKLIST_AFTER_ROTATION': True,                 # Blacklist token antiguo
    'UPDATE_LAST_LOGIN': True,                        # Actualiza last_login
    'AUTH_HEADER_TYPES': ('Bearer',),                 # Header: Bearer <token>
}
```

---

## Roles y Permisos

### UserRole.ARTISAN
- Puede registrarse vía API
- Empieza con `is_approved=False`
- No puede vender hasta aprobación (`can_sell=False`)
- Después de aprobación: `can_sell=True`

### UserRole.ADMIN
- Solo se crea con `createsuperuser`
- Siempre `is_approved=True`
- Siempre `can_sell=True`
- Puede aprobar artesanos en Django Admin

---

## Ejemplos de Uso con cURL

### Registro
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artesano@example.com",
    "username": "mi-taller",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "Juan",
    "last_name": "Pérez"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artesano@example.com",
    "password": "password123"
  }'
```

### Ver Perfil
```bash
curl -X GET http://localhost:8000/api/v1/auth/profile/ \
  -H "Authorization: Bearer <access_token>"
```

### Actualizar Perfil
```bash
curl -X PATCH http://localhost:8000/api/v1/auth/profile/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan Carlos"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "<refresh_token>"
  }'
```

### Logout
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "<refresh_token>"
  }'
```

---

## Manejo de Errores

Todos los endpoints retornan errores en formato consistente:

```json
{
  "message": "Descripción del error en español",
  "errors": {
    "campo": ["Mensaje de error específico"]
  }
}
```

Códigos HTTP usados:
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado
- `205 Reset Content`: Logout exitoso
- `400 Bad Request`: Validación fallida
- `401 Unauthorized`: No autenticado o credenciales inválidas
- `403 Forbidden`: No tiene permisos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Seguridad

1. **Passwords**: 
   - Hasheados con `set_password()` (PBKDF2)
   - Validación: mín 8 chars, 1 letra, 1 número

2. **Tokens**:
   - Access token: 1 hora (para requests)
   - Refresh token: 7 días (para obtener nuevos access)
   - Blacklist después de logout

3. **CORS**:
   - Configurado en settings con origins permitidos
   - Credentials enabled

4. **Aprobación Manual**:
   - Artesanos no pueden vender hasta aprobación
   - Previene cuentas fraudulentas

---

## Frontend Integration (Next.js)

### Ejemplo con Zustand Store

```typescript
// stores/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '@/lib/axios';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'artisan' | 'admin';
  is_approved: boolean;
  can_sell: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      login: async (email, password) => {
        const { data } = await axios.post('/api/v1/auth/login/', {
          email,
          password
        });
        
        set({
          user: data.user,
          accessToken: data.access,
          refreshToken: data.refresh
        });
      },
      
      logout: async () => {
        const { refreshToken } = get();
        
        if (refreshToken) {
          await axios.post('/api/v1/auth/logout/', {
            refresh: refreshToken
          });
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null
        });
      },
      
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) throw new Error('No refresh token');
        
        const { data } = await axios.post('/api/v1/auth/token/refresh/', {
          refresh: refreshToken
        });
        
        set({
          accessToken: data.access,
          refreshToken: data.refresh
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
```

### Axios Interceptor para Refresh Automático

```typescript
// lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Request interceptor: añadir token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si 401 y no hemos reintentado, hacer refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshAccessToken();
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falló, logout
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## Testing

### Crear Usuario de Prueba

```bash
cd backend
python manage.py shell
```

```python
from accounts.models import User, UserRole

# Crear artesano no aprobado
artisan = User.objects.create_user(
    email='artesano@test.com',
    username='artesano-test',
    password='test1234',
    first_name='Test',
    last_name='Artisan',
    role=UserRole.ARTISAN,
    is_approved=False
)

# Crear artesano aprobado
approved = User.objects.create_user(
    email='approved@test.com',
    username='approved-test',
    password='test1234',
    first_name='Approved',
    last_name='Artisan',
    role=UserRole.ARTISAN,
    is_approved=True
)

# Crear admin
admin = User.objects.create_superuser(
    email='admin@test.com',
    username='admin',
    password='admin1234'
)
```

---

## Próximos Pasos

1. **Email Notifications**: Enviar emails cuando un artesano es aprobado
2. **Password Reset**: Endpoints para recuperación de contraseña
3. **Email Verification**: Verificar email después de registro
4. **Rate Limiting**: Limitar intentos de login
5. **OAuth**: Login con Google/Facebook
6. **2FA**: Autenticación de dos factores para admins

