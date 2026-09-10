import { NextResponse } from 'next/server';

/**
 * Mensajes en lectura fácil para cada código de error.
 * El detalle técnico se queda en el registro del servidor.
 */
const MENSAJES = {
  'sin-clave': 'El servidor no tiene configurada la clave de MiniMax. Avisa a la persona que lo administra.',
  'clave-invalida': 'La clave del servidor no funciona. Avisa a la persona que lo administra.',
  'sin-saldo': 'La cuenta de MiniMax se ha quedado sin saldo. Avisa a la persona que lo administra.',
  'demasiadas-peticiones': 'Ahora mismo hay mucha gente usando la aplicación. Espera un minuto y prueba otra vez.',
  'tiempo-agotado': 'El texto ha tardado demasiado. Prueba otra vez, o con un texto más corto.',
  'sin-conexion': 'No hemos podido conectar con el servicio. Prueba otra vez en unos segundos.',
  'error-proveedor': 'El servicio ha dado un error. Prueba otra vez en unos segundos.',
  'respuesta-vacia': 'No hemos entendido el texto. Prueba otra vez.',
  'respuesta-no-json': 'No hemos podido preparar el resultado. Prueba otra vez.',
  'respuesta-sin-contenido': 'No hemos encontrado nada que explicar en ese texto. Revisa que esté completo.',
  'cuerpo-invalido': 'No hemos entendido la petición. Prueba otra vez.',
  'texto-vacio': 'Escribe un texto o sube una foto.',
  'texto-largo': 'El texto es demasiado largo. Divídelo en partes más cortas.',
  'imagen-invalida': 'No hemos podido leer esa imagen. Prueba con otra foto.',
  'imagen-grande': 'La foto pesa demasiado. Hazla más pequeña y prueba otra vez.',
  'tipo-invalido': 'Ese tipo de documento no existe.',
};

export function mensajeDeError(codigo) {
  return MENSAJES[codigo] ?? 'Algo ha ido mal. Prueba otra vez en unos segundos.';
}

export class ErrorPeticion extends Error {
  constructor(codigo, estado = 400) {
    super(codigo);
    this.codigo = codigo;
    this.estado = estado;
  }
}

/**
 * Convierte cualquier error en una respuesta JSON con el mensaje ya en fácil.
 */
export function respuestaDeError(error) {
  const codigo = error?.codigo ?? 'error-desconocido';
  const estado = error?.estado ?? 500;

  if (estado >= 500) {
    console.error(`[error] ${codigo}`, error?.detalle || error?.message || error);
  }

  return NextResponse.json(
    { error: codigo, mensaje: mensajeDeError(codigo) },
    { status: estado },
  );
}
