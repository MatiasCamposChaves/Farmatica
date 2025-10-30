import { Router } from 'express';
import { getPool } from '../db.js';
import { ok, fail } from '../utils/http.js';

const router = Router();

router.get('/dashboard/resumen', async (_req, res) => {
  try {
    const pool = await getPool();
    const { recordset } = await pool.request().query('SELECT * FROM dbo.vwDashboardResumen;');
    return ok(res, recordset[0] || {});
  } catch (err) {
    return fail(res, err);
  }
});

export default router;