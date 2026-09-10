# Entiende

Convierte textos difíciles —informes médicos, carteles de parada de autobús,
cartas de la administración— en **lectura fácil con pictogramas**, para personas
con discapacidad intelectual, daño cerebral, personas mayores, personas con
dificultades de lectura o que están aprendiendo el idioma.

El resultado se puede leer en pantalla, **escuchar en voz alta**, copiar o
descargar en PDF.

## Cómo funciona

```
Navegador (React)  ──►  Backend (Node + Express)  ──►  MiniMax (texto o foto)
                                   │
                                   └──────────────►  ARASAAC (pictogramas)
```

La clave de MiniMax vive **solo en el servidor**. El navegador nunca la ve.

- **Texto o foto.** Se puede pegar el texto o hacer una foto del papel o del
  cartel. Las fotos las lee `MiniMax-M3`, que es multimodal.
- **Cuatro tipos de documento.** Salud, transporte, papel oficial y "no lo sé".
  Cada uno tiene instrucciones distintas: en salud se copian las dosis tal cual,
  en transporte se buscan las paradas y horarios, en papeles oficiales el plazo.
- **Reglas de lectura fácil.** Frases de 12 palabras como mucho, una idea por
  frase, voz activa, tuteo, sin siglas sin explicar. Siguen la norma
  UNE 153101:2018.
- **Pictogramas de ARASAAC.** Los busca el servidor y los cachea, así el
  navegador no depende de CORS ni de proxies externos.
- **No inventar.** El modelo tiene prohibido añadir datos que no estén en el
  original; lo que no se entiende lo declara en "dudas".

## Puesta en marcha

Hace falta Node 20 o superior.

```bash
npm install

cp server/.env.example server/.env
# edita server/.env y pon tu MINIMAX_API_KEY

npm run dev
```

- Backend: http://localhost:3001
- Web: http://localhost:5173 (Vite manda `/api` al backend)

La clave se saca de la consola de MiniMax:
https://platform.minimax.io/user-center/basic-information/interface-key

### Producción

```bash
npm run build   # compila la web en web/dist
npm start       # el backend sirve la API y la web ya compilada
```

## Variables de entorno

| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `MINIMAX_API_KEY` | — | Obligatoria. Tu clave de MiniMax. |
| `MINIMAX_BASE_URL` | `https://api.minimax.io/v1` | Cuenta internacional. En China continental: `https://api.minimaxi.com/v1`. |
| `MINIMAX_MODELO_TEXTO` | `MiniMax-M2.7` | Modelo para textos escritos. |
| `MINIMAX_MODELO_VISION` | `MiniMax-M3` | Modelo para fotos. Tiene que aceptar imágenes. |
| `PORT` | `3001` | Puerto del backend. |
| `ORIGENES_PERMITIDOS` | `http://localhost:5173,…` | Orígenes que pueden llamar a la API. |
| `LIMITE_POR_MINUTO` | `20` | Peticiones por minuto y por IP. |

## API

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/salud` | Dice si el servidor tiene la clave puesta y qué modelos usa. |
| `POST` | `/api/simplificar` | Recibe `{ texto?, imagen?: { datos, tipoMime }, tipoDocumento }` y devuelve el documento en lectura fácil con los pictogramas ya resueltos. |
| `GET` | `/api/pictogramas?palabra=` | Busca un pictograma suelto en ARASAAC. |

Respuesta de `/api/simplificar`:

```json
{
  "documento": {
    "tipo": "oficial",
    "titulo": "Te falta un papel",
    "resumen": "Pediste una ayuda. Falta documentación.",
    "datosClave": [{ "etiqueta": "Plazo", "valor": "10 días", "pictograma": "calendario" }],
    "pasos":    [{ "texto": "Pediste una ayuda.", "pictograma": "ayuda" }],
    "acciones": [{ "texto": "Lleva tu DNI.", "pictograma": "dni" }],
    "avisos":   [{ "texto": "Si no lo envías, pierdes la ayuda.", "pictograma": "peligro" }],
    "glosario": [{ "palabra": "Subsanación", "significado": "Arreglar un fallo." }],
    "dudas": []
  },
  "pictogramas": { "ayuda": "https://static.arasaac.org/pictograms/12252/12252_500.png" },
  "origen": "texto"
}
```

Los errores llegan con un código estable y un mensaje ya escrito en fácil:

```json
{ "error": "tiempo-agotado", "mensaje": "El texto ha tardado demasiado. Prueba otra vez, o con un texto más corto." }
```

## Accesibilidad

- Tipografía Atkinson Hyperlegible, pensada para baja visión.
- Tres tamaños de letra y modo de contraste alto, que se recuerdan en el dispositivo.
- Lectura en voz alta del documento entero o de cada frase.
- Navegación por teclado, enlace de salto al contenido, `aria-live` en los avisos
  y foco que se mueve al resultado cuando está listo.
- Objetivos táctiles de 48 píxeles como mínimo.
- Impresión limpia en PDF, sin los controles de la interfaz.

## Estructura

```
server/            Backend Express (aquí vive la clave)
  src/prompts.js     Reglas de lectura fácil por tipo de documento
  src/esquema.js     Valida y normaliza lo que responde el modelo
  src/servicios/     Clientes de MiniMax y de ARASAAC
web/               Frontend React + Vite
  src/componentes/   Interfaz
  src/hooks/         Voz alta y ajustes de lectura
```

## Aviso importante

La adaptación la hace una máquina. **Antes de usarla de verdad, una persona debe
revisarla**, sobre todo en textos de salud. La aplicación lo dice también en
pantalla, junto a cada resultado.

## Créditos

Pictogramas de [ARASAAC](https://arasaac.org) (Gobierno de Aragón), autor Sergio
Palao, licencia CC BY-NC-SA.
