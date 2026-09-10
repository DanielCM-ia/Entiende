import './globales.css';

export const metadata = {
  title: 'Entiende — textos difíciles en lectura fácil',
  description:
    'Convierte informes médicos, carteles de parada de autobús y documentos oficiales '
    + 'en lectura fácil con pictogramas.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Aplica lo que la persona eligió antes de que se pinte nada: si esperamos a
// React, la página aparece con la letra pequeña y da un salto.
const AJUSTES_GUARDADOS = `(function(){try{
var d=document.documentElement.dataset;
var t=localStorage.getItem('entiende.tamano');
if(t==='grande'||t==='enorme')d.tamano=t;
if(localStorage.getItem('entiende.contraste')==='alto')d.contraste='alto';
}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    // El script de arriba cambia estos atributos antes de hidratar, y eso es
    // lo que buscamos: React no debe avisar de que no coinciden.
    <html lang="es" data-tamano="normal" data-contraste="normal" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: AJUSTES_GUARDADOS }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Atkinson Hyperlegible: tipografía pensada para baja visión. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
