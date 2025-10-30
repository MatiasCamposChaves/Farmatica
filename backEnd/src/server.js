import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import medRoutes from './routes/medicamentos.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import dashRoutes from './routes/dashboard.routes.js';
import { getPool } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck / conectar pool una vez
app.get('/health', async (_req, res) => {
  try {
    await getPool();
    res.json({ ok: true, msg: 'API up' });
  } catch (e) {
    res.status(500).json({ ok: false, msg: 'DB down', detail: String(e) });
  }
});

// Rutas
app.use('/api', authRoutes);
app.use('/api', medRoutes);
app.use('/api', ventasRoutes);
app.use('/api', dashRoutes);

// 404
app.use((req, res) => res.status(404).json({ ok: false, msg: 'Ruta no encontrada' }));

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));