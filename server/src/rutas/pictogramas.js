import { Router } from 'express';
import { buscarPictograma } from '../servicios/arasaac.js';

export const rutaPictogramas = Router();

/**
 * GET /api/pictogramas?palabra=medico
 * Sirve para que el frontend pueda pedir un dibujo suelto,
 * por ejemplo si la persona quiere cambiar el de una frase.
 */
rutaPictogramas.get('/', async (req, res, siguiente) => {
  try {
    const palabra = String(req.query.palabra ?? '').trim().slice(0, 40);
    if (!palabra) {
      return res.status(400).json({ error: 'palabra-vacia', mensaje: 'Falta la palabra que buscar.' });
    }

    const url = await buscarPictograma(palabra);
    res.json({ palabra, url });
  } catch (error) {
    siguiente(error);
  }
});
