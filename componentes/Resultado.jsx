import Paso from './Paso.jsx';
import { NOMBRE_TIPO } from '../datos/tipos.js';

/**
 * Convierte el documento en un texto seguido, para leerlo en voz alta
 * o para copiarlo al portapapeles.
 */
export function documentoComoTexto(documento) {
  const partes = [documento.titulo, documento.resumen];

  if (documento.datosClave.length) {
    partes.push('Datos importantes.');
    documento.datosClave.forEach((dato) => partes.push(`${dato.etiqueta}: ${dato.valor}.`));
  }
  if (documento.pasos.length) {
    partes.push('Qué dice este papel.');
    documento.pasos.forEach((paso) => partes.push(paso.texto));
  }
  if (documento.acciones.length) {
    partes.push('Qué tienes que hacer.');
    documento.acciones.forEach((accion) => partes.push(accion.texto));
  }
  if (documento.avisos.length) {
    partes.push('Ten cuidado con esto.');
    documento.avisos.forEach((aviso) => partes.push(aviso.texto));
  }
  if (documento.glosario.length) {
    partes.push('Palabras difíciles.');
    documento.glosario.forEach((item) => partes.push(`${item.palabra}: ${item.significado}`));
  }

  return partes.filter(Boolean).join('\n');
}

export default function Resultado({ documento, pictogramas, voz, onCopiar, copiado }) {
  const url = (palabra) => (palabra ? pictogramas[palabra] ?? null : null);
  const leerFrase = voz.disponible ? voz.leer : null;

  return (
    <section className="resultado" aria-labelledby="titulo-resultado">
      <div className="resultado-cabecera">
        <p className="etiqueta-tipo">{NOMBRE_TIPO[documento.tipo] ?? 'Texto'}</p>
        <h2 className="resultado-titulo" id="titulo-resultado">{documento.titulo}</h2>
        {documento.resumen && <p className="resultado-resumen">{documento.resumen}</p>}
      </div>

      <div className="acciones-resultado no-imprimir">
        {voz.disponible && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() => (voz.leyendo ? voz.parar() : voz.leer(documentoComoTexto(documento)))}
          >
            {voz.leyendo ? 'Parar la lectura' : 'Leer en voz alta'}
          </button>
        )}
        <button type="button" className="btn-secundario" onClick={onCopiar}>
          {copiado ? 'Texto copiado' : 'Copiar texto'}
        </button>
        <button type="button" className="btn-secundario" onClick={() => window.print()}>
          Descargar en PDF
        </button>
      </div>

      {documento.datosClave.length > 0 && (
        <div className="bloque">
          <h3 className="titulo-bloque">Datos importantes</h3>
          <div className="datos">
            {documento.datosClave.map((dato, indice) => (
              <div className="dato" key={`${dato.etiqueta}-${indice}`}>
                <div className="paso-dibujo dibujo-pequeno">
                  {url(dato.pictograma)
                    ? <img src={url(dato.pictograma)} alt="" loading="lazy" />
                    : <span aria-hidden="true">{dato.etiqueta.charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <span className="dato-etiqueta">{dato.etiqueta}</span>
                  <span className="dato-valor">{dato.valor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {documento.pasos.length > 0 && (
        <div className="bloque">
          <h3 className="titulo-bloque">Qué dice este papel</h3>
          <div className="pasos">
            {documento.pasos.map((paso, indice) => (
              <Paso
                key={`paso-${indice}`}
                numero={indice + 1}
                texto={paso.texto}
                pictograma={paso.pictograma}
                urlPictograma={url(paso.pictograma)}
                onLeer={leerFrase}
              />
            ))}
          </div>
        </div>
      )}

      {documento.acciones.length > 0 && (
        <div className="bloque">
          <h3 className="titulo-bloque">Qué tienes que hacer</h3>
          <div className="pasos">
            {documento.acciones.map((accion, indice) => (
              <Paso
                key={`accion-${indice}`}
                numero={indice + 1}
                texto={accion.texto}
                pictograma={accion.pictograma}
                urlPictograma={url(accion.pictograma)}
                onLeer={leerFrase}
              />
            ))}
          </div>
        </div>
      )}

      {documento.avisos.length > 0 && (
        <div className="bloque">
          <h3 className="titulo-bloque">Ten cuidado con esto</h3>
          <div className="pasos">
            {documento.avisos.map((aviso, indice) => (
              <Paso
                key={`aviso-${indice}`}
                numero={indice + 1}
                texto={aviso.texto}
                pictograma={aviso.pictograma}
                urlPictograma={url(aviso.pictograma)}
                variante="aviso"
                onLeer={leerFrase}
              />
            ))}
          </div>
        </div>
      )}

      {documento.glosario.length > 0 && (
        <div className="bloque">
          <h3 className="titulo-bloque">Palabras difíciles</h3>
          <dl className="glosario">
            {documento.glosario.map((item, indice) => (
              <div key={`palabra-${indice}`}>
                <dt>{item.palabra}</dt>
                <dd>{item.significado}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {documento.dudas.length > 0 && (
        <div className="bloque">
          <h3 className="titulo-bloque">Esto no se entendía bien</h3>
          <ul className="dudas">
            {documento.dudas.map((duda, indice) => <li key={`duda-${indice}`}>{duda}</li>)}
          </ul>
        </div>
      )}

      <p className="revision">
        Esta versión la ha hecho una máquina.
        Antes de usarla de verdad, es mejor que una persona la revise.
        {documento.tipo === 'medico' && ' Con las medicinas, pregunta siempre a tu médico o a tu farmacia.'}
      </p>
    </section>
  );
}
