#!/bin/bash
# Script para gestionar dependencias de forma segura
# Uso: ./update_deps.sh [comando]

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en backend/
if [ ! -f "manage.py" ]; then
    echo -e "${RED}Error: Ejecuta este script desde mitaller/backend/${NC}"
    exit 1
fi

# Activar venv
if [ ! -d "venv" ]; then
    echo -e "${RED}Error: No se encuentra el venv${NC}"
    exit 1
fi

source venv/bin/activate

# Función: Mostrar paquetes desactualizados
outdated() {
    echo -e "${YELLOW}=== Paquetes Desactualizados ===${NC}"
    pip list --outdated
}

# Función: Actualizar paquete específico
update() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Especifica el paquete a actualizar${NC}"
        echo "Uso: ./update_deps.sh update <paquete>"
        exit 1
    fi
    
    echo -e "${YELLOW}=== Actualizando $1 ===${NC}"
    pip install --upgrade "$1"
    
    echo -e "${GREEN}=== Regenerando requirements.txt ===${NC}"
    pip freeze > requirements.txt
    
    echo -e "${GREEN}✅ $1 actualizado correctamente${NC}"
}

# Función: Actualizar TODOS los paquetes (CUIDADO)
update_all() {
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto actualizará TODOS los paquetes${NC}"
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelado"
        exit 0
    fi
    
    echo -e "${YELLOW}=== Actualizando todos los paquetes ===${NC}"
    pip install --upgrade -r requirements.txt
    
    echo -e "${GREEN}=== Regenerando requirements.txt ===${NC}"
    pip freeze > requirements.txt
    
    echo -e "${GREEN}✅ Todos los paquetes actualizados${NC}"
}

# Función: Instalar nueva dependencia
install() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Especifica el paquete a instalar${NC}"
        echo "Uso: ./update_deps.sh install <paquete>"
        exit 1
    fi
    
    echo -e "${YELLOW}=== Instalando $1 ===${NC}"
    pip install "$1"
    
    echo -e "${GREEN}=== Regenerando requirements.txt ===${NC}"
    pip freeze > requirements.txt
    
    echo -e "${GREEN}✅ $1 instalado correctamente${NC}"
}

# Función: Verificar dependencias
check() {
    echo -e "${YELLOW}=== Verificando dependencias ===${NC}"
    pip check
    
    echo -e "\n${YELLOW}=== Ejecutando tests ===${NC}"
    python manage.py test --no-input
    
    echo -e "${GREEN}✅ Todo OK${NC}"
}

# Función: Ver info de paquete
info() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Especifica el paquete${NC}"
        echo "Uso: ./update_deps.sh info <paquete>"
        exit 1
    fi
    
    echo -e "${YELLOW}=== Información de $1 ===${NC}"
    pip show "$1"
}

# Función: Sincronizar con requirements.txt
sync() {
    echo -e "${YELLOW}=== Sincronizando con requirements.txt ===${NC}"
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Sincronizado${NC}"
}

# Función: Ayuda
help() {
    echo "Gestión de Dependencias - MiTaller.art"
    echo ""
    echo "Uso: ./update_deps.sh [comando] [argumentos]"
    echo ""
    echo "Comandos disponibles:"
    echo "  outdated              - Ver paquetes desactualizados"
    echo "  update <paquete>      - Actualizar paquete específico"
    echo "  update-all            - Actualizar TODOS los paquetes (CUIDADO)"
    echo "  install <paquete>     - Instalar nuevo paquete"
    echo "  check                 - Verificar dependencias y ejecutar tests"
    echo "  info <paquete>        - Ver información de un paquete"
    echo "  sync                  - Sincronizar con requirements.txt"
    echo "  help                  - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./update_deps.sh outdated"
    echo "  ./update_deps.sh update stripe"
    echo "  ./update_deps.sh install pytest"
    echo "  ./update_deps.sh check"
}

# Main
case "$1" in
    outdated)
        outdated
        ;;
    update)
        update "$2"
        ;;
    update-all)
        update_all
        ;;
    install)
        install "$2"
        ;;
    check)
        check
        ;;
    info)
        info "$2"
        ;;
    sync)
        sync
        ;;
    help|"")
        help
        ;;
    *)
        echo -e "${RED}Comando desconocido: $1${NC}"
        echo ""
        help
        exit 1
        ;;
esac

