import { Router } from 'express';
import { getPool, sql } from '../utils/db.js';
const router = Router();

// Registrar venta usando SP
router.post('/', async (req, res) => {
  const { cliente_id, items } = req.body;
  try {
    const pool = await getPool();
    const tvp = new sql.Table();
    tvp.columns.add('medicamento_id', sql.Int);
    tvp.columns.add('cantidad', sql.Int);
    tvp.columns.add('precio_unitario', sql.Decimal(10, 2));
    items.forEach(i => tvp.rows.add(i.medicamento_id, i.cantidad, i.precio_unitario));
    await pool.request().input('cliente_id', sql.Int, cliente_id).input('detalle', tvp).execute('sp_registrar_venta');
    res.json({ ok: true, msg: 'Venta registrada correctamente' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

export default router;