import { TIPOS_DOCUMENTO } from '../datos/tipos.js';

export default function SelectorTipo({ valor, onCambio }) {
  return (
    <div className="tipos" role="radiogroup" aria-labelledby="h-tipo">
      {TIPOS_DOCUMENTO.map((tipo) => (
        <button
          key={tipo.id}
          type="button"
          role="radio"
          aria-checked={valor === tipo.id}
          className="tipo-card"
          onClick={() => onCambio(tipo.id)}
        >
          <span className="tipo-icono" aria-hidden="true">{tipo.icono}</span>
          <span className="tipo-texto">
            <span>{tipo.nombre}</span>
            <span className="tipo-sub">{tipo.descripcion}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
