import { useRef, useState } from 'react';
import { prepararImagen } from '../utilidades/imagen.js';

export default function EntradaFoto({ foto, onFoto, onQuitar, desactivado }) {
  const entradaRef = useRef(null);
  const [error, setError] = useState('');

  async function alElegir(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    setError('');
    try {
      const preparada = await prepararImagen(archivo);
      onFoto({ ...preparada, nombre: archivo.name });
    } catch {
      setError('No hemos podido leer esa imagen. Prueba con otra foto.');
    } finally {
      // Permite volver a elegir el mismo archivo si lo quitas y lo pones otra vez.
      evento.target.value = '';
    }
  }

  return (
    <div className="fila-foto">
      <input
        ref={entradaRef}
        type="file"
        id="entrada-foto"
        className="oculto"
        accept="image/*"
        capture="environment"
        onChange={alElegir}
      />

      <button
        type="button"
        className="btn-secundario"
        disabled={desactivado}
        onClick={() => entradaRef.current?.click()}
      >
        Hacer foto o subir una imagen
      </button>

      {foto && (
        <div className="foto-miniatura">
          <img src={foto.vistaPrevia} alt="Vista previa de la foto elegida" />
          <div className="foto-info">
            <span title={foto.nombre}>{foto.nombre}</span>
            <button type="button" className="btn-enlace" onClick={onQuitar}>
              Quitar foto
            </button>
          </div>
        </div>
      )}

      {error && <p className="error-linea">{error}</p>}
    </div>
  );
}
