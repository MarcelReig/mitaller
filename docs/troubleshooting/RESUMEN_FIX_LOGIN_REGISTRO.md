# Resumen: Fix de Errores de Login y Registro

## Fecha: 2025-10-23

## Problemas Originales

1. **Después del registro redirige a login** - Comportamiento intencional pero añadidos logs para debugging
2. **Login con usuario equivocado** - CRÍTICO ❌
   - Usuario reportó: "Login con kojima@productions.com pero entra como artista@mitaller.art"

## Causa Raíz Identificada

**Persistencia parcial en localStorage**:
- El store de Zustand persistía `isAuthenticated: true` pero NO el usuario completo
- Al recargar la página con `isAuthenticated: true` pero `user: null`
- El `checkAuth()` recuperaba el usuario del token JWT almacenado
- Si había un token viejo/incorrecto en cookies, recuperaba el usuario equivocado
- Resultado: El usuario ve datos de una sesión anterior

## Solución Implementada

### 1. Backend: Logs de Debugging

**Archivo**: `backend/accounts/serializers.py`

```python
# En CustomTokenObtainPairSerializer.validate()
logger.info(f"[LOGIN] Intentando autenticar usuario con email: {email}")
logger.info(f"[LOGIN] Usuario autenticado: {self.user.email} (ID: {self.user.id})")
logger.info(f"[LOGIN] Datos del usuario en respuesta: email={...}, id={...}")
```

**Beneficios**:
- Permite rastrear qué usuario se autentica en cada request
- Ayuda a detectar si el backend devuelve el usuario incorrecto
- Facilita debugging de problemas de autenticación

### 2. Frontend: Validación de Seguridad en Login

**Archivo**: `frontend/src/stores/authStore.ts`

**Cambio principal**: Validación de email en `login()`

```typescript
// Verificación de seguridad: el email debe coincidir
if (user.email.toLowerCase() !== data.email.toLowerCase()) {
  console.error('[AUTH] ERROR CRÍTICO: El usuario devuelto no coincide!');
  removeAllTokens();
  toast.error('Error de autenticación. Por favor, intenta nuevamente.');
  throw new Error('Usuario devuelto no coincide con credenciales');
}
```

**Beneficios**:
- Previene que un usuario entre con credenciales de otro
- Detecta inmediatamente si el backend devuelve el usuario incorrecto
- Limpia tokens y muestra error claro al usuario

### 3. Frontend: Limpieza de Sesión en Registro

**Archivo**: `frontend/src/stores/authStore.ts`

**Cambio**: Limpiar sesiones antes de registrar

```typescript
register: async (data: RegisterData) => {
  // Limpiar cualquier sesión anterior antes de registrar
  removeAllTokens();
  set({ 
    user: null, 
    isAuthenticated: false, 
    isLoading: true 
  });
  // ... resto del código
}
```

**Beneficios**:
- Previene que tokens antiguos interfieran con el registro
- Asegura que el nuevo usuario empiece con sesión limpia

### 4. Frontend: Sin Persistencia en localStorage

**Archivo**: `frontend/src/stores/authStore.ts`

**Cambio más importante**:

```typescript
// ANTES:
partialize: (state) => ({
  isAuthenticated: state.isAuthenticated,
}),

// DESPUÉS:
partialize: () => ({}),
```

**Beneficios**:
- NO se persiste NADA en localStorage
- El usuario se recupera del token JWT en cada carga
- Previene problemas de sesiones "pegadas"
- Más seguro: los datos del usuario no quedan en localStorage

### 5. Backend: Endpoint de Debugging

**Archivo**: `backend/accounts/views.py`

**Nueva vista**: `DebugAuthView`

```python
GET /api/v1/auth/debug/
```

Retorna:
- Token usado (preview)
- Usuario autenticado según el token
- Información de la request

**Beneficios**:
- Permite verificar rápidamente qué usuario está autenticado
- Útil para debugging en desarrollo
- Ayuda a diagnosticar problemas de tokens

### 6. Script de Testing Automatizado

**Archivo**: `backend/test_auth_flow.py`

Script ejecutable que prueba:
1. ✅ Registro de usuario
2. ✅ Login con credenciales
3. ✅ Obtener perfil del usuario
4. ✅ Endpoint de debugging
5. ✅ Logout

**Verificaciones críticas**:
- Email del usuario devuelto coincide con el email usado en login
- Email en el perfil coincide con el esperado
- Email en debug coincide con el esperado

**Uso**:
```bash
cd backend
python test_auth_flow.py
```

## Archivos Modificados

### Backend
1. ✅ `backend/accounts/serializers.py` - Logs de debugging
2. ✅ `backend/accounts/views.py` - Nueva vista DebugAuthView
3. ✅ `backend/accounts/urls.py` - Ruta para /debug/
4. ✅ `backend/test_auth_flow.py` - Script de testing (NUEVO)

### Frontend
1. ✅ `frontend/src/stores/authStore.ts` - Validación y limpieza de sesiones
2. Sin cambios en componentes UI (login/registro)

### Documentación
1. ✅ `docs/troubleshooting/PROBLEMA_LOGIN_REGISTRO.md` - Guía completa
2. ✅ `docs/troubleshooting/RESUMEN_FIX_LOGIN_REGISTRO.md` - Este archivo

## Cómo Probar

### 1. Limpia el navegador
```javascript
// En DevTools -> Console
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
});
```

### 2. Ejecuta el test automatizado (Backend)
```bash
cd backend
python test_auth_flow.py
```

Si pasa, el backend funciona correctamente ✅

### 3. Prueba manual (Frontend)

**Escenario A: Usuario nuevo**
1. Ir a `/registro`
2. Crear usuario con email único (ej: `test1@test.com`)
3. Verificar logs en consola del navegador:
   ```
   [AUTH] Iniciando registro. Limpiando sesiones anteriores...
   [AUTH] Registrando usuario con email: test1@test.com
   [AUTH] Registro exitoso para: test1@test.com
   ```
4. Debe redirigir a `/login`

**Escenario B: Login**
1. Usar credenciales del usuario creado
2. Verificar logs en consola:
   ```
   [AUTH] Intentando login con email: test1@test.com
   [AUTH] Usuario recibido del backend: { email: 'test1@test.com', ... }
   [AUTH] Login exitoso. Usuario guardado en store: test1@test.com
   ```
3. Debe redirigir al dashboard

**Escenario C: Logout y login con otro usuario**
1. Hacer logout
2. Verificar que se limpian cookies
3. Registrar otro usuario (ej: `test2@test.com`)
4. Login con el segundo usuario
5. **VERIFICAR**: El dashboard debe mostrar datos del segundo usuario, NO del primero

**Escenario D: Recarga de página**
1. Con sesión activa, recargar la página
2. Verificar logs:
   ```
   [AUTH] Token encontrado. Verificando sesión...
   [AUTH] Sesión válida. Usuario: test1@test.com
   ```
3. Debe mantener la sesión correcta

### 4. Verificar logs del backend

Terminal de Django debe mostrar:
```
[LOGIN] Intentando autenticar usuario con email: test1@test.com
[LOGIN] Usuario autenticado: test1@test.com (ID: 123)
[LOGIN] Datos del usuario en respuesta: email=test1@test.com, id=123
```

## Resultado Esperado

✅ **Todos los escenarios deben pasar sin errores**
✅ **El email del usuario siempre debe coincidir**
✅ **No debe haber login con usuario equivocado**

## Si el Problema Persiste

### 1. Verificar base de datos
```bash
python manage.py shell
```
```python
from accounts.models import User
User.objects.all().values('id', 'email', 'username')
```

### 2. Verificar tokens JWT
- Copiar el token de las cookies
- Ir a https://jwt.io
- Pegar el token y verificar el `user_id` en el payload

### 3. Verificar configuración de Django
```python
# En settings.py
USERNAME_FIELD = 'email'  # Debe ser 'email'
```

### 4. Revisar logs completos
- Frontend: Consola del navegador
- Backend: Terminal de Django

## Mejoras Futuras (Opcional)

1. **Convertir logs en condicionales**:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log('[AUTH] ...');
   }
   ```

2. **Tests automatizados E2E**:
   - Playwright/Cypress para testing del flujo completo
   - Tests de integración con Pytest

3. **Monitoreo en producción**:
   - Sentry para capturar errores de autenticación
   - Logs estructurados con información de usuario

4. **Rate limiting**:
   - Limitar intentos de login fallidos
   - Prevenir ataques de fuerza bruta

## Conclusión

Los cambios implementados:
- ✅ Agregan validación de seguridad en el login
- ✅ Previenen problemas de sesiones "pegadas"
- ✅ Facilitan debugging con logs detallados
- ✅ Incluyen script de testing automatizado
- ✅ Mejoran la seguridad al no persistir datos en localStorage

**El problema reportado debe estar resuelto** 🎉

Si persiste, los logs ahora proporcionan información detallada para identificar exactamente dónde está el problema.

