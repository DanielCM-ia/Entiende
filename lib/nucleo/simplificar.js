import { instruccionesDeSistema, mensajeDesdeTexto, mensajeDesdeFoto, TIPOS } from '../prompts.js';
import { pedirAMiniMax } from '../minimax.js';
import { buscarVarios } from '../arasaac.js';
import { extraerJson, normalizar, palabrasDePictograma } from '../esquema.js';
import { ErrorPeticion } from '../errores.js';

const TEXTO_MAXIMO = 12_000;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Comprueba lo que llega del navegador.
 * Lanza ErrorPeticion con un código que el frontend sabe traducir.
 */
export function validarEntrada(cuerpo) {
  const tipo = cuerpo?.tipoDocumento ?? 'otro';
  if (!TIPOS.includes(tipo)) throw new ErrorPeticion('tipo-invalido');

  const texto = typeof cuerpo?.texto === 'string' ? cuerpo.texto.trim() : '';
  const imagenCruda = cuerpo?.imagen;

  let imagen = null;
  if (imagenCruda) {
    const datos = typeof imagenCruda.datos === 'string' ? imagenCruda.datos : '';
    const tipoMime = typeof imagenCruda.tipoMime === 'string' ? imagenCruda.tipoMime : '';
    if (!datos || !TIPOS_IMAGEN.includes(tipoMime)) throw new ErrorPeticion('imagen-invalida');
    // Comprobación ligera de base64: evita mandar basura al proveedor.
    if (!/^[A-Za-z0-9+/=\s]+$/.test(datos.slice(0, 200))) throw new ErrorPeticion('imagen-invalida');
    imagen = { datos: datos.replace(/\s/g, ''), tipoMime };
  }

  if (!texto && !imagen) throw new ErrorPeticion('texto-vacio');
  if (texto.length > TEXTO_MAXIMO) throw new ErrorPeticion('texto-largo');

  return { tipo, texto, imagen };
}

/**
 * Todo el trabajo, sin saber nada de Express ni de Vercel:
 * pide la adaptación al modelo, la normaliza y busca los pictogramas.
 */
export async function simplificarDocumento(cuerpo) {
  const { tipo, texto, imagen } = validarEntrada(cuerpo);

  const bruto = await pedirAMiniMax({
    sistema: instruccionesDeSistema(tipo),
    texto: imagen ? mensajeDesdeFoto() : mensajeDesdeTexto(texto),
    imagen,
  });

  let documento;
  try {
    documento = normalizar(extraerJson(bruto), tipo);
  } catch (error) {
    throw new ErrorPeticion(error.message ?? 'respuesta-no-json', 502);
  }

  const pictogramas = await buscarVarios(palabrasDePictograma(documento));

  return { documento, pictogramas, origen: imagen ? 'foto' : 'texto' };
}
