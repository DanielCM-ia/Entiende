function numero(valor, porDefecto) {
  const n = Number.parseInt(valor ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : porDefecto;
}

export const config = {
  minimax: {
    apiKey: process.env.MINIMAX_API_KEY?.trim() || '',
    baseUrl: (process.env.MINIMAX_BASE_URL?.trim() || 'https://api.minimax.io/v1').replace(/\/+$/, ''),
    modeloTexto: process.env.MINIMAX_MODELO_TEXTO?.trim() || 'MiniMax-M2.7',
    modeloVision: process.env.MINIMAX_MODELO_VISION?.trim() || 'MiniMax-M3',
    // Un documento en lectura fácil ocupa bastante: damos margen de sobra.
    maxTokens: numero(process.env.MINIMAX_MAX_TOKENS, 4000),
    // Menos que el maxDuration de la función: así devolvemos un error
    // en fácil en vez de que la plataforma corte con un 504 seco.
    tiempoLimiteMs: numero(process.env.MINIMAX_TIMEOUT_MS, 55_000),
  },

  limitePorMinuto: numero(process.env.LIMITE_POR_MINUTO, 20),
};

export function claveConfigurada() {
  return Boolean(config.minimax.apiKey);
}
