import { TIPOS } from './prompts.js';

const MAXIMOS = {
  datosClave: 4,
  pasos: 12,
  acciones: 10,
  avisos: 6,
  glosario: 6,
  dudas: 5,
};

/**
 * Los modelos a veces envuelven el JSON en un bloque de código o añaden
 * una frase antes. Recortamos hasta dejar solo el objeto.
 */
export function extraerJson(bruto) {
  if (typeof bruto !== 'string') throw new Error('respuesta-vacia');

  let texto = bruto.trim();
  // Quitamos vallas de código: ```json ... ```
  texto = texto.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio === -1 || fin === -1 || fin <= inicio) throw new Error('respuesta-no-json');

  return JSON.parse(texto.slice(inicio, fin + 1));
}

function texto(valor, maxLargo = 400) {
  if (typeof valor !== 'string') return '';
  return valor.replace(/\s+/g, ' ').trim().slice(0, maxLargo);
}

/**
 * La palabra del pictograma se usa para buscar en ARASAAC:
 * una sola palabra, en minúsculas y sin tildes.
 */
function palabraPictograma(valor) {
  const limpio = texto(valor, 40)
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number} ]/gu, ' ')
    .trim();
  if (!limpio) return '';
  // Nos quedamos con la primera palabra: el buscador de ARASAAC funciona
  // mejor con un término suelto que con una frase.
  return limpio.split(/\s+/)[0];
}

function frases(valor, limite) {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => {
      // Aceptamos tanto {texto, pictograma} como una cadena suelta.
      if (typeof item === 'string') return { texto: texto(item), pictograma: '' };
      if (!item || typeof item !== 'object') return null;
      return {
        texto: texto(item.texto ?? item.frase ?? ''),
        pictograma: palabraPictograma(item.pictograma ?? ''),
      };
    })
    .filter((item) => item && item.texto)
    .slice(0, limite);
}

function datos(valor) {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      return {
        etiqueta: texto(item.etiqueta, 40),
        valor: texto(item.valor, 120),
        pictograma: palabraPictograma(item.pictograma ?? ''),
      };
    })
    .filter((item) => item && item.etiqueta && item.valor)
    .slice(0, MAXIMOS.datosClave);
}

function glosario(valor) {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      return {
        palabra: texto(item.palabra, 60),
        significado: texto(item.significado, 300),
      };
    })
    .filter((item) => item && item.palabra && item.significado)
    .slice(0, MAXIMOS.glosario);
}

/**
 * Deja el resultado del modelo con una forma fija y segura,
 * para que el frontend nunca tenga que defenderse de campos raros.
 */
export function normalizar(crudo, tipoPedido) {
  if (!crudo || typeof crudo !== 'object') throw new Error('respuesta-no-json');

  const tipo = TIPOS.includes(crudo.tipo)
    ? crudo.tipo
    : (tipoPedido && tipoPedido !== 'otro' ? tipoPedido : 'otro');

  const documento = {
    tipo,
    titulo: texto(crudo.titulo, 120),
    resumen: texto(crudo.resumen, 400),
    datosClave: datos(crudo.datosClave),
    pasos: frases(crudo.pasos, MAXIMOS.pasos),
    acciones: frases(crudo.acciones, MAXIMOS.acciones),
    avisos: frases(crudo.avisos, MAXIMOS.avisos),
    glosario: glosario(crudo.glosario),
    dudas: Array.isArray(crudo.dudas)
      ? crudo.dudas.map((d) => texto(d, 200)).filter(Boolean).slice(0, MAXIMOS.dudas)
      : [],
  };

  if (!documento.pasos.length && !documento.acciones.length) {
    throw new Error('respuesta-sin-contenido');
  }
  if (!documento.titulo) documento.titulo = 'Tu texto en lectura fácil';

  return documento;
}

/**
 * Todas las palabras de pictograma que hay que buscar, sin repetir.
 */
export function palabrasDePictograma(documento) {
  const palabras = new Set();
  for (const lista of [documento.pasos, documento.acciones, documento.avisos, documento.datosClave]) {
    for (const item of lista) {
      if (item.pictograma) palabras.add(item.pictograma);
    }
  }
  return [...palabras];
}
