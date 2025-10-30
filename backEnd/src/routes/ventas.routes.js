import { Router } from 'express';
import { getPool, sql } from '../db.js';
import { ok, badRequest, fail } from '../utils/http.js';

const router = Router();

/**
 * POST /api/ventas
 * body: {
 *   cliente_id: 1 | null,
 *   items: [{ medicamento_id: 1, cantidad: 2, precio_unitario: 350.00 }, ...]
 * }
 */
router.post('/ventas', async (req, res) => {
  try {
    const { cliente_id = null, items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return badRequest(res, 'items es requerido');

    const pool = await getPool();

    // Construir TVP dbo.TVP_DetalleVenta
    const tvp = new sql.Table('TVP_DetalleVenta');
    tvp.columns.add('medicamento_id', sql.Int, { nullable: false });
    tvp.columns.add('cantidad', sql.Int, { nullable: false });
    tvp.columns.add('precio_unitario', sql.Decimal(10, 2), { nullable: false });
    for (const it of items) {
      tvp.rows.add(Number(it.medicamento_id), Number(it.cantidad), Number(it.precio_unitario));
    }

    const request = pool.request();
    request.input('cliente_id', sql.Int, cliente_id !== null ? Number(cliente_id) : null);
    request.input('detalle', tvp);

    const r = await request.execute('sp_registrar_venta');

    // Después de ejecutar, devolvemos venta más reciente del cliente (simple)
    const { recordset } = await pool.request().query(`
      SELECT TOP 1 id, cliente_id, fecha, total
      FROM dbo.ventas
      ORDER BY id DESC;
    `);

    return ok(res, { venta: recordset[0] });
  } catch (err) {
    return fail(res, err);
  }
});

export default router;