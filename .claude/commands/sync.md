Verifica la consistencia entre Frontend y Backend.

Ejecuta el checklist de sincronización FE/BE:

1. **Modelos → Serializers → Tipos**
   - Lee los serializers de backend que cambiaron recientemente
   - Compara con tipos TypeScript en `frontend/src/types/`
   - Identifica discrepancias (campos faltantes, tipos diferentes)

2. **Endpoints → API Services**
   - Lista endpoints nuevos en `backend/*/urls.py`
   - Verifica si existen en `frontend/src/lib/api/*.ts`
   - Identifica API services faltantes

3. **Reporte**
   - Lista todo lo que está sincronizado ✅
   - Lista inconsistencias encontradas ❌
   - Sugiere correcciones necesarias

Usa `git status` y `git diff` para ver cambios recientes.
