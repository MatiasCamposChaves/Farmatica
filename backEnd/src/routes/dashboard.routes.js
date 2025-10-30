import { Router } from 'express';
import { getPool } from '../utils/db.js';
const router = Router();

router.get('/resumen', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM vwDashboardResumen');
    res.json({ ok: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

export default router;