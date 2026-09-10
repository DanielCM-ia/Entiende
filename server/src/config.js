import 'dotenv/config';

function numero(valor, porDefecto) {
  const n = Number.parseInt(valor ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : porDefecto;
}

function lista(valor, porDefecto) {
  if (!valor) return porDefecto;
  return valor.split(',').map((o) => o.trim()).filter(Boolean);
}

export const config = {
  puerto: numero(process.env.PORT, 3001),

  minimax: {
    apiKey: process.env.MINIMAX_API_KEY?.trim() || '',
    baseUrl: (process.env.MINIMAX_BASE_URL?.trim() || 'https://api.minimax.io/v1').replace(/\/+$/, ''),
    modeloTexto: process.env.MINIMAX_MODELO_TEXTO?.trim() || 'MiniMax-M2.7',
    modeloVision: process.env.MINIMAX_MODELO_VISION?.trim() || 'MiniMax-M3',
    // Un documento en lectura fácil ocupa bastante: damos margen de sobra.
    maxTokens: numero(process.env.MINIMAX_MAX_TOKENS, 4000),
    tiempoLimiteMs: numero(process.env.MINIMAX_TIMEOUT_MS, 90_000),
  },

  origenesPermitidos: lista(process.env.ORIGENES_PERMITIDOS, [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]),

  limitePorMinuto: numero(process.env.LIMITE_POR_MINUTO, 20),

  // Tamaño máximo del cuerpo: las fotos viajan en base64 y engordan un 33 %.
  tamanoMaximoCuerpo: process.env.TAMANO_MAXIMO_CUERPO?.trim() || '12mb',
};

export const claveConfigurada = Boolean(config.minimax.apiKey);
