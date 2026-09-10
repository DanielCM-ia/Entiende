# Entiende

Convierte textos difíciles —informes médicos, carteles de parada de autobús,
cartas de la administración— en **lectura fácil con pictogramas**, para personas
con discapacidad intelectual, daño cerebral, personas mayores, personas con
dificultades de lectura o que están aprendiendo el idioma.

El resultado se puede leer en pantalla, **escuchar en voz alta**, copiar o
descargar en PDF.

## Cómo funciona

Es una aplicación **Next.js** (App Router): la interfaz y las rutas de API viven
en el mismo proyecto, así que todo se despliega de una vez en Vercel.

```
Navegador (React)  ──►  Rutas de API de Next  ──►  MiniMax (texto o foto)
                              │
                              └───────────────►  ARASAAC (pictogramas)
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

cp .env.example .env.local
# edita .env.local y pon tu MINIMAX_API_KEY

npm run dev
```

Se abre en http://localhost:3000

La clave se saca de la consola de MiniMax:
https://platform.minimax.io/user-center/basic-information/interface-key

Para probar la compilación de producción en local:

```bash
npm run build
npm start
```

## Despliegue en Vercel

1. Entra en [vercel.com](https://vercel.com) con la cuenta de GitHub **dueña del
   repositorio**. La cuenta con la que inicies sesión es la cuenta donde acaba
   el proyecto.
2. *Add New → Project → Import Git Repository* y elige este repositorio.
   Vercel detecta Next.js solo: no hay que tocar el comando de compilación
   ni el directorio de salida.
3. En *Settings → Environment Variables* añade `MINIMAX_API_KEY`, marcada para
   *Production* y *Preview*. La clave nunca se escribe en el repositorio.
4. *Deploy*.

Si el proyecto de Vercel se creó cuando el repositorio tenía otra forma,
comprueba en *Settings → Build and Deployment* que:

- **Root Directory** está vacío. La aplicación vive en la raíz del repositorio.
  Un valor heredado como `web` o `server` hace fallar el despliegue en segundos.
- **Framework Preset** es *Next.js*, no *Vite* ni *Other*.
- **Build Command** y **Output Directory** están en *Override: off*.

Si algo de eso quedó mal al importar, lo más rápido es borrar el proyecto en
Vercel y volver a importarlo desde `main`: la detección automática acierta.

Por línea de comandos, comprobando antes con qué cuenta estás:

```bash
npx vercel logout
npx vercel login      # con el correo de la cuenta que debe alojar el proyecto
npx vercel whoami     # confirma la cuenta antes de seguir
npx vercel link
npx vercel env add MINIMAX_API_KEY production
npx vercel --prod
```

### Límites de la plataforma que afectan a esta aplicación

- **Duración de la función.** `app/api/simplificar/route.js` declara
  `maxDuration = 60`, porque leer una foto con el modelo de visión tarda.
  Si tu plan no llega a 60 segundos, baja ese número **y también**
  `MINIMAX_TIMEOUT_MS`, que siempre debe quedar por debajo: así la persona
  usuaria recibe un mensaje en lectura fácil en vez de un 504 seco.
- **Tamaño de la petición.** Las funciones rechazan cuerpos de más de unos
  4,5 MB. Por eso el navegador reduce las fotos a 1400 píxeles de lado antes
  de subirlas (`utilidades/imagen.js`).
- **Limitador de peticiones.** Cuenta en memoria, y en serverless cada
  instancia tiene la suya. Frena picos desde una misma IP, pero no es una
  defensa seria: para eso, el firewall de Vercel o un contador compartido.
  Tenlo en cuenta si el repositorio es público, porque el gasto de la clave
  corre por cuenta de quien la pone.

## Variables de entorno

| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `MINIMAX_API_KEY` | — | Obligatoria. Tu clave de MiniMax. |
| `MINIMAX_BASE_URL` | `https://api.minimax.io/v1` | Cuenta internacional. En China continental: `https://api.minimaxi.com/v1`. |
| `MINIMAX_MODELO_TEXTO` | `MiniMax-M2.7` | Modelo para textos escritos. |
| `MINIMAX_MODELO_VISION` | `MiniMax-M3` | Modelo para fotos. Tiene que aceptar imágenes. |
| `MINIMAX_TIMEOUT_MS` | `55000` | Espera máxima al modelo. Siempre por debajo del `maxDuration` de la función. |
| `LIMITE_POR_MINUTO` | `20` | Peticiones por minuto y por IP. |

En local van en `.env.local`. En Vercel, en *Settings → Environment Variables*.

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
app/
  page.jsx           La interfaz (componente de cliente)
  layout.jsx         Estructura de la página y tipografía
  globales.css       Estilos, tamaños de letra y contraste alto
  api/               Rutas de servidor: aquí vive la clave
    simplificar/       Convierte texto o foto a lectura fácil
    pictogramas/       Busca un pictograma suelto
    salud/             Dice si la clave está puesta
lib/
  prompts.js         Reglas de lectura fácil por tipo de documento
  esquema.js         Valida y normaliza lo que responde el modelo
  minimax.js         Cliente de MiniMax
  arasaac.js         Pictogramas, con caché
  nucleo/            La lógica, sin saber nada del framework
componentes/         Interfaz
hooks/               Voz alta y ajustes de lectura
utilidades/          Reducción de fotos en el navegador
datos/               Tipos de documento y textos de ejemplo
```

## Aviso importante

La adaptación la hace una máquina. **Antes de usarla de verdad, una persona debe
revisarla**, sobre todo en textos de salud. La aplicación lo dice también en
pantalla, junto a cada resultado.

## Créditos

Pictogramas de [ARASAAC](https://arasaac.org) (Gobierno de Aragón), autor Sergio
Palao, licencia CC BY-NC-SA.
