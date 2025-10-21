# Sistema de Autenticación JWT - Resumen de Implementación

## ✅ Archivos Creados

### 1. `accounts/serializers.py` (299 líneas)

#### RegisterSerializer
- Campos: email, username, password, password_confirm, first_name, last_name
- **Validaciones:**
  - `email`: único, formato válido, mensaje custom si existe
  - `username`: único, slug-friendly (solo letras, números, `-`, `_`)
  - `password`: mínimo 8 caracteres, al menos 1 letra y 1 número
  - `password_confirm`: debe coincidir con password
  - `first_name` y `last_name`: requeridos
- **Método create():**
  - Crea user con `role=ARTISAN`
  - `is_approved=False` (necesita aprobación manual)
  - Usa `set_password()` para hashear
  - NO guarda `password_confirm` en BD
- **to_representation():** retorna UserSerializer (sin password)

#### UserSerializer
- Campos: id, email, username, first_name, last_name, role, is_approved, is_active, can_sell, date_joined
- **read_only_fields:** id, role, is_approved, can_sell, date_joined
- **can_sell:** SerializerMethodField que usa la property del model

#### CustomTokenObtainPairSerializer
- Hereda de TokenObtainPairSerializer
- Personaliza `validate()` para agregar datos del user a la respuesta
- Retorna: access, refresh + user data completo

#### LoginSerializer (alternativa simple)
- Campos: email, password
- Valida credenciales con `authenticate()`
- Verifica `is_active`
- Mensajes de error descriptivos en español

---

### 2. `accounts/views.py` (212 líneas)

#### RegisterView (APIView)
- **POST** `/api/v1/auth/register/`
- Permission: `AllowAny`
- Usa `RegisterSerializer`
- Response 201: user data + mensaje de aprobación pendiente
- Response 400: errores de validación

#### CustomTokenObtainPairView (TokenObtainPairView)
- **POST** `/api/v1/auth/login/`
- Usa `CustomTokenObtainPairSerializer`
- Retorna: access, refresh, user data
- Response 200: login exitoso
- Response 401: credenciales inválidas

#### UserProfileView (RetrieveUpdateAPIView)
- **GET/PUT/PATCH** `/api/v1/auth/profile/`
- Permission: `IsAuthenticated`
- Usa `UserSerializer`
- `get_object()` retorna `request.user`
- Solo permite actualizar: first_name, last_name
- Campos como email, role, is_approved son read-only

#### LogoutView (APIView)
- **POST** `/api/v1/auth/logout/`
- Permission: `IsAuthenticated`
- Blacklist del refresh token
- Requiere `rest_framework_simplejwt.token_blacklist` en INSTALLED_APPS
- Response 205: logout exitoso
- Response 400: token inválido o no proporcionado

---

### 3. `accounts/urls.py` (28 líneas)

Rutas configuradas:
```python
/api/v1/auth/register/         → RegisterView
/api/v1/auth/login/            → CustomTokenObtainPairView
/api/v1/auth/token/refresh/    → TokenRefreshView (simplejwt)
/api/v1/auth/logout/           → LogoutView
/api/v1/auth/profile/          → UserProfileView
```

---

### 4. `config/urls.py` (ACTUALIZADO)

Agregado:
```python
path('api/v1/auth/', include('accounts.urls'))
```

Mantenido:
```python
path('api/v1/auth/token/verify/', TokenVerifyView.as_view())
```

---

### 5. `config/settings.py` (ACTUALIZADO)

Agregado a INSTALLED_APPS:
```python
'rest_framework_simplejwt.token_blacklist',  # Para logout con blacklist
```

Configuración JWT ya existente:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}
```

---

### 6. Documentación

#### `accounts/AUTH_API_GUIDE.md` (500+ líneas)
- Documentación completa de todos los endpoints
- Request/Response examples en JSON
- Ejemplos con cURL
- Integración con Next.js (Zustand + Axios interceptors)
- Códigos de estado HTTP
- Flujo de autenticación explicado
- Configuración JWT
- Testing con Django shell

#### `accounts/IMPLEMENTATION_SUMMARY.md` (este archivo)
- Resumen técnico de la implementación
- Estructura de archivos
- Decisiones de diseño

---

## 🔒 Estructura y Flujo de Autenticación

### 1. Registro de Artesano

```
Cliente → POST /register/
          {email, username, password, password_confirm, first_name, last_name}

Backend → RegisterSerializer valida datos
       → Crea User con role=ARTISAN, is_approved=False
       → Hashea password con set_password()

Cliente ← 201 Created
          {message, user: {id, email, ..., can_sell: false}}
```

**Resultado:**
- Usuario creado pero NO puede vender (`can_sell=False`)
- Necesita aprobación manual de admin en Django Admin
- Admin cambia `is_approved=True` → `can_sell=True`

---

### 2. Login

```
Cliente → POST /login/
          {email, password}

Backend → CustomTokenObtainPairSerializer
       → Valida credenciales con authenticate()
       → Genera access_token (1h) y refresh_token (7d)
       → Serializa user data con UserSerializer

Cliente ← 200 OK
          {
            access: "eyJ...",
            refresh: "eyJ...",
            user: {id, email, username, ..., role, can_sell}
          }
```

**Resultado:**
- Cliente guarda tokens en localStorage/sessionStorage/Zustand
- Access token para requests autenticados
- Refresh token para obtener nuevos access tokens

---

### 3. Requests Autenticados

```
Cliente → GET /profile/
          Headers: {Authorization: "Bearer <access_token>"}

Backend → JWTAuthentication (middleware de DRF)
       → Valida token signature y expiration
       → Decodifica user_id del token
       → Carga user desde BD
       → Asigna request.user

View    → IsAuthenticated permission check
       → UserProfileView.get_object() → request.user
       → UserSerializer(request.user)

Cliente ← 200 OK
          {id, email, username, ..., can_sell}
```

---

### 4. Token Expiration & Refresh

```
Escenario: Access token expirado (después de 1h)

Cliente → GET /profile/
          Headers: {Authorization: "Bearer <expired_access>"}

Backend → JWTAuthentication
       → Token signature válido pero expirado

Cliente ← 401 Unauthorized
          {detail: "Token is invalid or expired"}

Cliente → POST /token/refresh/
          {refresh: "<refresh_token>"}

Backend → TokenRefreshView
       → Valida refresh token (válido por 7 días)
       → Genera nuevo access token
       → Con ROTATE_REFRESH_TOKENS=True, también nuevo refresh
       → Con BLACKLIST_AFTER_ROTATION=True, blacklist old refresh

Cliente ← 200 OK
          {access: "eyJ...", refresh: "eyJ..."}

Cliente → Retry original request con nuevo access token
```

**Implementación en Frontend:**
```typescript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      await refreshAccessToken();
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

### 5. Logout

```
Cliente → POST /logout/
          Headers: {Authorization: "Bearer <access_token>"}
          {refresh: "<refresh_token>"}

Backend → IsAuthenticated permission check
       → LogoutView
       → RefreshToken(refresh_token).blacklist()
       → Guarda en tabla token_blacklist_blacklistedtoken

Cliente ← 205 Reset Content
          {message: "Sesión cerrada exitosamente"}

Cliente → Limpia tokens de localStorage/Zustand
       → Redirect a /login
```

**Después de logout:**
- ✅ Access token sigue técnicamente válido (hasta que expire)
- ❌ Refresh token en blacklist (no se puede usar para renovar)
- ❌ Cuando access expira, no se puede obtener nuevo access
- ✅ Backend no tiene "sesiones activas" que invalidar (stateless JWT)

**Nota de Seguridad:**
JWT es stateless por diseño. El access token sigue válido hasta que expire naturalmente. Para invalidación inmediata, necesitarías:
- Blacklist de access tokens (costoso en BD)
- O expiration muy corto (mal UX)
- O arquitectura híbrida (JWT + session storage)

---

### 6. Aprobación de Artesanos

```
Admin → Django Admin → Users
     → Selecciona artesano pendiente
     → Marca checkbox "is_approved"
     → Save

Backend → User.save()
       → Triggers @property can_sell
       → can_sell = (is_artisan and is_approved) or is_admin
       → True para este artesano

Artesano → Login nuevamente
        ← user.can_sell = true
```

**Frontend puede:**
```typescript
if (!user.can_sell) {
  // Mostrar: "Tu cuenta está pendiente de aprobación"
  // Deshabilitar: crear productos, publicar obras
}

if (user.can_sell) {
  // Permitir: crear productos, gestionar inventario, ver ventas
}
```

---

## 🎯 Características Implementadas

### ✅ Seguridad
- [x] Contraseñas hasheadas con PBKDF2 (Django default)
- [x] Validación robusta de passwords (mínimo 8 chars, 1 letra, 1 número)
- [x] Username slug-friendly (previene URLs problemáticas)
- [x] JWT con tokens firmados (HMAC SHA-256)
- [x] Access token corto (1h) para minimizar ventana de exposición
- [x] Refresh token largo (7d) para UX
- [x] Blacklist de refresh tokens después de logout
- [x] Rotation de refresh tokens (nuevo en cada refresh)
- [x] CORS configurado con origins específicos

### ✅ Validaciones
- [x] Email único con mensaje custom en español
- [x] Username único y slug-friendly
- [x] Password strength validation
- [x] Password confirmation match
- [x] User is_active check en login
- [x] Mensajes de error descriptivos en español

### ✅ Roles y Permisos
- [x] UserRole.ARTISAN y UserRole.ADMIN
- [x] Artesanos empiezan con `is_approved=False`
- [x] Property `can_sell` para lógica de negocio
- [x] Admins siempre aprobados automáticamente
- [x] Solo artesanos aprobados o admins pueden vender

### ✅ UX
- [x] Mensajes en español
- [x] Respuestas consistentes con `{message, data/errors}`
- [x] Códigos HTTP semánticos
- [x] User data incluido en login response
- [x] Perfil actualizable (first_name, last_name)
- [x] Campos read-only protegidos (role, is_approved)

### ✅ Developer Experience
- [x] Type hints en todo el código
- [x] Docstrings detallados
- [x] Documentación completa (AUTH_API_GUIDE.md)
- [x] Tests de ejemplo (test_auth_endpoints.py)
- [x] Ejemplos de integración con Next.js
- [x] Estructura modular y escalable

---

## 📦 Dependencias Utilizadas

Todas ya instaladas en `requirements.txt`:
```
Django==5.0.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
```

Apps adicionales en settings:
```python
'rest_framework_simplejwt.token_blacklist'  # Para logout
```

---

## 🗄️ Migraciones Ejecutadas

```bash
python manage.py migrate
```

Migraciones aplicadas:
- `token_blacklist.0001_initial` → `token_blacklist.0012_*`
- Tablas creadas:
  - `token_blacklist_outstandingtoken`
  - `token_blacklist_blacklistedtoken`

---

## 🧪 Testing

### Script de Prueba
```bash
python test_auth_endpoints.py
```

Tests incluidos:
1. ✅ Registro de artesano
2. ✅ Validación de contraseña débil
3. ✅ Validación de contraseñas no coinciden
4. ✅ Validación de username inválido
5. ✅ Login con credenciales válidas
6. ✅ Ver perfil autenticado
7. ✅ Actualizar perfil
8. ✅ Verificar token
9. ✅ Refresh token
10. ✅ Logout
11. ✅ Acceso después de logout

### Crear Usuario de Prueba
```python
from accounts.models import User, UserRole

# Artesano aprobado
user = User.objects.create_user(
    email='test@example.com',
    username='test-user',
    password='password123',
    first_name='Test',
    last_name='User',
    role=UserRole.ARTISAN,
    is_approved=True  # Para testing
)
```

---

## 🚀 Próximos Pasos

Funcionalidades adicionales que podrías implementar:

### Alta Prioridad
1. **Email Notifications**
   - Email de bienvenida después de registro
   - Email cuando artesano es aprobado
   - Usar Django + SendGrid/Mailgun

2. **Password Reset**
   - POST `/api/v1/auth/password/reset/` (request reset)
   - POST `/api/v1/auth/password/reset/confirm/` (confirm con token)
   - Usar `django.contrib.auth.tokens`

3. **Email Verification**
   - Enviar email con token después de registro
   - Endpoint para verificar email
   - No permitir login sin verificación

### Media Prioridad
4. **Rate Limiting**
   - Limitar intentos de login (prevenir brute force)
   - Usar `django-ratelimit` o `throttling` de DRF

5. **Social Auth (OAuth)**
   - Login con Google, Facebook
   - Usar `django-allauth` o `social-auth-app-django`

6. **User Profile Extended**
   - Modelo Profile relacionado 1:1 con User
   - Avatar, bio, ubicación, teléfono
   - Endpoints CRUD

### Baja Prioridad
7. **Two-Factor Authentication (2FA)**
   - Para admins
   - Usar `django-otp` o TOTP

8. **Activity Logs**
   - Registrar login, logout, cambios de perfil
   - Para auditoría y seguridad

9. **Session Management**
   - Ver sesiones activas (outstanding tokens)
   - Endpoint para invalidar todas las sesiones
   - "Logout from all devices"

---

## 📝 Notas de Implementación

### Decisiones de Diseño

#### 1. ¿Por qué CustomTokenObtainPairView en lugar de LoginSerializer?

Se implementaron AMBOS:
- **CustomTokenObtainPairView**: Hereda de simplejwt, más mantenible
- **LoginSerializer**: Alternativa si necesitas más control

Recomendación: Usa `CustomTokenObtainPairView` (ya configurada en urls.py)

#### 2. ¿Por qué no invalidar access tokens en logout?

JWT es stateless por diseño. Invalidar access tokens requiere:
- Consultar BD en cada request (pierde ventaja de stateless)
- O mantener blacklist de access tokens (millones de registros)

Alternativas:
- **Expiration corta**: Access token de 5-15 min (mejor seguridad, peor UX)
- **Hybrid approach**: Session storage + JWT
- **Actual implementation**: Access 1h (balanceo razonable)

#### 3. ¿Por qué role=ARTISAN por defecto?

Solo artesanos se registran vía API. Compradores son invitados (no tienen cuenta). Admins se crean con `createsuperuser`.

#### 4. ¿Por qué is_approved en lugar de is_verified?

`is_verified` suena a verificación de email. `is_approved` es más claro: un humano revisó y aprobó la cuenta para vender.

---

## 🐛 Troubleshooting

### Error: "Token is invalid or expired"
- Access token expirado → usa refresh token
- Refresh token expirado → login nuevamente
- Token blacklisted → login nuevamente

### Error: "No module named 'rest_framework_simplejwt.token_blacklist'"
- Asegúrate de agregar a INSTALLED_APPS
- Ejecuta `python manage.py migrate`

### Error: "User matching query does not exist"
- Usuario fue eliminado pero token aún válido
- Frontend debe manejar 404 y hacer logout

### Usuario no puede vender (can_sell=False)
- Verifica `is_approved=True` en Django Admin
- Verifica `is_active=True`
- Verifica `role=ARTISAN` o `role=ADMIN`

---

## 📚 Referencias

- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [JWT.io](https://jwt.io/) - Debug tokens
- [Custom User Model](https://docs.djangoproject.com/en/5.0/topics/auth/customizing/)

---

## 👨‍💻 Autor

Sistema implementado para **MiTaller** - Multi-vendor Artisan Marketplace

Stack: Django 5 + DRF + PostgreSQL + Next.js 15 + TypeScript

---

**¡Sistema de autenticación JWT completamente funcional!** 🎉

