import { Router } from 'express';
import { instruccionesDeSistema, mensajeDesdeTexto, mensajeDesdeFoto, TIPOS } from '../prompts.js';
import { pedirAMiniMax } from '../servicios/minimax.js';
import { buscarVarios } from '../servicios/arasaac.js';
import { extraerJson, normalizar, palabrasDePictograma } from '../esquema.js';
import { ErrorPeticion } from '../middleware/errores.js';

const TEXTO_MAXIMO = 12_000;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const rutaSimplificar = Router();

function validarEntrada(cuerpo) {
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
 * POST /api/simplificar
 * Cuerpo: { texto?, imagen?: { datos, tipoMime }, tipoDocumento }
 * Devuelve el documento en lectura fácil con los pictogramas ya resueltos.
 */
rutaSimplificar.post('/', async (req, res, siguiente) => {
  try {
    const { tipo, texto, imagen } = validarEntrada(req.body);

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

    res.json({
      documento,
      pictogramas,
      origen: imagen ? 'foto' : 'texto',
    });
  } catch (error) {
    siguiente(error);
  }
});
