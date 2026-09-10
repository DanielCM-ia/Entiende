const BASE = import.meta.env.VITE_API_URL ?? '';

async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE}${ruta}`, opciones);
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos.error ?? 'error-desconocido');
    error.codigo = datos.error;
    error.mensaje = datos.mensaje ?? 'Algo ha ido mal. Prueba otra vez.';
    throw error;
  }

  return datos;
}

export function comprobarSalud() {
  return pedir('/api/salud');
}

/**
 * Manda el texto o la foto al backend, que es quien habla con MiniMax.
 */
export function simplificar({ texto, imagen, tipoDocumento }) {
  return pedir('/api/simplificar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto, imagen, tipoDocumento }),
  });
}

export function buscarPictograma(palabra) {
  return pedir(`/api/pictogramas?palabra=${encodeURIComponent(palabra)}`);
}
