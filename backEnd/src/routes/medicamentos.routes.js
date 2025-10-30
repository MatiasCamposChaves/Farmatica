import { Router } from 'express';
import { getPool, sql } from '../db.js';
import { ok, created, badRequest, notFound, fail } from '../utils/http.js';

const router = Router();

// GET /api/medicamentos?search=&categoria=
router.get('/medicamentos', async (req, res) => {
  try {
    const pool = await getPool();
    const { search = '', categoria = '' } = req.query;

    let q = `
      SELECT id, codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor
      FROM dbo.medicamentos
      WHERE 1=1
    `;
    const request = pool.request();
    if (search) {
      q += ' AND (nombre LIKE @s OR codigo LIKE @s) ';
      request.input('s', sql.NVarChar, `%${search}%`);
    }
    if (categoria) {
      q += ' AND categoria = @cat ';
      request.input('cat', sql.NVarChar, categoria);
    }
    q += ' ORDER BY nombre';

    const { recordset } = await request.query(q);
    return ok(res, recordset);
  } catch (err) {
    return fail(res, err);
  }
});

// POST /api/medicamentos
router.post('/medicamentos', async (req, res) => {
  try {
    const { codigo, nombre, categoria, precio_unitario, stock_actual = 0, fecha_vencimiento = null, proveedor } = req.body || {};
    if (!codigo || !nombre || precio_unitario == null) return badRequest(res, 'codigo, nombre y precio_unitario son requeridos');

    const pool = await getPool();
    const r = await pool.request()
      .input('codigo', sql.NVarChar(40), codigo)
      .input('nombre', sql.NVarChar(120), nombre)
      .input('categoria', sql.NVarChar(60), categoria || null)
      .input('precio', sql.Decimal(10, 2), precio_unitario)
      .input('stock', sql.Int, stock_actual)
      .input('venci', sql.Date, fecha_vencimiento ? new Date(fecha_vencimiento) : null)
      .input('prov', sql.NVarChar(80), proveedor || null)
      .query(`
        INSERT INTO dbo.medicamentos (codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor)
        VALUES (@codigo, @nombre, @categoria, @precio, @stock, @venci, @prov);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    return created(res, { id: Number(r.recordset[0].id) });
  } catch (err) {
    return fail(res, err);
  }
});

// PUT /api/medicamentos/:id
router.put('/medicamentos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor } = req.body || {};
    const pool = await getPool();

    const r = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar(120), nombre || null)
      .input('categoria', sql.NVarChar(60), categoria || null)
      .input('precio', sql.Decimal(10, 2), precio_unitario != null ? precio_unitario : null)
      .input('stock', sql.Int, stock_actual != null ? stock_actual : null)
      .input('venci', sql.Date, fecha_vencimiento ? new Date(fecha_vencimiento) : null)
      .input('prov', sql.NVarChar(80), proveedor || null)
      .query(`
        IF NOT EXISTS(SELECT 1 FROM dbo.medicamentos WHERE id=@id) BEGIN
          SELECT CAST(0 AS INT) AS updated;
          RETURN;
        END
        UPDATE dbo.medicamentos
        SET nombre = COALESCE(@nombre, nombre),
            categoria = @categoria,
            precio_unitario = COALESCE(@precio, precio_unitario),
            stock_actual = COALESCE(@stock, stock_actual),
            fecha_vencimiento = @venci,
            proveedor = @prov
        WHERE id = @id;
        SELECT CAST(1 AS INT) AS updated;
      `);

    if (!r.recordset[0].updated) return notFound(res, 'Medicamento no existe');
    return ok(res, { updated: true });
  } catch (err) {
    return fail(res, err);
  }
});

// DELETE /api/medicamentos/:id
router.delete('/medicamentos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const pool = await getPool();
    const r = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM dbo.medicamentos WHERE id=@id;
        SELECT @@ROWCOUNT AS deleted;
      `);
    if (!r.recordset[0].deleted) return notFound(res, 'Medicamento no existe');
    return ok(res, { deleted: true });
  } catch (err) {
    return fail(res, err);
  }
});

export default router;