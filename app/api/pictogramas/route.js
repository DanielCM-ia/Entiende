import { NextResponse } from 'next/server';
import { buscarPictograma } from '../../../lib/arasaac.js';
import { respuestaDeError } from '../../../lib/errores.js';
import { comprobarLimite } from '../../../lib/limite.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/pictogramas?palabra=medico
 * Busca un pictograma suelto, por si se quiere cambiar el de una frase.
 */
export async function GET(peticion) {
  const limite = comprobarLimite(peticion);
  if (!limite.permitido) {
    return NextResponse.json(
      { error: 'demasiadas-peticiones', mensaje: 'Espera un minuto y prueba otra vez.' },
      { status: 429 },
    );
  }

  try {
    const palabra = (peticion.nextUrl.searchParams.get('palabra') ?? '').trim().slice(0, 40);
    if (!palabra) {
      return NextResponse.json(
        { error: 'palabra-vacia', mensaje: 'Falta la palabra que buscar.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ palabra, url: await buscarPictograma(palabra) });
  } catch (error) {
    return respuestaDeError(error);
  }
}
