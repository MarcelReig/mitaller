# Accounts App - Sistema de Autenticación JWT

Sistema completo de autenticación con JWT para MiTaller marketplace.

## 🚀 Quick Start

### 1. Activar entorno virtual y ejecutar servidor

```bash
cd /Users/marcelreig/Code/side-project/mitaller/backend
source venv/bin/activate
python manage.py runserver
```

### 2. Crear un superusuario (admin)

```bash
python manage.py createsuperuser
# Email: admin@mitaller.com
# Username: admin
# Password: ******** (mínimo 8 caracteres)
```

### 3. Probar endpoints

#### Opción A: Script de prueba automatizado

```bash
python test_auth_endpoints.py
```

#### Opción B: Manualmente con cURL

**Registrar artesano:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artesano@test.com",
    "username": "mi-taller",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "Juan",
    "last_name": "Pérez"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mitaller.com",
    "password": "tu-password"
  }'
```

**Ver perfil (requiere token):**
```bash
curl -X GET http://localhost:8000/api/v1/auth/profile/ \
  -H "Authorization: Bearer <access_token>"
```

---

## 📁 Estructura de Archivos

```
accounts/
├── models.py              # User model con roles ARTISAN/ADMIN
├── serializers.py         # 🆕 RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer
├── views.py               # 🆕 RegisterView, LoginView, ProfileView, LogoutView
├── urls.py                # 🆕 Rutas de autenticación
├── admin.py               # Admin de Django para User
├── AUTH_API_GUIDE.md      # 🆕 Documentación completa de API
├── IMPLEMENTATION_SUMMARY.md  # 🆕 Resumen técnico de implementación
└── README.md              # 🆕 Este archivo
```

---

## 🔑 Endpoints Disponibles

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register/` | Registrar nuevo artesano | No |
| POST | `/api/v1/auth/login/` | Login con JWT | No |
| POST | `/api/v1/auth/token/refresh/` | Renovar access token | No* |
| POST | `/api/v1/auth/token/verify/` | Verificar si token es válido | No |
| POST | `/api/v1/auth/logout/` | Cerrar sesión (blacklist) | Sí |
| GET | `/api/v1/auth/profile/` | Ver perfil del usuario | Sí |
| PUT/PATCH | `/api/v1/auth/profile/` | Actualizar perfil | Sí |

*Refresh endpoint requiere el refresh token en el body

---

## 🎯 Flujo de Autenticación

### 1. Registro de Artesano

```mermaid
Usuario → Register → Backend crea User
                      ├─ role = ARTISAN
                      ├─ is_approved = False
                      └─ can_sell = False (no puede vender aún)

Admin → Django Admin → Marca is_approved = True
                     → Ahora can_sell = True ✓
```

**Importante:** Los artesanos registrados NO pueden vender hasta que un admin los apruebe en Django Admin.

### 2. Login y Tokens

```mermaid
Usuario → Login (email + password)
       ← access_token (válido 1h)
       ← refresh_token (válido 7 días)
       ← user data {id, email, role, can_sell, ...}

Usuario → Request con Authorization: Bearer <access_token>
       ← Data si token válido
       ← 401 si token expirado

Usuario → Refresh con refresh_token
       ← Nuevo access_token + nuevo refresh_token

Usuario → Logout con refresh_token
       → Refresh token va a blacklist (no se puede usar más)
```

---

## 🔒 Seguridad Implementada

✅ **Contraseñas:**
- Hasheadas con PBKDF2 (Django default)
- Mínimo 8 caracteres
- Al menos 1 letra y 1 número

✅ **Tokens JWT:**
- Access token: 1 hora (corto para seguridad)
- Refresh token: 7 días (largo para UX)
- Firmados con HMAC SHA-256
- Blacklist después de logout

✅ **Validaciones:**
- Email único
- Username slug-friendly (solo letras, números, `-`, `_`)
- Password confirmation match
- User activo en login

✅ **CORS:**
- Configurado con origins específicos
- Credentials enabled

✅ **Roles y Permisos:**
- Artesanos necesitan aprobación
- Solo `can_sell=True` puede vender
- Admins siempre aprobados

---

## 👥 Roles de Usuario

### ARTISAN (Artesano)
- Se registra vía API
- Empieza con `is_approved=False`
- `can_sell=False` hasta aprobación
- Después de aprobación puede vender

### ADMIN (Administrador)
- Se crea con `python manage.py createsuperuser`
- Siempre `is_approved=True`
- Siempre `can_sell=True`
- Puede aprobar artesanos

---

## 🧪 Testing

### Pruebas Automatizadas

```bash
python test_auth_endpoints.py
```

Tests incluidos:
1. Registro de artesano
2. Validaciones (password, username, email)
3. Login
4. Ver perfil
5. Actualizar perfil
6. Refresh token
7. Verificar token
8. Logout
9. Acceso después de logout

### Pruebas Manuales

#### 1. Crear artesano en Django shell

```bash
python manage.py shell
```

```python
from accounts.models import User, UserRole

# Crear artesano aprobado para testing
user = User.objects.create_user(
    email='test@example.com',
    username='test-artisan',
    password='password123',
    first_name='Test',
    last_name='Artisan',
    role=UserRole.ARTISAN,
    is_approved=True  # Ya aprobado para testing
)

print(f"Usuario creado: {user.email}")
print(f"Puede vender: {user.can_sell}")
```

#### 2. Aprobar artesano en Django Admin

1. Ir a http://localhost:8000/admin/
2. Login con superuser
3. Ir a "Users"
4. Seleccionar artesano pendiente
5. Marcar checkbox "Aprobado"
6. Save

---

## 📚 Documentación Adicional

### Documentación Completa de API
Ver: [`AUTH_API_GUIDE.md`](./AUTH_API_GUIDE.md)

Incluye:
- Todos los endpoints con request/response examples
- Ejemplos con cURL
- Integración con Next.js (Zustand + Axios)
- Códigos de estado HTTP
- Manejo de errores
- Testing

### Resumen Técnico
Ver: [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)

Incluye:
- Estructura de archivos creados
- Decisiones de diseño
- Flujos de autenticación explicados
- Características implementadas
- Próximos pasos sugeridos
- Troubleshooting

---

## 🔧 Configuración

### Settings JWT (config/settings.py)

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### CORS

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Next.js dev server
]
CORS_ALLOW_CREDENTIALS = True
```

---

## 🐛 Troubleshooting

### "Token is invalid or expired"

**Causa:** Access token expirado (después de 1h)

**Solución:** Usar refresh token para obtener nuevo access token

```bash
curl -X POST http://localhost:8000/api/v1/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<tu_refresh_token>"}'
```

### "No se encontraron credenciales de autenticación válidas"

**Causa:** Credenciales incorrectas en login

**Solución:** 
- Verifica email y password
- Verifica que el usuario existe
- Verifica que `is_active=True`

### Usuario no puede vender (can_sell=False)

**Causa:** Artesano no aprobado

**Solución:**
1. Login a Django Admin
2. Ir a Users
3. Seleccionar usuario
4. Marcar "Aprobado"
5. Save

### "Couldn't import Django"

**Causa:** Virtual environment no activado

**Solución:**
```bash
source venv/bin/activate
```

---

## 🚀 Próximos Pasos

Funcionalidades sugeridas para implementar:

1. **Email Notifications**
   - Email de bienvenida
   - Notificación de aprobación

2. **Password Reset**
   - Recuperación de contraseña por email

3. **Email Verification**
   - Verificar email después de registro

4. **Rate Limiting**
   - Limitar intentos de login

5. **Social Auth**
   - Login con Google/Facebook

Ver [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) para más detalles.

---

## 📞 Soporte

Para preguntas sobre la implementación:
- Ver documentación en `AUTH_API_GUIDE.md`
- Ver resumen técnico en `IMPLEMENTATION_SUMMARY.md`
- Revisar código en `serializers.py` y `views.py` (con docstrings completos)

---

## ✅ Checklist de Implementación

- [x] Custom User model con roles (ARTISAN, ADMIN)
- [x] RegisterSerializer con validaciones robustas
- [x] UserSerializer con can_sell
- [x] CustomTokenObtainPairSerializer
- [x] RegisterView (POST /register/)
- [x] CustomTokenObtainPairView (POST /login/)
- [x] UserProfileView (GET/PUT /profile/)
- [x] LogoutView con blacklist (POST /logout/)
- [x] URLs configuradas
- [x] Blacklist app instalada
- [x] Migraciones ejecutadas
- [x] Documentación completa
- [x] Script de testing
- [x] Type hints
- [x] Docstrings
- [x] Mensajes en español
- [x] Manejo de errores

**¡Sistema 100% funcional!** 🎉

---

**Stack:** Django 5 + DRF + Simple JWT + PostgreSQL
**Autor:** Marcel Reig
**Proyecto:** MiTaller - Multi-vendor Artisan Marketplace

