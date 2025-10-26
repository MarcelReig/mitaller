#!/bin/bash

# Script para resetear la base de datos desde cero
# MiTaller Backend - Reset Database
#
# ⚠️ ADVERTENCIA: SOLO PARA DESARROLLO LOCAL
# ⚠️ NO EJECUTAR EN PRODUCCIÓN
#
# Este script elimina TODA la base de datos y migraciones.

set -e  # Exit on error

echo "🔄 Reseteando base de datos de MiTaller..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Guardar email del admin (puedes editarlo aquí)
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@mitaller.art}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo -e "${YELLOW}⚠️  Este script va a:${NC}"
echo "  1. Eliminar TODAS las migraciones de las apps"
echo "  2. Eliminar la base de datos PostgreSQL"
echo "  3. Crear la base de datos desde cero"
echo "  4. Generar nuevas migraciones"
echo "  5. Aplicar todas las migraciones"
echo "  6. Crear superusuario: $ADMIN_EMAIL"
echo ""
read -p "¿Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Cancelado"
    exit 1
fi

echo ""
echo -e "${YELLOW}📁 Paso 1: Eliminando archivos de migración antiguos...${NC}"

# Lista de apps con migraciones
APPS="accounts artisans artists orders payments shop works profiles admin_panel"

for app in $APPS; do
    if [ -d "$app/migrations" ]; then
        echo "  🗑️  Limpiando migraciones de $app..."
        find "$app/migrations" -type f -name "*.py" ! -name "__init__.py" -delete
        find "$app/migrations" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ Migraciones eliminadas${NC}"
echo ""

echo -e "${YELLOW}🗄️  Paso 2: Eliminando base de datos PostgreSQL...${NC}"

# Obtener nombre de la base de datos desde .env o usar default
DB_NAME=$(grep DATABASE_URL .env 2>/dev/null | cut -d'/' -f4 || echo "mitaller_dev")

# Dropear la base de datos (requiere que PostgreSQL esté corriendo)
PGPASSWORD=postgres psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || {
    echo -e "${RED}⚠️  No se pudo conectar a PostgreSQL. ¿Está corriendo?${NC}"
    echo "Intenta: docker-compose up -d"
    exit 1
}

echo -e "${GREEN}✅ Base de datos eliminada${NC}"
echo ""

echo -e "${YELLOW}🏗️  Paso 3: Creando base de datos nueva...${NC}"

PGPASSWORD=postgres psql -U postgres -h localhost -c "CREATE DATABASE $DB_NAME;"

echo -e "${GREEN}✅ Base de datos creada${NC}"
echo ""

echo -e "${YELLOW}🔧 Paso 4: Generando migraciones nuevas...${NC}"

python manage.py makemigrations

echo -e "${GREEN}✅ Migraciones generadas${NC}"
echo ""

echo -e "${YELLOW}⬆️  Paso 5: Aplicando migraciones...${NC}"

python manage.py migrate

echo -e "${GREEN}✅ Migraciones aplicadas${NC}"
echo ""

echo -e "${YELLOW}👤 Paso 6: Creando superusuario...${NC}"

# Crear superusuario de forma no interactiva
DJANGO_SUPERUSER_PASSWORD="$ADMIN_PASSWORD" python manage.py createsuperuser \
  --email "$ADMIN_EMAIL" \
  --username admin \
  --noinput 2>/dev/null || echo "  ⚠️  Superusuario ya existe o error al crear"

echo -e "${GREEN}✅ Superusuario creado${NC}"
echo ""
echo -e "${GREEN}🎉 ¡Base de datos reseteada exitosamente!${NC}"
echo ""
echo "📝 Credenciales del admin:"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   python manage.py runserver"
echo ""

