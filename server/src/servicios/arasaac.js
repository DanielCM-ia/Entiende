/**
 * Pictogramas de ARASAAC (Gobierno de Aragón).
 *
 * Los buscamos desde el servidor: así el navegador no depende de CORS
 * ni de ningún proxy externo, y podemos cachear entre personas usuarias.
 */

const BASE = 'https://api.arasaac.org/v1/pictograms';
const CADUCIDAD_MS = 24 * 60 * 60 * 1000; // un día
const MAXIMO_EN_CACHE = 1000;
const TIEMPO_LIMITE_MS = 8000;

const cache = new Map(); // palabra -> { url, momento }

function urlDeImagen(id) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
}

function guardarEnCache(palabra, url) {
  if (cache.size >= MAXIMO_EN_CACHE) {
    // Cache sencilla: al llenarse, se tira la entrada más antigua.
    const primera = cache.keys().next().value;
    cache.delete(primera);
  }
  cache.set(palabra, { url, momento: Date.now() });
}

/**
 * Elige el pictograma más adecuado de los que devuelve la búsqueda.
 * Preferimos el que tiene la palabra exacta como keyword.
 */
function elegirMejor(resultados, palabra) {
  const buscada = palabra.toLowerCase();

  const exacto = resultados.find((picto) =>
    (picto.keywords ?? []).some((k) => (k.keyword ?? '').toLowerCase() === buscada),
  );

  return exacto ?? resultados[0];
}

export async function buscarPictograma(palabra, idioma = 'es') {
  const clave = `${idioma}:${palabra.toLowerCase()}`;
  const enCache = cache.get(clave);
  if (enCache && Date.now() - enCache.momento < CADUCIDAD_MS) {
    return enCache.url;
  }

  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), TIEMPO_LIMITE_MS);

  try {
    const respuesta = await fetch(
      `${BASE}/${idioma}/search/${encodeURIComponent(palabra)}`,
      { signal: control.signal, headers: { Accept: 'application/json' } },
    );

    // 404 significa "no hay dibujo para esa palabra": lo cacheamos igual
    // para no volver a preguntar por lo mismo.
    if (!respuesta.ok) {
      if (respuesta.status === 404) guardarEnCache(clave, null);
      return null;
    }

    const resultados = await respuesta.json();
    if (!Array.isArray(resultados) || resultados.length === 0) {
      guardarEnCache(clave, null);
      return null;
    }

    const mejor = elegirMejor(resultados, palabra);
    const id = mejor?._id ?? mejor?.id;
    if (!id) return null;

    const url = urlDeImagen(id);
    guardarEnCache(clave, url);
    return url;
  } catch {
    // Si ARASAAC falla, la aplicación sigue: el texto en lectura fácil
    // es lo importante, el dibujo es una ayuda.
    return null;
  } finally {
    clearTimeout(reloj);
  }
}

/**
 * Busca varias palabras a la vez, de 5 en 5 para no saturar la API.
 */
export async function buscarVarios(palabras) {
  const mapa = {};
  const tanda = 5;

  for (let i = 0; i < palabras.length; i += tanda) {
    const trozo = palabras.slice(i, i + tanda);
    const urls = await Promise.all(trozo.map((p) => buscarPictograma(p)));
    trozo.forEach((palabra, indice) => {
      mapa[palabra] = urls[indice];
    });
  }

  return mapa;
}
