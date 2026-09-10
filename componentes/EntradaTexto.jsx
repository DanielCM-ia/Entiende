export default function EntradaTexto({ valor, onCambio, desactivado, onEjemplo }) {
  return (
    <>
      <label htmlFor="texto-original">Texto original</label>
      <textarea
        id="texto-original"
        rows={8}
        value={valor}
        disabled={desactivado}
        onChange={(evento) => onCambio(evento.target.value)}
        placeholder={desactivado
          ? 'Vamos a usar la foto en lugar del texto.'
          : 'Pega o escribe aquí el texto difícil.'}
      />
      {!desactivado && (
        <p className="ayuda-inline">
          ¿No tienes un texto a mano?{' '}
          <button type="button" className="btn-enlace" onClick={onEjemplo}>
            Probar con un ejemplo
          </button>
        </p>
      )}
    </>
  );
}
