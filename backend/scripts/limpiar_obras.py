#!/usr/bin/env python
"""
Script para limpiar las obras con URLs de Unsplash.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from works.models import Work

def limpiar_obras():
    """Eliminar obras que tienen URLs de Unsplash."""
    
    print("🧹 Limpiando obras con URLs de Unsplash...\n")
    
    # Buscar obras con URLs de Unsplash
    obras_unsplash = Work.objects.filter(thumbnail_url__icontains='unsplash')
    count = obras_unsplash.count()
    
    if count == 0:
        print("✅ No hay obras con URLs de Unsplash.\n")
        return
    
    print(f"📋 Encontradas {count} obras con URLs de Unsplash:")
    for obra in obras_unsplash:
        print(f"   - {obra.title} (ID: {obra.id})")
    
    print(f"\n❌ Eliminando {count} obras...")
    obras_unsplash.delete()
    
    print("✅ Obras eliminadas correctamente.\n")
    print("🔄 Ahora puedes ejecutar: python create_painter_test_data.py\n")


if __name__ == '__main__':
    limpiar_obras()

