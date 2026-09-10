export default function Paso({ numero, texto, pictograma, urlPictograma, variante = 'normal', onLeer }) {
  const clase = variante === 'aviso' ? 'paso paso-aviso' : 'paso';

  return (
    <div className={clase}>
      <div className="paso-numero" aria-hidden="true">
        {variante === 'aviso' ? '!' : numero}
      </div>

      <div className="paso-dibujo">
        {urlPictograma ? (
          <img src={urlPictograma} alt={`Pictograma de ${pictograma}`} loading="lazy" />
        ) : (
          <span aria-hidden="true">{(pictograma || texto).charAt(0).toUpperCase()}</span>
        )}
      </div>

      <p className="paso-texto">{texto}</p>

      {onLeer && (
        <button
          type="button"
          className="paso-escuchar no-imprimir"
          onClick={() => onLeer(texto)}
          aria-label={`Escuchar: ${texto}`}
          title="Escuchar esta frase"
        >
          🔊
        </button>
      )}
    </div>
  );
}
