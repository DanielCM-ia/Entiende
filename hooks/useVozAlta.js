import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lectura en voz alta con la voz del propio sistema.
 * Es clave para quien no lee o lee con dificultad.
 */
export function useVozAlta() {
  const [leyendo, setLeyendo] = useState(false);
  const disponible = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const vozRef = useRef(null);

  useEffect(() => {
    if (!disponible) return undefined;

    const elegirVoz = () => {
      const voces = window.speechSynthesis.getVoices();
      vozRef.current = voces.find((v) => v.lang?.toLowerCase().startsWith('es')) ?? null;
    };

    elegirVoz();
    window.speechSynthesis.addEventListener('voiceschanged', elegirVoz);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', elegirVoz);
      window.speechSynthesis.cancel();
    };
  }, [disponible]);

  const parar = useCallback(() => {
    if (!disponible) return;
    window.speechSynthesis.cancel();
    setLeyendo(false);
  }, [disponible]);

  const leer = useCallback((texto) => {
    if (!disponible || !texto) return;

    window.speechSynthesis.cancel();

    const frase = new SpeechSynthesisUtterance(texto);
    frase.lang = 'es-ES';
    if (vozRef.current) frase.voice = vozRef.current;
    // Un poco más despacio de lo normal: se entiende mejor.
    frase.rate = 0.9;
    frase.onend = () => setLeyendo(false);
    frase.onerror = () => setLeyendo(false);

    setLeyendo(true);
    window.speechSynthesis.speak(frase);
  }, [disponible]);

  return { disponible, leyendo, leer, parar };
}
