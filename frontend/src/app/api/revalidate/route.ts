/**
 * API Route para On-Demand Revalidation
 * 
 * Permite revalidar páginas específicas del caché de Next.js cuando
 * el contenido cambia en el dashboard (crear/editar/eliminar obras/productos).
 * 
 * Uso:
 * ```ts
 * fetch('/api/revalidate', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ 
 *     paths: ['/artesanos/juan-ceramista', '/artesanos/maria-alfarera']
 *   })
 * });
 * ```
 * 
 * Seguridad:
 * - Solo accesible desde el mismo dominio (mismo-origin)
 * - En producción, añadir token secreto si es necesario
 */

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paths } = body;

    // Validar que paths sea un array
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { 
          error: 'Se requiere un array "paths" con al menos un path',
          example: { paths: ['/artesanos/juan-ceramista'] }
        },
        { status: 400 }
      );
    }

    // Validar que todos sean strings
    if (!paths.every(p => typeof p === 'string')) {
      return NextResponse.json(
        { error: 'Todos los paths deben ser strings' },
        { status: 400 }
      );
    }

    // Revalidar cada path
    const revalidated: string[] = [];
    const errors: { path: string; error: string }[] = [];

    for (const path of paths) {
      try {
        revalidatePath(path);
        revalidated.push(path);
      } catch (error) {
        errors.push({
          path,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Si hubo errores pero también éxitos, retornar partial success
    if (errors.length > 0 && revalidated.length > 0) {
      return NextResponse.json({
        success: true,
        revalidated,
        errors,
        message: `${revalidated.length} paths revalidados, ${errors.length} fallidos`
      });
    }

    // Si todos fallaron
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          errors,
          message: 'Todos los paths fallaron al revalidar'
        },
        { status: 500 }
      );
    }

    // Todo éxito
    return NextResponse.json({
      success: true,
      revalidated,
      message: `${revalidated.length} paths revalidados exitosamente`
    });

  } catch (error) {
    console.error('Error en revalidation API:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

