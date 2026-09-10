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

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-tamano="normal" data-contraste="normal">
      <head>
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
