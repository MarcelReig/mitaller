# Changelog: Cursor Rules

## 2025-01-23 - Sección "Calidad de Código y Mejores Prácticas"

### Motivación
Después de resolver el problema del logout (que redirigía incorrectamente a `/login` en lugar de `/`), identificamos que la causa raíz era un mal diseño en el flujo de operaciones. La primera solución fue añadir un parche en el interceptor de axios, pero esto era un **code smell** y no una solución profesional.

### Qué Aprendimos
- **Parches temporales ocultan problemas reales:** Si necesitas una "excepción especial", el diseño está mal
- **El orden importa:** Servidor → Cliente → UI (no al revés)
- **Try-catch-finally es poderoso:** Garantiza limpieza incluso en caso de error
- **Código mantenible > Código que "funciona":** Pensar en el desarrollador que leerá esto en 6 meses

### Qué Añadimos a `.cursorrules`

#### 1. Nueva Sección: "Calidad de Código y Mejores Prácticas"
Ubicación: Después de "Patrones de Diseño", antes de "API Design"

**Contenido:**
- ✅ Principios fundamentales (qué NUNCA y qué SIEMPRE hacer)
- ✅ Arquitectura profesional con ejemplos reales
- ✅ Manejo robusto de errores (Python + TypeScript)
- ✅ Código auto-documentado vs comentarios inútiles
- ✅ Principio DRY con sentido común
- ✅ Single Responsibility Principle
- ✅ Code smells comunes y cómo evitarlos
- ✅ Métricas de calidad (5 preguntas antes de commit)
- ✅ Ejemplo completo: Logout profesional (antes vs después)

#### 2. Actualización: "Reglas de Generación de Código"
Ubicación: Sección existente mejorada

**Cambios:**
- ✅ Añadido punto #1: "Resuelve la causa raíz, no los síntomas"
- ✅ Reorganizado con énfasis en mantenibilidad
- ✅ Añadido checklist de verificación (5 criterios)
- ✅ Ejemplos de comentarios buenos vs malos
- ✅ Referencia a sección "Calidad de Código"

### Ejemplos Incluidos

**Logout (Caso Real):**
```typescript
// ❌ ANTES: Parche temporal
if (url.includes('/auth/logout/')) {
  return Promise.reject(error);  // Code smell
}

// ✅ DESPUÉS: Solución profesional
logout: async () => {
  try {
    await backend.logout();  // Backend primero
  } catch (error) {
    console.warn('Backend failed, continuing cleanup');
  } finally {
    clearLocalState();  // Limpieza garantizada
    showToast();
    redirect();
  }
}
```

**Manejo de Errores:**
```python
# ✅ CORRECTO: Específico y útil
try:
    profile = ArtistProfile.objects.get(slug=slug)
except ArtistProfile.DoesNotExist:
    logger.error(f"Artist profile not found: {slug}")
    raise Http404("Perfil no encontrado")

# ❌ INCORRECTO: Genérico e inútil
try:
    # ... código
except:
    pass  # Silent failure
```

### Impacto

**Para el AI:**
- Guías claras sobre qué es código profesional vs parches
- Ejemplos concretos del proyecto para referencia
- Checklist de verificación antes de proponer soluciones

**Para el Desarrollador:**
- Base de conocimiento de mejores prácticas
- Estándares de calidad documentados
- Ejemplos reales del proyecto

### Ubicación en `.cursorrules`
- Líneas ~117-430: Nueva sección "Calidad de Código"
- Líneas ~514-580: Reglas actualizadas

---

**Lecciones Clave:**
1. Si tu solución necesita un parche, probablemente no es la solución correcta
2. Orden lógico de operaciones: Servidor → Cliente → UI
3. Try-catch-finally garantiza limpieza incluso si algo falla
4. Código mantenible es más valioso que código "rápido"
5. Pregúntate: ¿Lo entenderé en 6 meses?

---

**Relacionado:**
- `docs/troubleshooting/PROBLEMA_LOGOUT.md` - Caso de estudio completo
- `frontend/src/stores/authStore.ts` - Implementación correcta del logout
- `frontend/src/lib/axios.ts` - Interceptores limpios sin parches

