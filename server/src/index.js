import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';

import { config, claveConfigurada } from './config.js';
import { limitarPeticiones } from './middleware/limite.js';
import { manejarErrores } from './middleware/errores.js';
import { rutaSimplificar } from './rutas/simplificar.js';
import { rutaPictogramas } from './rutas/pictogramas.js';
import { modelosEnUso } from './servicios/minimax.js';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const carpetaWeb = path.resolve(aqui, '../../web/dist');

const app = express();

// Detrás de un proxy (Render, Railway, Nginx) para que req.ip sea la real.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Parser de query strings sencillo (el de Node). No necesitamos objetos
// anidados en la URL y así 'qs' se queda fuera de la ruta de ejecución.
app.set('query parser', 'simple');

app.use(cors({
  origin(origen, callback) {
    // Sin origen: peticiones del mismo servidor, curl o apps móviles.
    if (!origen || config.origenesPermitidos.includes(origen)) return callback(null, true);
    return callback(new Error('origen-no-permitido'));
  },
}));

app.use(express.json({ limit: config.tamanoMaximoCuerpo }));

app.get('/api/salud', (req, res) => {
  res.json({
    ok: true,
    claveConfigurada,
    modelos: modelosEnUso(),
    limitePorMinuto: config.limitePorMinuto,
  });
});

app.use('/api/simplificar', limitarPeticiones, rutaSimplificar);
app.use('/api/pictogramas', limitarPeticiones, rutaPictogramas);

// En producción el mismo servidor sirve la web ya compilada.
if (fs.existsSync(carpetaWeb)) {
  app.use(express.static(carpetaWeb));
  app.use((req, res, siguiente) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return siguiente();
    return res.sendFile(path.join(carpetaWeb, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'no-encontrado', mensaje: 'Esa dirección no existe.' });
});

app.use(manejarErrores);

app.listen(config.puerto, () => {
  console.log(`Entiende escuchando en http://localhost:${config.puerto}`);
  console.log(`Modelo de texto: ${config.minimax.modeloTexto} · modelo de fotos: ${config.minimax.modeloVision}`);
  if (!claveConfigurada) {
    console.warn('AVISO: falta MINIMAX_API_KEY. Copia server/.env.example a server/.env y pon tu clave.');
  }
});
