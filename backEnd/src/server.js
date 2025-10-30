import express from 'express';
import cors from 'cors';
import { getPool } from './utils/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rutas básicas
import authRoutes from './routes/auth.routes.js';
import medicamentosRoutes from './routes/medicamentos.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await getPool();
    res.json({ ok: true, msg: 'API up' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'DB down', error });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(` API escuchando en http://localhost:${PORT}`);
});