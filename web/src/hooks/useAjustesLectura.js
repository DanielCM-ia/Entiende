import { useCallback, useEffect, useState } from 'react';

const CLAVE_TAMANO = 'entiende.tamano';
const CLAVE_CONTRASTE = 'entiende.contraste';

function leerGuardado(clave, porDefecto) {
  try {
    return window.localStorage.getItem(clave) ?? porDefecto;
  } catch {
    return porDefecto;
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
 */
export function useAjustesLectura() {
  const [tamano, setTamano] = useState(() => leerGuardado(CLAVE_TAMANO, 'normal'));
  const [contraste, setContraste] = useState(() => leerGuardado(CLAVE_CONTRASTE, 'normal'));

  useEffect(() => {
    document.documentElement.dataset.tamano = tamano;
    guardar(CLAVE_TAMANO, tamano);
  }, [tamano]);

  useEffect(() => {
    document.documentElement.dataset.contraste = contraste;
    guardar(CLAVE_CONTRASTE, contraste);
  }, [contraste]);

  const alternarContraste = useCallback(() => {
    setContraste((actual) => (actual === 'alto' ? 'normal' : 'alto'));
  }, []);

  return { tamano, setTamano, contraste, alternarContraste };
}
