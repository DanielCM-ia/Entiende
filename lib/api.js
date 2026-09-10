/**
 * Cliente del navegador. Todas las llamadas van al mismo origen:
 * las rutas de API de Next están en /api/*, así que la clave de MiniMax
 * se queda siempre en el servidor.
 */
async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, opciones);
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
