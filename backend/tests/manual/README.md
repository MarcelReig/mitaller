# Scripts de Testing Manual

Este directorio contiene scripts de Python para testing manual de endpoints de la API.

## Scripts Disponibles

### `test_auth_endpoints.py`
Script para probar todos los endpoints de autenticación JWT.

**Uso:**
```bash
# Asegúrate de que el servidor esté corriendo
python manage.py runserver

# En otra terminal, ejecuta:
python tests/manual/test_auth_endpoints.py
```

**Prueba:**
- Registro de usuario
- Login con JWT
- Refresh de tokens
- Acceso a endpoints protegidos
- Logout (blacklist)

---

### `test_auth_flow.py`
Script para verificar el flujo completo de registro y login con output colorizado.

**Uso:**
```bash
python tests/manual/test_auth_flow.py
```

**Flujo:**
1. ✅ Registro de nuevo usuario
2. ✅ Login y obtención de tokens
3. ✅ Acceso a perfil con token
4. ✅ Refresh de access token
5. ✅ Logout y blacklist

---

## Notas

- Estos scripts están pensados para testing manual durante desarrollo
- Requieren que el servidor Django esté corriendo en `http://localhost:8000`
- Para testing automatizado, usa el framework de tests de Django en `/tests/`
- Los scripts crean usuarios de prueba con emails del tipo `test-*@example.com`

