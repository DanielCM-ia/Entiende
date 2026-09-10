import { config } from './config.js';

/**
 * Limitador sencillo por IP y por minuto.
 *
 * Aviso: en serverless cada instancia tiene su propia memoria y las
 * instancias van y vienen, así que esto frena picos desde una misma IP
 * pero no es una defensa seria. Para eso, el firewall de Vercel o un
 * contador compartido (Redis).
 */
const ventanas = new Map(); // ip -> { contador, desde }
const VENTANA_MS = 60_000;
const MAXIMO_IPS = 5000;

export function comprobarLimite(peticion) {
  const ip = peticion.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || peticion.headers.get('x-real-ip')
    || 'desconocida';

  const ahora = Date.now();

  // Limpieza perezosa: sin temporizadores, que en serverless no sobreviven.
  if (ventanas.size > MAXIMO_IPS) {
    for (const [clave, ventana] of ventanas) {
      if (ahora - ventana.desde > VENTANA_MS) ventanas.delete(clave);
    }
  }

  const ventana = ventanas.get(ip);

  if (!ventana || ahora - ventana.desde > VENTANA_MS) {
    ventanas.set(ip, { contador: 1, desde: ahora });
    return { permitido: true };
  }

  ventana.contador += 1;

  if (ventana.contador > config.limitePorMinuto) {
    return {
      permitido: false,
      esperaSegundos: Math.ceil((VENTANA_MS - (ahora - ventana.desde)) / 1000),
    };
  }

  return { permitido: true };
}
