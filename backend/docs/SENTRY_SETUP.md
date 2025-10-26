# 🔍 Sentry - Configuración para Producción

## ¿Qué es Sentry?

Sistema de monitoreo de errores que te alerta cuando algo falla en producción con stack traces completos y contexto de usuario.

## Estado Actual

✅ **Backend configurado** - Listo para activar en producción
⏳ **Frontend** - Opcional, configurar después si es necesario

## Cómo Activar en Producción

### 1. Crear cuenta en Sentry (5 minutos)

1. Ve a https://sentry.io/signup/
2. Crea cuenta (gratis hasta 5K errores/mes)
3. Crea nuevo proyecto "mitaller-backend" (tipo: Django)
4. Copia el DSN que te dan (formato: `https://xxx@sentry.io/123456`)

### 2. Configurar variables de entorno

En tu servidor de producción (Render, Railway, etc):

```bash
SENTRY_DSN=https://tu-sentry-dsn@sentry.io/tu-project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=mitaller@1.0.0
DEBUG=False  # ¡Importante! Sentry solo se activa cuando DEBUG=False
```

### 3. Deploy y verificar

```bash
# Después del deploy, verás en logs:
✅ Sentry iniciado - Entorno: production

# O si falta el DSN:
⚠️ SENTRY_DSN no configurado - Monitoreo de errores desactivado
```

### 4. Probar que funciona

Forzar un error de prueba:

```python
# En cualquier view, temporalmente:
def test_sentry(request):
    raise Exception("Test de Sentry - Si ves esto en Sentry, funciona!")
```

Accede a esa URL y deberías recibir el error en tu dashboard de Sentry.

## Variables de Configuración

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SENTRY_DSN` | URL única de tu proyecto | Requerido |
| `SENTRY_ENVIRONMENT` | production/staging/dev | `production` |
| `SENTRY_RELEASE` | Versión de la app | `mitaller@1.0.0` |
| `SENTRY_TRACES_SAMPLE_RATE` | % de requests a monitorear (0.0-1.0) | `0.1` (10%) |

## Buenas Prácticas

### ✅ HACER:
- Revisar Sentry diariamente los primeros días después del deploy
- Configurar alertas por email/Slack para errores críticos
- Incrementar `TRACES_SAMPLE_RATE` si necesitas más datos de performance

### ❌ NO HACER:
- Activar Sentry en desarrollo local (genera ruido innecesario)
- Poner `TRACES_SAMPLE_RATE=1.0` en producción (costoso)
- Ignorar errores recurrentes en Sentry

## Plan Gratuito

- ✅ 5,000 errores/mes
- ✅ 1 proyecto
- ✅ 30 días de retención
- ✅ Alertas por email
- ✅ Integraciones básicas (Slack, GitHub)

**Suficiente para MVP hasta ~1000 usuarios.**

## Troubleshooting

### Sentry no captura errores

1. Verificar que `DEBUG=False`
2. Verificar que `SENTRY_DSN` esté configurado
3. Revisar logs del servidor: debe decir "✅ Sentry iniciado"
4. Forzar un error de prueba

### Demasiadas alertas

```python
# settings.py - Ajustar para reducir ruido
sentry_sdk.init(
    ignore_errors=[KeyError, ValueError],  # Ignorar errores comunes
    traces_sample_rate=0.05,  # Reducir a 5%
)
```

## Recursos

- [Documentación oficial](https://docs.sentry.io/platforms/python/guides/django/)
- [Dashboard Sentry](https://sentry.io/)
- [Pricing](https://sentry.io/pricing/)

---

**Configurado:** Octubre 2025  
**Versión Sentry SDK:** 2.42.1

