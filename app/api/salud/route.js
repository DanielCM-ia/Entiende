import { NextResponse } from 'next/server';
import { config, claveConfigurada } from '../../../lib/config.js';

export const runtime = 'nodejs';
// Nunca cachear: dice el estado real del servidor en este momento.
export const dynamic = 'force-dynamic';

/**
 * GET /api/salud
 * El navegador lo consulta al abrir, para avisar si falta la clave.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    claveConfigurada: claveConfigurada(),
    modelos: {
      texto: config.minimax.modeloTexto,
      vision: config.minimax.modeloVision,
    },
    limitePorMinuto: config.limitePorMinuto,
  });
}
