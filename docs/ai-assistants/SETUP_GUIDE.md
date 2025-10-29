# 🛠️ Setup de Claude AI + Cursor para MiTaller.art

> **Fecha:** 2025-10-28
> **Versión:** 1.0
> **Autor:** Configuración optimizada para desarrollo con múltiples herramientas AI

---

## 📋 Índice

1. [¿Qué hicimos?](#-qué-hicimos)
2. [Estructura de Archivos](#-estructura-de-archivos)
3. [Guía de Uso por Herramienta](#-guía-de-uso-por-herramienta)
4. [Workflow Recomendado](#-workflow-recomendado)
5. [Ejemplos Prácticos](#-ejemplos-prácticos)
6. [Troubleshooting](#-troubleshooting)
7. [Mantenimiento](#-mantenimiento)

---

## 🎯 ¿Qué hicimos?

### Problema Original

Teníamos información duplicada y desorganizada entre:
- `.cursorrules` muy largo (1,059 líneas, 4,494 palabras)
- Sin contexto específico para Claude Web
- Claude Code sin manera automática de cargar reglas
- ~40% de contenido duplicado entre archivos

### Solución Implementada

**Optimizamos y organizamos en 3 archivos complementarios:**

1. **`.cursorrules`** (823 líneas, 3,465 palabras) - **Reducción del 23%**
   - Reglas accionables del día a día
   - Checklist de consistencia FE/BE
   - Calidad de código con ejemplos
   - Convenciones y patrones

2. **`CONTEXT_FOR_CLAUDE.md`** (1,100 líneas, 5,725 palabras)
   - Contexto profundo del proyecto
   - Arquitectura completa del monorepo
   - Diagrama de flujo JWT
   - Tabla de endpoints
   - Decisiones arquitectónicas detalladas

3. **`.claude/commands/`** (3 comandos slash personalizados)
   - `/rules` - Carga `.cursorrules`
   - `/context` - Carga `CONTEXT_FOR_CLAUDE.md`
   - `/sync` - Verifica consistencia FE/BE

### Beneficios

- ✅ **23% menos tokens** por sesión de Cursor (~1,400 tokens ahorrados)
- ✅ **Cero duplicación** entre archivos
- ✅ **Roles claros** para cada archivo
- ✅ **Claude Code con comandos** automáticos
- ✅ **Claude Web con contexto** completo
- ✅ **Más fácil de mantener** (actualizar una vez, usar en todas partes)

---

## 📁 Estructura de Archivos

```
mitaller/
├── .cursorrules                     # 🎯 Reglas para Cursor (lee automático)
│
├── .claude/
│   ├── settings.local.json         # ⚙️ Configuración Claude Code
│   ├── PERMISSIONS_GUIDE.md        # 📖 Guía de permissions
│   └── commands/                   # 🎮 Comandos slash personalizados
│       ├── rules.md                # /rules - Carga .cursorrules
│       ├── context.md              # /context - Carga CONTEXT_FOR_CLAUDE
│       └── sync.md                 # /sync - Verifica FE/BE
│
├── backend/                        # Django REST API
├── frontend/                       # Next.js 15 App Router
└── docs/
    └── ai-assistants/              # 🤖 Documentación para IAs
        ├── README.md               # Índice
        ├── CONTEXT_FOR_CLAUDE.md   # Contexto completo del proyecto
        └── SETUP_GUIDE.md          # Esta guía
```

---

## 🚀 Guía de Uso por Herramienta

### 1️⃣ Cursor (IDE)

#### Configuración

**✅ Sin configuración necesaria**

Cursor lee `.cursorrules` automáticamente en cada sesión.

#### Uso Diario

```
1. Abre el proyecto en Cursor
2. Cursor lee .cursorrules automáticamente
3. Todas las reglas están activas
4. Empieza a trabajar
```

#### Características

- ✅ Carga automática de reglas
- ✅ Checklist FE/BE siempre activo
- ✅ Calidad de código en cada respuesta
- ✅ Convenciones aplicadas automáticamente

#### Si Necesitas Contexto Profundo

```
Prompt: "Lee docs/ai-assistants/CONTEXT_FOR_CLAUDE.md y explícame
el flujo completo de autenticación JWT"
```

Cursor leerá el archivo y te explicará el contexto detallado.

---

### 2️⃣ Claude Code (CLI) - Lo que estás usando ahora

#### Configuración

**Setup inicial** (solo primera vez):

```bash
# 1. Copiar configuración de permissions
cp .claude/settings.example.json .claude/settings.local.json

# 2. (Opcional) Personalizar permissions según tus necesidades
# vim .claude/settings.local.json

# 3. Reiniciar Claude Code
```

**✅ Slash commands ya configurados** - Disponibles en `.claude/commands/`

#### Comandos Disponibles

##### 🎯 `/rules` - Cargar reglas del proyecto

**Cuándo usar:** Al inicio de cada sesión nueva

```bash
/rules
```

**Qué hace:**
- Lee `.cursorrules` completo
- Carga checklist de consistencia FE/BE
- Aplica reglas de calidad de código
- Activa convenciones del proyecto
- Confirma qué reglas están activas

**Output esperado:**
```
Reglas del proyecto cargadas ✅

Reglas principales activas:
- Checklist de consistencia FE/BE
- Calidad de código (ejemplos correcto vs incorrecto)
- Convenciones: snake_case (BE), camelCase (FE)
- Decisiones arquitectónicas (REST, tipos manuales, deploy separado)
```

---

##### 📖 `/context` - Cargar contexto profundo

**Cuándo usar:**
- Vas a tomar decisiones arquitectónicas
- Necesitas entender flujos completos
- Quieres ver tabla de endpoints
- Necesitas verificar modelo de datos

```bash
/context
```

**Qué hace:**
- Lee `CONTEXT_FOR_CLAUDE.md`
- Carga arquitectura completa del monorepo
- Diagrama de flujo JWT
- Tabla de endpoints (mapeo FE ↔ BE)
- Decisiones arquitectónicas detalladas
- Modelo de datos

**Output esperado:**
```
Contexto completo cargado ✅

Secciones disponibles:
- Arquitectura del Monorepo (árbol ASCII completo)
- Comunicación FE/BE (diagrama JWT)
- Tabla de endpoints (7 módulos)
- 10 decisiones arquitectónicas
- Modelo de datos con relaciones
- 3 flujos críticos documentados
```

---

##### 🔍 `/sync` - Verificar consistencia FE/BE

**Cuándo usar:**
- Después de cambiar modelos/serializers en backend
- Después de añadir endpoints nuevos
- Antes de hacer commit grande
- Semanalmente (mantenimiento)

```bash
/sync
```

**Qué hace:**
- Compara serializers backend vs tipos frontend
- Verifica endpoints vs API services
- Identifica inconsistencias
- Sugiere correcciones

**Output esperado:**
```
Verificando consistencia FE/BE...

✅ Sincronizado:
- User type ↔ UserSerializer (5 campos coinciden)
- Artisan type ↔ ArtisanSerializer (12 campos coinciden)
- Product type ↔ ProductSerializer (8 campos coinciden)

❌ Inconsistencias encontradas:
- backend/orders/serializers.py tiene campo "shipping_notes"
  pero frontend/src/types/order.ts NO lo tiene
  → Añadir: shipping_notes?: string;

💡 Acciones sugeridas:
1. Actualizar frontend/src/types/order.ts
2. Verificar si el campo es opcional o requerido
3. Ejecutar npm run type-check
```

---

#### Workflow Típico con Claude Code

##### Inicio de Sesión:

```bash
# 1. Cargar reglas
/rules

# 2. Ver estado del proyecto
git status

# 3. Empezar a trabajar
```

##### Cambio en Backend:

```bash
# 1. Hacer cambio en models.py o serializers.py

# 2. Verificar sincronización
/sync

# 3. Actualizar frontend según sugerencias

# 4. Verificar de nuevo
/sync
```

##### Decisión Arquitectónica:

```bash
# 1. Cargar contexto profundo
/context

# 2. Consultar: "¿Por qué usamos REST en lugar de GraphQL?"
# Claude Code te explicará con contexto completo

# 3. Tomar decisión informada
```

---

### 3️⃣ Claude Web (chat.claude.ai)

#### Configuración

##### Opción A: Project Knowledge (Claude Pro) - RECOMENDADO

```
1. Ve a claude.ai
2. Crea nuevo proyecto "MiTaller"
3. Sube archivo: docs/ai-assistants/CONTEXT_FOR_CLAUDE.md
4. Todas las conversaciones en ese proyecto tienen contexto automático
```

**Ventajas:**
- ✅ Contexto automático en cada conversación
- ✅ No necesitas pegar nada
- ✅ Más eficiente

##### Opción B: Manual (Claude Free)

```
1. Ve a claude.ai
2. Nueva conversación
3. Copia contenido de docs/ai-assistants/CONTEXT_FOR_CLAUDE.md
4. Pega como primer mensaje:
   "Este es el contexto del proyecto MiTaller.art:
   [PEGAR CONTENIDO]

   Por favor, ayúdame con [TU PREGUNTA]"
```

#### Uso Típico

**Para decisiones arquitectónicas:**
```
"Basándote en el contexto del proyecto, ¿deberíamos
implementar GraphQL o mantener REST API para
el sistema de notificaciones?"
```

**Para validación de diseño:**
```
"Voy a implementar un sistema de reviews.
¿Es consistente con la arquitectura actual?
¿Qué consideraciones debo tener?"
```

**Para troubleshooting conceptual:**
```
"Tengo un problema con la sincronización de tipos
entre backend y frontend. ¿Cuál es la mejor práctica
según las decisiones del proyecto?"
```

---

## 🔄 Workflow Recomendado

### Escenario 1: Nueva Feature

```
1. Claude Web (Planificación)
   - "Quiero añadir sistema de reviews a productos"
   - Claude Web te ayuda con arquitectura y decisiones

2. Claude Code (Implementación Backend)
   /rules
   - "Crea modelo Review con campos: user, product, rating, comment"
   /sync
   - Verifica que necesitas actualizar frontend

3. Claude Code (Implementación Frontend)
   - "Actualiza tipos TypeScript para Review"
   - "Crea componente ReviewCard"
   /sync
   - Verifica que todo está sincronizado

4. Cursor (Refinamiento)
   - Detalles de UI
   - Correcciones rápidas
   - (Cursor lee .cursorrules automático)
```

---

### Escenario 2: Bug Fix

```
1. Claude Code (Análisis)
   /rules
   - "Tengo un bug en el logout. Los tokens no se invalidan"
   - Claude Code aplica checklist y sugiere causa raíz

2. Cursor (Fix Rápido)
   - Implementar la solución
   - (Cursor verifica calidad automáticamente)

3. Claude Code (Verificación)
   /sync
   - Confirmar que no rompiste sincronización FE/BE
```

---

### Escenario 3: Refactorización

```
1. Claude Web (Decisiones)
   - "Quiero refactorizar el sistema de autenticación"
   - Validar que es consistente con arquitectura

2. Claude Code (Ejecución)
   /rules
   /context
   - "Refactoriza authStore manteniendo compatibilidad"
   /sync
   - Verificar impacto en backend

3. Cursor (Detalles)
   - Ajustes finales
   - Limpieza de código
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Añadir Campo al Modelo

**Con Claude Code:**

```bash
# Sesión
/rules

# Prompt
"Añade un campo 'phone' (string, opcional) al modelo User"

# Claude Code responde:
"Voy a añadir el campo phone al modelo User.
Según el checklist de consistencia FE/BE, también necesitarás:

1. Backend:
   - Añadir phone en accounts/models.py
   - Actualizar UserSerializer en accounts/serializers.py
   - Crear migración

2. Frontend:
   - Actualizar tipo User en frontend/src/types/user.ts
   - Añadir: phone?: string;

3. Verificación:
   - Ejecutar /sync después de los cambios"

# Después de implementar:
/sync
# → Confirma que todo está sincronizado
```

---

### Ejemplo 2: Crear Nuevo Endpoint

**Con Claude Code:**

```bash
/rules

"Crea endpoint GET /api/v1/artisans/{slug}/stats/
que devuelva estadísticas del artesano"

# Claude Code:
"Voy a crear el endpoint. Según las reglas del proyecto:

1. Backend (shop/views.py):
   - Crear método stats() en ArtisanViewSet
   - Añadir ruta en urls.py

2. Frontend (lib/api/artisans.ts):
   - Crear función getArtisanStats(slug: string)
   - Tipo de retorno: ArtisanStats

3. TypeScript (types/artisan.ts):
   - Crear interface ArtisanStats {...}

¿Quieres que proceda?"

# Después:
/sync
# → Verifica que el endpoint tiene API service
```

---

### Ejemplo 3: Decisión Arquitectónica

**Con Claude Web:**

```
Contexto: docs/ai-assistants/CONTEXT_FOR_CLAUDE.md (ya cargado en proyecto)

Prompt: "Estoy considerando implementar notificaciones
en tiempo real. ¿Debería usar WebSockets, Server-Sent
Events, o polling? ¿Es consistente con la arquitectura?"

Claude Web analiza:
- Arquitectura actual (REST API)
- Deploy separado (Railway + Vercel)
- Django capabilities
- Next.js Server Components

Claude Web sugiere:
"Según la arquitectura del proyecto:

1. WebSockets requieren servidor stateful
   - ❌ No ideal para Railway (escala horizontal)
   - Necesitarías Redis para pub/sub

2. Server-Sent Events (SSE)
   - ✅ Compatible con REST
   - ✅ Next.js 15 soporta streaming
   - ⚠️ Solo server→client

3. Polling optimizado
   - ✅ Más simple, sin cambios arquitectónicos
   - ✅ Compatible con tu deploy actual
   - TanStack Query tiene polling automático

Recomendación: Empieza con polling + TanStack Query
Escala a SSE si el tráfico lo justifica"
```

---

## 🐛 Troubleshooting

### Problema 1: Claude Code no carga `/rules`

**Síntoma:**
```
/rules
Error: Command not found
```

**Solución:**
```bash
# Verificar que existe el archivo
ls -la .claude/commands/rules.md

# Si no existe, créalo:
mkdir -p .claude/commands
# Y copia el contenido del comando desde este doc
```

---

### Problema 2: Cursor no aplica reglas

**Síntoma:**
Cursor no sigue las convenciones del proyecto

**Diagnóstico:**
```bash
# Verificar que .cursorrules existe
cat .cursorrules | head -20

# Verificar tamaño
wc -l .cursorrules
# Debería ser ~823 líneas
```

**Solución:**
1. Cierra y abre Cursor
2. Verifica que el proyecto está en la raíz correcta
3. Si persiste, restaura desde backup:
   ```bash
   mv .cursorrules.backup .cursorrules
   ```

---

### Problema 3: `/sync` reporta muchas inconsistencias

**Síntoma:**
```
/sync
❌ 15 inconsistencias encontradas
```

**Esto es normal si:**
- No has ejecutado sync en mucho tiempo
- Acabas de hacer refactorización grande
- Hay cambios sin commitear

**Solución:**
```bash
# 1. Ver qué cambió recientemente
git status
git diff backend/*/serializers.py
git diff frontend/src/types/

# 2. Actualizar sistemáticamente
# Empieza por un modelo a la vez

# 3. Ejecuta sync después de cada corrección
/sync
```

---

### Problema 4: CONTEXT_FOR_CLAUDE.md desactualizado

**Síntoma:**
Claude Web da información incorrecta basada en contexto viejo

**Solución:**
```bash
# 1. Verificar versión
head -10 docs/ai-assistants/CONTEXT_FOR_CLAUDE.md
# Debería decir: v2.0.0 (2025-10-28)

# 2. Si es vieja, actualizar:
# - Revisar cambios arquitectónicos recientes
# - Actualizar secciones relevantes
# - Cambiar fecha y versión

# 3. Re-subir a Claude Web Project Knowledge
```

---

## 🔧 Mantenimiento

### Actualización Semanal (15 minutos)

```bash
# 1. Verificar consistencia
claude code
/sync

# 2. Si hay inconsistencias, corregir

# 3. Verificar que .cursorrules está actualizado
# ¿Hay nuevas convenciones? → Añadir
# ¿Hay patrones obsoletos? → Eliminar

# 4. Commit si hubo cambios
git add .cursorrules docs/ai-assistants/CONTEXT_FOR_CLAUDE.md
git commit -m "docs: actualizar reglas y contexto"
```

---

### Actualización al Completar Fase (1 hora)

```bash
# Cuando completes una fase del ROADMAP.md:

# 1. Actualizar CONTEXT_FOR_CLAUDE.md
# - Cambiar versión (v2.0.0 → v2.1.0)
# - Actualizar fecha
# - Añadir nuevos módulos a árbol
# - Actualizar tabla de endpoints
# - Documentar nuevas decisiones

# 2. Actualizar .cursorrules si:
# - Cambiaron convenciones
# - Nuevos patrones importantes
# - Cambios arquitectónicos críticos

# 3. Re-subir a Claude Web
# - Actualizar Project Knowledge con nueva versión

# 4. Commit
git add .
git commit -m "docs: actualizar contexto v2.1.0 - Fase X completada"
```

---

### Cuando Añadas Nuevo Módulo Django

```bash
# Ejemplo: Añades app 'notifications'

# 1. Actualizar CONTEXT_FOR_CLAUDE.md
# Añadir a árbol del monorepo:
├── backend/
│   ├── notifications/  # Sistema de notificaciones ← NUEVO

# Añadir a tabla de endpoints:
| Notifications | GET /api/v1/notifications/ | ... |

# 2. Actualizar .cursorrules (si tiene convenciones específicas)

# 3. Crear docs/
backend/docs/modules/notifications/README.md

# 4. Commit
git commit -m "docs: añadir módulo notifications al contexto"
```

---

## 📊 Resumen de Archivos

| Archivo | Tamaño | Para | Actualización |
|---------|--------|------|---------------|
| `.cursorrules` | 823 líneas | Cursor (automático) + Claude Code (`/rules`) | Cada 2 semanas |
| `CONTEXT_FOR_CLAUDE.md` | 1,100 líneas | Claude Web + Claude Code (`/context`) | Al completar fase |
| `.claude/commands/rules.md` | 15 líneas | Claude Code (`/rules`) | Raramente |
| `.claude/commands/context.md` | 12 líneas | Claude Code (`/context`) | Raramente |
| `.claude/commands/sync.md` | 25 líneas | Claude Code (`/sync`) | Raramente |

---

## 🎯 Checklist de Uso Diario

### ✅ Al Abrir Cursor
- [ ] ~~Nada~~ (carga automático)

### ✅ Al Abrir Claude Code
- [ ] Ejecutar `/rules`
- [ ] Verificar que cargó correctamente

### ✅ Antes de Cambiar Backend
- [ ] Recordar checklist FE/BE

### ✅ Después de Cambiar Backend
- [ ] Ejecutar `/sync` en Claude Code
- [ ] Corregir inconsistencias si las hay

### ✅ Antes de Commit Grande
- [ ] Ejecutar `/sync`
- [ ] Verificar que todo está sincronizado

### ✅ Semanal
- [ ] Ejecutar `/sync` para mantenimiento
- [ ] Actualizar `.cursorrules` si hay nuevos patrones

### ✅ Al Completar Fase
- [ ] Actualizar `CONTEXT_FOR_CLAUDE.md`
- [ ] Subir nueva versión a Claude Web
- [ ] Commit de cambios de docs

---

## 📚 Referencias Rápidas

### Comandos Más Usados

```bash
# Claude Code
/rules          # Cargar reglas (inicio sesión)
/sync           # Verificar FE/BE (después cambios)
/context        # Contexto profundo (decisiones)

# Git
git status      # Ver cambios
git diff        # Ver diferencias detalladas

# Desarrollo
cd backend && python manage.py runserver
cd frontend && npm run dev
```

### Archivos Importantes

```bash
.cursorrules                             # Reglas del proyecto
docs/ai-assistants/CONTEXT_FOR_CLAUDE.md # Contexto completo
docs/ai-assistants/SETUP_GUIDE.md        # Esta guía
ROADMAP.md                               # Plan de desarrollo
backend/README.md                        # Docs backend
frontend/README.md             # Docs frontend (si existe)
```

---

## 🤝 Contribución

Si encuentras algo que mejorar en este setup:

1. **Documenta el problema** en `docs/troubleshooting/`
2. **Actualiza este archivo** con la solución
3. **Comparte con el equipo** (si trabajan varios)

---

## 📝 Changelog

### v1.0 (2025-10-28)
- ✅ Setup inicial completo
- ✅ Optimización de `.cursorrules` (23% reducción)
- ✅ Creación de `CONTEXT_FOR_CLAUDE.md` v2.0.0
- ✅ 3 comandos slash para Claude Code
- ✅ Documentación completa de uso

---

**¿Preguntas?** Consulta:
- `CONTEXT_FOR_CLAUDE.md` - Contexto del proyecto
- `.cursorrules` - Reglas específicas
- `docs/` - Documentación adicional

---

**🎉 Setup completado! Ya puedes usar Cursor, Claude Code y Claude Web con contexto completo.**
