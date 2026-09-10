import { NextResponse } from 'next/server';
import { simplificarDocumento } from '../../../lib/nucleo/simplificar.js';
import { respuestaDeError, ErrorPeticion } from '../../../lib/errores.js';
import { comprobarLimite } from '../../../lib/limite.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Leer una foto con el modelo de visión puede tardar.
// Si tu plan de Vercel no llega a 60 s, baja este número y también
// MINIMAX_TIMEOUT_MS, que siempre debe quedar por debajo.
export const maxDuration = 60;

/**
 * POST /api/simplificar
 * Cuerpo: { texto?, imagen?: { datos, tipoMime }, tipoDocumento }
 */
export async function POST(peticion) {
  const limite = comprobarLimite(peticion);
  if (!limite.permitido) {
    return NextResponse.json(
      {
        error: 'demasiadas-peticiones',
        mensaje: 'Ahora mismo hay mucha gente usando la aplicación. Espera un minuto y prueba otra vez.',
        esperaSegundos: limite.esperaSegundos,
      },
      { status: 429, headers: { 'Retry-After': String(limite.esperaSegundos) } },
    );
  }

  let cuerpo;
  try {
    cuerpo = await peticion.json();
  } catch {
    return respuestaDeError(new ErrorPeticion('cuerpo-invalido'));
  }

  try {
    return NextResponse.json(await simplificarDocumento(cuerpo));
  } catch (error) {
    return respuestaDeError(error);
  }
}
