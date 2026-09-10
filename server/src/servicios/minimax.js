import { config } from '../config.js';

/**
 * Error con un código estable que el frontend puede traducir a lectura fácil.
 */
export class ErrorIA extends Error {
  constructor(codigo, estado = 502, detalle = '') {
    super(codigo);
    this.codigo = codigo;
    this.estado = estado;
    this.detalle = detalle;
  }
}

function contenidoDeUsuario({ texto, imagen }) {
  if (!imagen) return texto;

  // Formato OpenAI-compatible: la imagen viaja como data URL.
  return [
    { type: 'text', text: texto },
    {
      type: 'image_url',
      image_url: {
        url: `data:${imagen.tipoMime};base64,${imagen.datos}`,
        detail: 'high',
      },
    },
  ];
}

/**
 * Llama al endpoint de chat de MiniMax y devuelve el texto de la respuesta.
 */
export async function pedirAMiniMax({ sistema, texto, imagen }) {
  if (!config.minimax.apiKey) {
    throw new ErrorIA('sin-clave', 503);
  }

  const modelo = imagen ? config.minimax.modeloVision : config.minimax.modeloTexto;
  const cuerpo = {
    model: modelo,
    max_tokens: config.minimax.maxTokens,
    // Poca temperatura: queremos fidelidad al original, no creatividad.
    temperature: 0.2,
    messages: [
      { role: 'system', content: sistema },
      { role: 'user', content: contenidoDeUsuario({ texto, imagen }) },
    ],
  };

  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), config.minimax.tiempoLimiteMs);

  let respuesta;
  try {
    respuesta = await fetch(`${config.minimax.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.minimax.apiKey}`,
      },
      body: JSON.stringify(cuerpo),
      signal: control.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new ErrorIA('tiempo-agotado', 504);
    throw new ErrorIA('sin-conexion', 502, error.message);
  } finally {
    clearTimeout(reloj);
  }

  if (!respuesta.ok) {
    const detalle = (await respuesta.text().catch(() => '')).slice(0, 500);
    if (respuesta.status === 401 || respuesta.status === 403) {
      throw new ErrorIA('clave-invalida', 502, detalle);
    }
    if (respuesta.status === 429) throw new ErrorIA('demasiadas-peticiones', 429, detalle);
    throw new ErrorIA('error-proveedor', 502, detalle);
  }

  const datos = await respuesta.json();

  // MiniMax devuelve errores de negocio con HTTP 200 y un base_resp.
  const codigoBase = datos?.base_resp?.status_code;
  if (codigoBase && codigoBase !== 0) {
    const mensaje = datos.base_resp.status_msg || '';
    if (codigoBase === 1004) throw new ErrorIA('clave-invalida', 502, mensaje);
    if (codigoBase === 1002) throw new ErrorIA('demasiadas-peticiones', 429, mensaje);
    if (codigoBase === 1008) throw new ErrorIA('sin-saldo', 402, mensaje);
    throw new ErrorIA('error-proveedor', 502, `${codigoBase}: ${mensaje}`);
  }

  const mensaje = datos?.choices?.[0]?.message;
  const contenido = typeof mensaje?.content === 'string'
    ? mensaje.content
    : Array.isArray(mensaje?.content)
      ? mensaje.content.map((parte) => parte?.text ?? '').join('')
      : '';

  if (!contenido.trim()) throw new ErrorIA('respuesta-vacia', 502);

  return contenido;
}

export function modelosEnUso() {
  return {
    texto: config.minimax.modeloTexto,
    vision: config.minimax.modeloVision,
  };
}
