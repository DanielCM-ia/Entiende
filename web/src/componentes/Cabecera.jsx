const TAMANOS = [
  { id: 'normal', etiqueta: 'A', titulo: 'Letra normal' },
  { id: 'grande', etiqueta: 'A+', titulo: 'Letra grande' },
  { id: 'enorme', etiqueta: 'A++', titulo: 'Letra muy grande' },
];

export default function Cabecera({ tamano, onTamano, contraste, onContraste }) {
  return (
    <header>
      <div className="cabecera-fila">
        <div className="marca">
          <div className="marca-icono" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16v11H8l-4 4z" />
              <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
            </svg>
          </div>
          <div className="marca-nombre">Entiende</div>
        </div>

        <div className="herramientas no-imprimir" role="group" aria-label="Ajustes de lectura">
          <span className="grupo-etiqueta" id="lbl-tamano">Letra</span>
          {TAMANOS.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className="btn-chip"
              title={opcion.titulo}
              aria-describedby="lbl-tamano"
              aria-pressed={tamano === opcion.id}
              onClick={() => onTamano(opcion.id)}
            >
              {opcion.etiqueta}
            </button>
          ))}
          <button
            type="button"
            className="btn-chip"
            aria-pressed={contraste === 'alto'}
            onClick={onContraste}
          >
            Más contraste
          </button>
        </div>
      </div>

      <h1>Textos difíciles, explicados fácil</h1>
      <p className="lede">
        Pon aquí el texto de un informe médico, del cartel de una parada de autobús
        o de un papel oficial. Lo convertimos en frases cortas con pictogramas,
        para leer, escuchar o descargar.
      </p>
    </header>
  );
}
