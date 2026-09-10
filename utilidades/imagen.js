const LADO_MAXIMO = 1400;
const CALIDAD = 0.8;
const FORMATOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Reduce la foto antes de mandarla: una foto de móvil moderna pesa
 * varios megas y no hace falta tanto para leer un cartel.
 * Además, las funciones de Vercel rechazan cuerpos de más de ~4,5 MB
 * y el base64 engorda la imagen un tercio.
 * Devuelve { datos (base64 sin prefijo), tipoMime, vistaPrevia }.
 */
export async function prepararImagen(archivo) {
  const vistaPrevia = await leerComoDataUrl(archivo);
  const imagen = await cargarImagen(vistaPrevia);

  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));

  // Si ya es pequeña y su formato vale, la mandamos tal cual.
  if (escala === 1 && FORMATOS_ACEPTADOS.includes(archivo.type)) {
    return {
      datos: vistaPrevia.split(',')[1],
      tipoMime: archivo.type,
      vistaPrevia,
    };
  }

  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);

  const contexto = lienzo.getContext('2d');
  // Fondo blanco: si la imagen tiene transparencia, en JPEG saldría negra.
  contexto.fillStyle = '#FFFFFF';
  contexto.fillRect(0, 0, lienzo.width, lienzo.height);
  contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);

  const dataUrl = lienzo.toDataURL('image/jpeg', CALIDAD);

  return {
    datos: dataUrl.split(',')[1],
    tipoMime: 'image/jpeg',
    vistaPrevia: dataUrl,
  };
}

function leerComoDataUrl(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(new Error('no-se-puede-leer'));
    lector.readAsDataURL(archivo);
  });
}

function cargarImagen(dataUrl) {
  return new Promise((resolver, rechazar) => {
    const imagen = new Image();
    imagen.onload = () => resolver(imagen);
    imagen.onerror = () => rechazar(new Error('no-es-imagen'));
    imagen.src = dataUrl;
  });
}
