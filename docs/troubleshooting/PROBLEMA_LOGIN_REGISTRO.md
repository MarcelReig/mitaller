# Problema con Login y Registro - Fix

## Fecha: 2025-10-23

## Problemas Reportados

1. **Después del registro redirige a login** - Esto es intencional, pero se agregaron logs para debugging
2. **Al hacer login con un usuario, entra como otro usuario diferente** - CRÍTICO
   - Ejemplo: Login con `kojima@productions.com` pero entra como `artista@mitaller.art`

## Cambios Implementados

### Backend (`/backend/accounts/serializers.py`)

#### CustomTokenObtainPairSerializer
- ✅ Agregados logs de debugging para rastrear qué usuario se autentica
- ✅ Logs incluyen:
  - Email usado en la autenticación
  - Usuario autenticado (email + ID)
  - Datos del usuario en la respuesta

```python
# Logs agregados:
logger.info(f"[LOGIN] Intentando autenticar usuario con email: {email}")
logger.info(f"[LOGIN] Usuario autenticado: {self.user.email} (ID: {self.user.id})")
logger.info(f"[LOGIN] Datos del usuario en respuesta: email={user_data.get('email')}, id={user_data.get('id')}")
```

### Frontend (`/frontend/src/stores/authStore.ts`)

#### Función `login()`
- ✅ Agregados logs detallados para rastrear el flujo de autenticación
- ✅ **Validación de seguridad**: Verifica que el email del usuario devuelto coincida con el email usado en el login
- ✅ Si no coinciden, limpia tokens y muestra error
- ✅ Logs incluyen email solicitado vs email recibido

#### Función `register()`
- ✅ Limpia cualquier sesión anterior antes de registrar
- ✅ Resetea completamente el estado (user, tokens, isAuthenticated)
- ✅ Agregados logs para rastrear el proceso

#### Función `checkAuth()`
- ✅ Agregados logs para rastrear verificación de sesión
- ✅ Mejor manejo de errores

#### Persistencia
- ✅ **Cambiado**: Ya NO se persiste NADA en localStorage
- ✅ El usuario se recupera del token JWT en cada carga vía `checkAuth()`
- ✅ Esto previene problemas de sesiones "pegadas"

## Cómo Probar

### 1. Limpia el estado del navegador
```bash
# En las DevTools del navegador:
# Application -> Storage -> Clear site data
```

### 2. Prueba el flujo de registro
```bash
# 1. Ir a /registro
# 2. Crear un nuevo usuario con email único
# 3. Verificar en consola los logs [AUTH]
# 4. Debe redirigir a /login
# 5. Verificar que no hay tokens en cookies
```

### 3. Prueba el flujo de login
```bash
# 1. Ir a /login
# 2. Usar el email y password del usuario registrado
# 3. Verificar logs en consola (frontend):
#    - [AUTH] Intentando login con email: ...
#    - [AUTH] Respuesta del login: ...
#    - [AUTH] Usuario recibido del backend: ...
#    - [AUTH] Login exitoso. Usuario guardado en store: ...
# 4. Verificar logs en backend:
#    - [LOGIN] Intentando autenticar usuario con email: ...
#    - [LOGIN] Usuario autenticado: ...
#    - [LOGIN] Datos del usuario en respuesta: ...
# 5. Verificar que los emails coinciden
# 6. Verificar que redirige al dashboard correcto
```

### 4. Prueba logout y login con otro usuario
```bash
# 1. Hacer logout
# 2. Verificar que se limpian cookies
# 3. Login con un usuario DIFERENTE
# 4. Verificar logs para asegurar que el usuario correcto se autentica
# 5. Verificar que el dashboard muestra el usuario correcto
```

## Logs a Revisar

### Frontend (Consola del navegador)
- `[AUTH] Intentando login con email: X`
- `[AUTH] Usuario recibido del backend: { email: X }`
- `[AUTH] Login exitoso. Usuario guardado en store: X`

Si ves:
- `[AUTH] ERROR CRÍTICO: El usuario devuelto no coincide con el email de login!`

Significa que el backend está devolviendo el usuario incorrecto.

### Backend (Terminal Django)
- `[LOGIN] Intentando autenticar usuario con email: X`
- `[LOGIN] Usuario autenticado: X (ID: Y)`
- `[LOGIN] Datos del usuario en respuesta: email=X, id=Y`

## Solución del Problema Principal

El problema era la **persistencia parcial en localStorage**:
- Antes: Se persistía `isAuthenticated: true` pero no el usuario
- Al recargar, el store tenía `isAuthenticated: true` pero `user: null`
- El `checkAuth()` recuperaba el usuario del token
- **Pero si había un token antiguo**, recuperaba el usuario equivocado

**Solución**: Ya NO se persiste nada. Todo se recupera del token JWT en cada carga.

## Si el Problema Persiste

1. **Verificar base de datos**:
   ```bash
   python manage.py shell
   from accounts.models import User
   User.objects.all().values('id', 'email', 'username')
   ```

2. **Verificar tokens JWT**:
   - Los tokens contienen el `user_id`
   - Verifica que el `user_id` en el token corresponda al usuario correcto
   - Puedes decodificar un JWT en jwt.io

3. **Verificar el backend de autenticación de Django**:
   ```python
   # En settings.py, debe estar:
   AUTHENTICATION_BACKENDS = [
       'django.contrib.auth.backends.ModelBackend',
   ]
   ```

4. **Verificar el modelo User**:
   ```python
   # El USERNAME_FIELD debe ser 'email'
   USERNAME_FIELD = 'email'
   ```

## Próximos Pasos

Una vez confirmado que el flujo funciona:
1. Los logs de debugging se pueden eliminar o convertir en logs condicionales (solo en desarrollo)
2. Considerar agregar tests automatizados para este flujo
3. Considerar agregar un endpoint `/api/v1/auth/debug/` (solo en desarrollo) que muestre:
   - Token actual
   - Usuario autenticado según el token
   - Datos de la sesión

## Comandos Útiles

```bash
# Limpiar base de datos de testing
python manage.py flush

# Crear usuario de prueba
python manage.py shell
from accounts.models import User
User.objects.create_user(email='test@test.com', username='testuser', password='Test1234', first_name='Test', last_name='User')

# Ver logs del servidor Django
# Simplemente ejecuta el servidor y observa los logs [LOGIN]
python manage.py runserver
```

