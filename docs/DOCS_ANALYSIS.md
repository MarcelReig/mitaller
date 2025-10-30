# 📊 Análisis de Documentación del Proyecto

> **Fecha:** 2025-10-30
> **Total archivos .md:** 97
> **Propósito:** Identificar archivos críticos, obsoletos y redundantes

---

## 🎯 CLASIFICACIÓN DE ARCHIVOS

### 🔴 CRÍTICOS - Actualizar SIEMPRE después de tareas importantes

Estos archivos deben actualizarse cada vez que completas una feature importante, cambias la arquitectura, o al finalizar una fase:

| Archivo | Qué actualizar | Cuándo |
|---------|---------------|---------|
| **`.cursorrules`** | Convenciones, patrones, reglas | Nuevos patrones arquitectónicos, cambios en nomenclatura |
| **`docs/ai-assistants/CONTEXT_FOR_CLAUDE.md`** | Arquitectura, endpoints, decisiones | Cada fase completada, nuevos módulos |
| **`README.md`** (raíz) | Overview del proyecto, quick start | Cambios en stack, setup inicial |
| **`ROADMAP.md`** | Progreso de fases, timeline | Al completar fases, reorganizar prioridades |

**Total: 4 archivos**

---

### 🟡 IMPORTANTES - Actualizar cuando haya cambios relevantes

| Archivo | Descripción | Cuándo actualizar |
|---------|-------------|-------------------|
| `docs/ai-assistants/SETUP_GUIDE.md` | Guía de uso de Claude/Cursor | Nuevos comandos, cambios en workflow |
| `backend/README.md` | Setup y estructura backend | Nuevas apps Django, cambios en dependencias |
| `frontend/README.md` | Setup y estructura frontend | Nuevas librerías, cambios en build |
| `docs/README.md` | Índice de toda la documentación | Nuevos docs añadidos o reorganización |

**Total: 4 archivos**

---

### 🟢 ESPECÍFICOS DE MÓDULO - Actualizar solo cuando cambien esos módulos

#### Backend - Implementation Summaries

| Archivo | Módulo | Estado actual |
|---------|---------|--------------|
| `backend/docs/modules/accounts/IMPLEMENTATION_SUMMARY.md` | Autenticación | ✅ Actualizado |
| `backend/docs/modules/artisans/...` | Artesanos | ⚠️ Verificar después de migración artists→artisans |
| `backend/docs/modules/shop/IMPLEMENTATION_SUMMARY.md` | Tienda | ✅ Actualizado (multi-vendor) |
| `backend/docs/modules/shop/MULTI_VENDOR_IMPLEMENTATION.md` | Multi-vendor | ✅ Actualizado |
| `backend/docs/modules/works/IMPLEMENTATION_SUMMARY.md` | Portfolio | ✅ Actualizado |
| `backend/docs/modules/orders/IMPLEMENTATION_SUMMARY.md` | Pedidos | ✅ Actualizado |
| `backend/docs/modules/payments/...` | Pagos Stripe | ✅ Actualizado |

#### Frontend - Features

| Archivo | Feature | Estado actual |
|---------|---------|--------------|
| `frontend/docs/features/TIENDA_MULTI_VENDOR.md` | Tienda multi-vendor | ✅ Actualizado |
| `frontend/docs/features/ON_DEMAND_REVALIDATION.md` | Revalidación Next.js | ✅ Relevante |
| `frontend/docs/features/FASE2_GALERIA_LIGHTBOX.md` | Galería lightbox | ✅ Relevante |

**Total: ~15 archivos**

**Regla:** Solo actualizar cuando modifiques ese módulo/feature específico.

---

### 🔵 HISTÓRICOS/REGISTROS - NO actualizar (son snapshots en el tiempo)

Estos documentos son **registros históricos** de problemas resueltos y decisiones tomadas. **No se deben modificar**, solo consultar.

#### Troubleshooting (5 archivos)

| Archivo | Descripción | Valor |
|---------|-------------|-------|
| `docs/troubleshooting/PROBLEMA_LOGOUT.md` | Fix problema logout | 📚 Referencia histórica |
| `docs/troubleshooting/PROBLEMA_LOGIN_REGISTRO.md` | Fix login/registro | 📚 Referencia histórica |
| `docs/troubleshooting/FIX_EDITAR_PERFIL_REDIRIGE_A_LOGIN.md` | Fix perfil | 📚 Referencia histórica |
| `docs/troubleshooting/RESUMEN_FIX_LOGIN_REGISTRO.md` | Resumen fix auth | 📚 Referencia histórica |
| `docs/troubleshooting/RESUMEN_SESION_FIX_AUTH.md` | Resumen sesión auth | 📚 Referencia histórica |

#### Maintenance (5 archivos)

| Archivo | Descripción | Valor |
|---------|-------------|-------|
| `docs/maintenance/ANALISIS_RUTAS_Y_VISTAS.md` | Análisis limpieza rutas | 📚 Registro de refactorización |
| `docs/maintenance/CAMBIOS_APLICADOS.md` | Log de cambios | 📚 Registro de refactorización |
| `docs/maintenance/RESUMEN_LIMPIEZA.md` | Resumen limpieza | 📚 Registro de refactorización |
| `docs/maintenance/REORGANIZACION_SCRIPTS_DEBUG.md` | Reorganización scripts | 📚 Registro de refactorización |
| `docs/maintenance/ANALISIS_SCRIPTS_DEBUG.md` | Análisis scripts | 📚 Registro de refactorización |

#### Phases (6 archivos)

| Archivo | Descripción | Valor |
|---------|-------------|-------|
| `docs/phases/FASE2_CHECKLIST.md` | Checklist Fase 2 | 📚 Registro histórico |
| `docs/phases/FASE2_ESTRUCTURA_VISUAL.md` | Estructura Fase 2 | 📚 Registro histórico |
| `docs/phases/FASE2_RESUMEN_EJECUTIVO.md` | Resumen Fase 2 | 📚 Registro histórico |
| `docs/phases/FASE3B_IMPLEMENTACION.md` | Implementación Fase 3B | 📚 Registro histórico |
| `docs/phases/QUICK_START_FASE1.md` | Quick Start Fase 1 | 📚 Registro histórico |
| `docs/phases/RESUMEN_FASE1.md` | Resumen Fase 1 | 📚 Registro histórico |

**Total: 16 archivos**

**Valor:** Estos docs son como "commits de documentación". Útiles para entender decisiones pasadas.

---

### 🟣 TEMPLATES - NO tocar

| Archivo | Descripción |
|---------|-------------|
| `docs/.templates/feature-template.md` | Template para documentar features |
| `docs/.templates/troubleshooting-template.md` | Template para troubleshooting |

**Total: 2 archivos**

---

### ⚪ GUÍAS Y REFERENCIAS - Actualizar raramente

| Archivo | Descripción | Cuándo actualizar |
|---------|-------------|-------------------|
| `frontend/docs/guides/HOOKS_GUIDE.md` | Guía de hooks | Nuevos hooks importantes |
| `frontend/docs/guides/LAYOUTS_GUIDE.md` | Guía de layouts | Cambios en layout system |
| `frontend/docs/guides/TYPES_GUIDE.md` | Guía de tipos | Nuevos patrones de tipos |
| `backend/docs/modules/accounts/AUTH_API_GUIDE.md` | Guía API auth | Nuevos endpoints auth |
| `backend/docs/modules/accounts/USER_MODEL_GUIDE.md` | Guía modelo User | Cambios en modelo User |
| `backend/docs/modules/payments/STRIPE_CONNECT_GUIDE.md` | Guía Stripe Connect | Cambios en integración Stripe |

**Total: ~10 archivos**

---

### 🔧 COMANDOS CLAUDE - Raramente actualizar

| Archivo | Propósito |
|---------|-----------|
| `.claude/commands/rules.md` | Carga `.cursorrules` |
| `.claude/commands/context.md` | Carga `CONTEXT_FOR_CLAUDE.md` |
| `.claude/commands/sync.md` | Verifica consistencia FE/BE |

**Total: 3 archivos**

---

## ⚠️ ARCHIVOS OBSOLETOS O REDUNDANTES

### 🗑️ CANDIDATOS PARA ELIMINAR

#### 1. Meta-documentos ya cumplidos

| Archivo | Razón | Acción recomendada |
|---------|-------|-------------------|
| `docs/REORGANIZACION_DOCS.md` | Documenta reorganización completada en Oct 2025 | ❌ ELIMINAR - La reorganización ya está hecha |
| `docs/CURSOR_RULES_CHANGELOG.md` | Changelog de .cursorrules (info ya en CONTEXT_FOR_CLAUDE) | ❌ ELIMINAR - Redundante con changelog de CONTEXT |

**Impacto:** Bajo riesgo. Son documentos sobre la documentación misma.

#### 2. Componente obsoleto (singular vs plural)

| Directorio | Estado | Acción recomendada |
|-----------|---------|-------------------|
| `frontend/src/components/artisan/` | Carpeta singular - posiblemente obsoleta | ⚠️ VERIFICAR - Si no se usa, eliminar |
| `frontend/src/components/artisans/` | Carpeta plural - la activa | ✅ MANTENER |

**Verificación necesaria:**
```bash
# Buscar imports de la carpeta singular
grep -r "from.*components/artisan" frontend/src --exclude-dir=node_modules
```

#### 3. Documentación duplicada (español + inglés)

| Backend Payments | Estado |
|-----------------|--------|
| `backend/docs/modules/payments/RESUMEN_IMPLEMENTACION.md` | Español |
| `backend/docs/modules/payments/IMPLEMENTATION_SUMMARY.md` | Debería existir en inglés |

**Acción:** Verificar si hay duplicados y mantener solo inglés (por consistencia con otros módulos).

#### 4. Features muy específicas de fases pasadas

| Archivo | Razón |
|---------|-------|
| `docs/features/ARTIST_HEADER_REDESIGN.md` | Redesign completado |
| `docs/features/REDESIGN_SUMMARY.md` | Resumen de redesign completado |
| `docs/features/COVER_IMAGE_TESTS_RESULTS.md` | Resultados de tests - ya implementado |
| `docs/features/COVER_IMAGE_VERIFICATION.md` | Verificación - ya completada |
| `docs/features/CORRECCION_TRANSFORMACIONES_CLOUDINARY.md` | Corrección aplicada |
| `docs/features/IMPLEMENTACION_SIGNED_UPLOADS.md` | Ya implementado en CLOUDINARY_SIGNED_UPLOADS |
| `docs/features/PERFIL_PUBLICO_ARTISTA.md` | Ya implementado |

**Acción:** Mover a `docs/phases/completed/` o eliminar si la info está en IMPLEMENTATION_SUMMARY.

---

## 📋 RESUMEN DE ARCHIVOS POR ACCIÓN

### ✅ Mantener y actualizar (23 archivos)

- 4 Críticos
- 4 Importantes
- 15 Específicos de módulo

### 📚 Mantener sin modificar (16 archivos)

- Troubleshooting, Maintenance, Phases (registros históricos)

### 🗑️ Eliminar (2-10 archivos)

- 2 Meta-documentos cumplidos
- 1 Componente obsoleto (verificar)
- 7 Features completadas (mover o eliminar)

### ⚠️ Verificar (20 archivos)

- READMEs de módulos individuales
- Guías que podrían estar desactualizadas

---

## 🎯 RECOMENDACIONES

### 1. Crear carpeta de archivo

```bash
mkdir -p docs/archive/2025-10
mv docs/REORGANIZACION_DOCS.md docs/archive/2025-10/
mv docs/CURSOR_RULES_CHANGELOG.md docs/archive/2025-10/
mv docs/features/ARTIST_HEADER_REDESIGN.md docs/archive/2025-10/features/
# ... etc
```

### 2. Mantener solo documentación activa

**Principio:** Si no lo vas a consultar en los próximos 3 meses, archívalo.

### 3. Consistencia de idioma

**Decisión necesaria:** ¿Español o Inglés?
- Actual: Mezcla (RESUMEN_IMPLEMENTACION vs IMPLEMENTATION_SUMMARY)
- Recomendado: **Inglés** para consistency con código y stack internacional

### 4. Estructura final recomendada

```
docs/
├── ai-assistants/           # 🔴 CRÍTICO
│   ├── CONTEXT_FOR_CLAUDE.md
│   ├── SETUP_GUIDE.md
│   └── README.md
├── .templates/              # Templates
├── architecture/            # Decisiones arquitectónicas actuales
├── auth/                    # Sistema de auth actual
├── deployment/              # Deployment guides
├── features/                # Features ACTIVAS solo
├── guides/                  # Guías de referencia
├── troubleshooting/         # 📚 Registro de problemas resueltos
├── maintenance/             # 📚 Registro de refactorizaciones
├── phases/                  # 📚 Registro histórico de fases
└── archive/                 # 🗑️ Docs obsoletos pero conservados
    └── 2025-10/
        ├── features/        # Features completadas
        └── meta/            # Meta-docs cumplidos
```

---

## 🤖 SIGUIENTE PASO: Comando /sync-docs

Ver siguiente archivo: `.claude/commands/sync-docs.md`
