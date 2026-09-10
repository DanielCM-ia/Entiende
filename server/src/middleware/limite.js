import { config } from '../config.js';

/**
 * Limitador sencillo por IP y por minuto, en memoria.
 * Suficiente para un prototipo de un solo proceso.
 * En producción con varias instancias, conviene usar Redis.
 */
const ventanas = new Map(); // ip -> { contador, desde }
const VENTANA_MS = 60_000;

setInterval(() => {
  const ahora = Date.now();
  for (const [ip, ventana] of ventanas) {
    if (ahora - ventana.desde > VENTANA_MS * 2) ventanas.delete(ip);
  }
}, VENTANA_MS).unref();

export function limitarPeticiones(req, res, siguiente) {
  const ip = req.ip ?? 'desconocida';
  const ahora = Date.now();
  const ventana = ventanas.get(ip);

  if (!ventana || ahora - ventana.desde > VENTANA_MS) {
    ventanas.set(ip, { contador: 1, desde: ahora });
    return siguiente();
  }

  ventana.contador += 1;

  if (ventana.contador > config.limitePorMinuto) {
    const esperaSegundos = Math.ceil((VENTANA_MS - (ahora - ventana.desde)) / 1000);
    res.set('Retry-After', String(esperaSegundos));
    return res.status(429).json({
      error: 'demasiadas-peticiones',
      mensaje: 'Has hecho muchas peticiones seguidas. Espera un minuto.',
      esperaSegundos,
    });
  }

  return siguiente();
}
