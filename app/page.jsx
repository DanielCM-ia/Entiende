'use client';

import { useEffect, useRef, useState } from 'react';

import Cabecera from '../componentes/Cabecera.jsx';
import SelectorTipo from '../componentes/SelectorTipo.jsx';
import EntradaTexto from '../componentes/EntradaTexto.jsx';
import EntradaFoto from '../componentes/EntradaFoto.jsx';
import Resultado, { documentoComoTexto } from '../componentes/Resultado.jsx';

import { useAjustesLectura } from '../hooks/useAjustesLectura.js';
import { useVozAlta } from '../hooks/useVozAlta.js';
import { comprobarSalud, simplificar } from '../lib/api.js';
import { EJEMPLOS } from '../datos/ejemplos.js';

export default function App() {
  const { tamano, setTamano, contraste, alternarContraste } = useAjustesLectura();
  const voz = useVozAlta();

  const [tipoDocumento, setTipoDocumento] = useState('oficial');
  const [texto, setTexto] = useState('');
  const [foto, setFoto] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [servidorListo, setServidorListo] = useState(null);

  const zonaResultado = useRef(null);

  // Al abrir, preguntamos al servidor si tiene la clave puesta.
  useEffect(() => {
    let vigente = true;
    comprobarSalud()
      .then((salud) => { if (vigente) setServidorListo(salud.claveConfigurada); })
      .catch(() => { if (vigente) setServidorListo(false); });
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (!copiado) return undefined;
    const reloj = setTimeout(() => setCopiado(false), 2500);
    return () => clearTimeout(reloj);
  }, [copiado]);

  function ponerEjemplo() {
    setTexto(EJEMPLOS[tipoDocumento] ?? EJEMPLOS.otro);
    setFoto(null);
    setError('');
  }

  async function convertir() {
    if (!texto.trim() && !foto) {
      setError('Escribe un texto o sube una foto.');
      return;
    }

    voz.parar();
    setCargando(true);
    setError('');
    setResultado(null);
    setEstado(foto ? 'Leyendo la foto…' : 'Poniéndolo en lectura fácil…');

    try {
      const respuesta = await simplificar({
        texto: foto ? '' : texto.trim(),
        imagen: foto ? { datos: foto.datos, tipoMime: foto.tipoMime } : null,
        tipoDocumento,
      });

      setResultado(respuesta);
      setEstado('Listo.');
      // Llevamos el foco al resultado: quien navega con teclado o lector
      // de pantalla no debería tener que buscarlo.
      setTimeout(() => zonaResultado.current?.focus(), 0);
    } catch (fallo) {
      setError(fallo.mensaje ?? 'Algo ha ido mal. Prueba otra vez.');
      setEstado('');
    } finally {
      setCargando(false);
    }
  }

  async function copiarTexto() {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(documentoComoTexto(resultado.documento));
      setCopiado(true);
    } catch {
      setError('No hemos podido copiar el texto. Selecciónalo con el dedo o con el ratón.');
    }
  }

  function empezarDeNuevo() {
    voz.parar();
    setTexto('');
    setFoto(null);
    setResultado(null);
    setEstado('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="marco">
      <a className="saltar" href="#principal">Saltar al contenido</a>

      <Cabecera
        tamano={tamano}
        onTamano={setTamano}
        contraste={contraste}
        onContraste={alternarContraste}
      />

      <main id="principal">
        {servidorListo === false && (
          <p className="aviso-servidor no-imprimir">
            El servidor todavía no tiene configurada la clave de MiniMax.
            En local, copia <code>.env.example</code> a <code>.env.local</code> y pon la clave.
            En Vercel, añádela en <code>Settings → Environment Variables</code>.
          </p>
        )}

        <section className="no-imprimir" aria-labelledby="h-tipo">
          <h2 className="titulo-seccion" id="h-tipo">1. ¿Qué papel quieres entender?</h2>
          <SelectorTipo valor={tipoDocumento} onCambio={setTipoDocumento} />
        </section>

        <section className="no-imprimir" aria-labelledby="h-texto">
          <h2 className="titulo-seccion" id="h-texto">2. Pon aquí el texto</h2>

          <EntradaTexto
            valor={texto}
            onCambio={setTexto}
            desactivado={Boolean(foto)}
            onEjemplo={ponerEjemplo}
          />

          <div className="separador"><span>o</span></div>

          <EntradaFoto
            foto={foto}
            onFoto={(nueva) => { setFoto(nueva); setError(''); }}
            onQuitar={() => setFoto(null)}
            desactivado={cargando}
          />
        </section>

        <section className="no-imprimir" aria-labelledby="h-convertir">
          <h2 className="titulo-seccion" id="h-convertir">3. Convertir</h2>

          <div className="acciones">
            <button type="button" className="btn-principal" onClick={convertir} disabled={cargando}>
              {cargando ? 'Un momento…' : 'Convertir a lectura fácil'}
            </button>

            {resultado && !cargando && (
              <button type="button" className="btn-enlace" onClick={empezarDeNuevo}>
                Empezar de nuevo
              </button>
            )}

            <p className="estado" role="status" aria-live="polite">{estado}</p>
          </div>

          {error && (
            <div className="caja-error" role="alert">
              <strong>No ha podido ser</strong>
              {error}
            </div>
          )}
        </section>

        <div ref={zonaResultado} tabIndex={-1}>
          {resultado ? (
            <Resultado
              documento={resultado.documento}
              pictogramas={resultado.pictogramas}
              voz={voz}
              onCopiar={copiarTexto}
              copiado={copiado}
            />
          ) : (
            !cargando && (
              <section className="no-imprimir">
                <p className="vacio">
                  Todavía no hay ningún resultado.
                  Pon un texto arriba y pulsa «Convertir a lectura fácil».
                </p>
              </section>
            )
          )}
        </div>
      </main>

      <footer className="no-imprimir">
        <p>
          Prototipo de accesibilidad cognitiva.
          Sigue las pautas de lectura fácil de la norma UNE 153101:2018.
        </p>
        <p>
          Pictogramas de <a href="https://arasaac.org" target="_blank" rel="noopener noreferrer">ARASAAC</a>
          {' '}(Gobierno de Aragón), autor Sergio Palao, licencia CC BY-NC-SA.
        </p>
      </footer>
    </div>
  );
}
