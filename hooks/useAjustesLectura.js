import { useCallback, useEffect, useState } from 'react';

const CLAVE_TAMANO = 'entiende.tamano';
const CLAVE_CONTRASTE = 'entiende.contraste';

const TAMANOS_VALIDOS = ['normal', 'grande', 'enorme'];
const CONTRASTES_VALIDOS = ['normal', 'alto'];

function leerGuardado(clave, validos) {
  try {
    const valor = window.localStorage.getItem(clave);
    // Un valor viejo o manipulado no debe dejar la página sin tamaño.
    return validos.includes(valor) ? valor : validos[0];
  } catch {
    return validos[0];
  }
}

function guardar(clave, valor) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Navegar en privado no debe romper la aplicación.
  }
}

/**
 * Tamaño de letra y contraste alto, recordados en el dispositivo.
 *
 * El estado arranca en los valores por defecto, los mismos que pinta el
 * servidor: leer localStorage durante el primer render dejaba el HTML del
 * servidor y el del navegador distintos, y React abandonaba la corrección,
 * así que el botón marcado no era el del tamaño que se estaba viendo.
 * Lo guardado se recupera al montar; del primer pintado sin salto se encarga
 * el script de `layout.jsx`.
 */
export function useAjustesLectura() {
  const [tamano, setTamano] = useState('normal');
  const [contraste, setContraste] = useState('normal');
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setTamano(leerGuardado(CLAVE_TAMANO, TAMANOS_VALIDOS));
    setContraste(leerGuardado(CLAVE_CONTRASTE, CONTRASTES_VALIDOS));
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    document.documentElement.dataset.tamano = tamano;
    guardar(CLAVE_TAMANO, tamano);
  }, [tamano, listo]);

  useEffect(() => {
    if (!listo) return;
    document.documentElement.dataset.contraste = contraste;
    guardar(CLAVE_CONTRASTE, contraste);
  }, [contraste, listo]);

  const cambiarTamano = useCallback((nuevo) => {
    if (TAMANOS_VALIDOS.includes(nuevo)) setTamano(nuevo);
  }, []);

  const alternarContraste = useCallback(() => {
    setContraste((actual) => (actual === 'alto' ? 'normal' : 'alto'));
  }, []);

  return { tamano, setTamano: cambiarTamano, contraste, alternarContraste };
}
