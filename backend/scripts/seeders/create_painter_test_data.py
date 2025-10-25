#!/usr/bin/env python
"""
Script para crear un artesano PINTOR con varias obras de portfolio.

Crea:
- 1 Pintor (usuario + perfil) con datos completos
- 6 Obras de pintura en su portfolio
- Imágenes de prueba usando Picsum (placeholders consistentes)
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, UserRole
from artists.models import ArtistProfile, CraftType, MenorcaLocation
from works.models import Work, WorkCategory


def create_painter_with_works():
    """Crear pintor con obras de portfolio."""
    
    print("🎨 Creando PINTOR con obras de portfolio...\n")
    
    # 1. Crear usuario pintor
    print("1️⃣ Creando usuario pintor...")
    painter_user, created = User.objects.get_or_create(
        email='pintor@test.com',
        defaults={
            'username': 'maria_pintura',
            'first_name': 'Maria',
            'last_name': 'Soler',
            'role': UserRole.ARTISAN,
            'is_approved': True  # Usuario aprobado para poder hacer login
        }
    )
    
    if created:
        painter_user.set_password('pintor123')
        painter_user.save()
        print(f"   ✅ Usuario creado: {painter_user.email}")
    else:
        print(f"   ℹ️  Usuario ya existe: {painter_user.email}")
    
    # 2. Configurar perfil de artista (el signal lo crea automáticamente)
    print("\n2️⃣ Configurando perfil de artista...")
    artist_profile = painter_user.artist_profile
    artist_profile.display_name = 'Maria Soler - Atelier de Pintura'
    artist_profile.craft_type = CraftType.OTHER  # No hay "pintura" en CraftType, usamos OTHER
    artist_profile.location = MenorcaLocation.CIUTADELLA
    artist_profile.bio = """Pintora contemporánea especializada en paisajes mediterráneos y abstractos.
    
Llevo más de 15 años explorando la luz y el color de Menorca a través de diferentes técnicas: óleo, acrílico y acuarela. Mi trabajo busca capturar la esencia del Mediterráneo, sus tonos azules y ocres, la textura de sus calas y el movimiento del mar.

Cada obra es una conversación entre la tradición pictórica y la experimentación contemporánea. Trabajo desde mi atelier en Ciutadella, donde imparto también talleres de pintura."""
    
    artist_profile.instagram = 'mariasoler_art'
    artist_profile.phone = '+34 971 123 456'
    artist_profile.website = 'https://mariasoler-art.com'
    artist_profile.is_featured = True  # Artista destacada
    
    artist_profile.save()
    print(f"   ✅ Perfil: {artist_profile.display_name}")
    print(f"   📍 Ubicación: {artist_profile.get_location_display()}")
    print(f"   🎨 Tipo: {artist_profile.get_craft_type_display()}")
    
    # 3. Crear obras de portfolio
    print("\n3️⃣ Creando obras de portfolio...")
    
    obras_data = [
        {
            'title': 'Cala en Turqueta',
            'description': 'Óleo sobre lienzo, 80x100cm. Representa la icónica cala menorquina con su característico color turquesa. Trabajo de 3 meses capturando la luz del atardecer.',
            'thumbnail_url': 'https://picsum.photos/seed/cala-turqueta/800/600',
            'images': [
                'https://picsum.photos/seed/cala-turqueta-1/1200/900',
                'https://picsum.photos/seed/cala-turqueta-2/800/600',
                'https://picsum.photos/seed/cala-turqueta-3/800/600'
            ],
            'is_featured': True,
            'display_order': 1
        },
        {
            'title': 'Abstracción Mediterránea No. 7',
            'description': 'Acrílico sobre madera, 120x90cm. Serie de abstracciones inspiradas en los colores y texturas de la costa menorquina. Técnica mixta con arena y pigmentos naturales.',
            'thumbnail_url': 'https://picsum.photos/seed/abstraccion-7/800/600',
            'images': [
                'https://picsum.photos/seed/abstraccion-7-1/1200/900',
                'https://picsum.photos/seed/abstraccion-7-2/800/600'
            ],
            'is_featured': True,
            'display_order': 2
        },
        {
            'title': 'Barca en el Puerto',
            'description': 'Acuarela sobre papel, 50x70cm. Vista del puerto de Ciutadella al amanecer. Captura la tranquilidad del puerto antes del bullicio del día.',
            'thumbnail_url': 'https://picsum.photos/seed/barca-puerto/800/600',
            'images': [
                'https://picsum.photos/seed/barca-puerto-1/1200/900'
            ],
            'is_featured': False,
            'display_order': 3
        },
        {
            'title': 'Camí de Cavalls',
            'description': 'Óleo sobre lienzo, 70x90cm. El histórico camino que rodea Menorca. Juego de luces y sombras entre los pinos y el mar al fondo.',
            'thumbnail_url': 'https://picsum.photos/seed/cami-cavalls/800/600',
            'images': [
                'https://picsum.photos/seed/cami-cavalls-1/1200/900',
                'https://picsum.photos/seed/cami-cavalls-2/800/600'
            ],
            'is_featured': False,
            'display_order': 4
        },
        {
            'title': 'Serie Azules',
            'description': 'Tríptico acrílico, 3 piezas de 40x60cm cada una. Exploración monocromática de los azules del Mediterráneo, desde el azul cobalto profundo hasta el celeste etéreo.',
            'thumbnail_url': 'https://picsum.photos/seed/serie-azules/800/600',
            'images': [
                'https://picsum.photos/seed/serie-azules-1/1200/900',
                'https://picsum.photos/seed/serie-azules-2/800/600',
                'https://picsum.photos/seed/serie-azules-3/800/600'
            ],
            'is_featured': False,
            'display_order': 5
        },
        {
            'title': 'Atardecer en Es Castell',
            'description': 'Óleo sobre lienzo, 100x80cm. El característico atardecer rojizo visto desde Es Castell. Una de mis obras más vendidas en exposiciones.',
            'thumbnail_url': 'https://picsum.photos/seed/atardecer-castell/800/600',
            'images': [
                'https://picsum.photos/seed/atardecer-castell-1/1200/900',
                'https://picsum.photos/seed/atardecer-castell-2/800/600',
                'https://picsum.photos/seed/atardecer-castell-3/800/600'
            ],
            'is_featured': True,
            'display_order': 6
        }
    ]
    
    created_works = []
    for obra_data in obras_data:
        work, created = Work.objects.get_or_create(
            artist=artist_profile,
            title=obra_data['title'],
            defaults={
                'description': obra_data['description'],
                'category': WorkCategory.PAINTING,
                'thumbnail_url': obra_data['thumbnail_url'],
                'images': obra_data['images'],
                'is_featured': obra_data['is_featured'],
                'display_order': obra_data['display_order']
            }
        )
        
        if created:
            print(f"   ✅ {work.title}")
            print(f"      {'⭐ DESTACADA' if work.is_featured else '  Normal'} | {len(work.images)} imágenes adicionales")
            created_works.append(work)
        else:
            print(f"   ℹ️  Ya existe: {work.title}")
    
    # 4. Actualizar contadores en perfil
    artist_profile.total_works = artist_profile.works.count()
    artist_profile.save()
    
    # 5. Resumen final
    print("\n" + "=" * 70)
    print("🎨 PINTOR CON PORTFOLIO CREADO EXITOSAMENTE")
    print("=" * 70)
    
    print(f"\n👤 CREDENCIALES DE ACCESO:")
    print(f"   📧 Email: {painter_user.email}")
    print(f"   🔑 Password: pintor123")
    print(f"   👤 Username: {painter_user.username}")
    print(f"   🎭 Rol: {painter_user.get_role_display()}")
    
    print(f"\n🎨 PERFIL DE ARTISTA:")
    print(f"   Nombre: {artist_profile.display_name}")
    print(f"   Ubicación: {artist_profile.get_location_display()}, Menorca")
    print(f"   Especialidad: Pintura")
    print(f"   Instagram: @{artist_profile.instagram}")
    print(f"   Web: {artist_profile.website}")
    print(f"   Slug URL: /artistas/{artist_profile.slug}/")
    
    print(f"\n🖼️  OBRAS DE PORTFOLIO: {artist_profile.total_works}")
    for work in artist_profile.works.all():
        featured_icon = "⭐" if work.is_featured else "  "
        print(f"   {featured_icon} {work.title} ({work.total_images} imágenes)")
    
    print(f"\n\n🚀 PRUEBA EL SISTEMA:")
    
    print("\n1️⃣  Ver perfil público del pintor:")
    print(f"   GET http://localhost:8000/api/v1/artists/{artist_profile.slug}/")
    
    print("\n2️⃣  Ver obras del pintor:")
    print(f"   GET http://localhost:8000/api/v1/works/?artist={artist_profile.id}")
    
    print("\n3️⃣  Login como pintor:")
    print(f"""
curl -X POST http://localhost:8000/api/v1/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{{"email": "{painter_user.email}", "password": "pintor123"}}'
""")
    
    print("\n4️⃣  Ver mi portfolio (autenticado):")
    print("""
curl http://localhost:8000/api/v1/works/ \\
  -H "Authorization: Bearer {ACCESS_TOKEN}"
""")
    
    print("\n5️⃣  Frontend - Ver en navegador:")
    print(f"   http://localhost:3000/artistas/{artist_profile.slug}")
    
    print("\n✅ ¡Listo para testar el sistema de portfolio!\n")


if __name__ == '__main__':
    create_painter_with_works()

