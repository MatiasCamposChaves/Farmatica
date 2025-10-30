import { Router } from 'express';
import { getPool, sql } from '../utils/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const { search = '', categoria = '' } = req.query;

    let q = `
      SELECT id, codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor
      FROM dbo.medicamentos
      WHERE 1=1
    `;
    const r = pool.request();

    if (search) {
      q += ' AND (nombre LIKE @s OR codigo LIKE @s) ';
      r.input('s', sql.NVarChar, `%${search}%`);
    }
    if (categoria) {
      q += ' AND categoria = @cat ';
      r.input('cat', sql.NVarChar, categoria);
    }

    q += ' ORDER BY nombre ASC';

    const { recordset } = await r.query(q);
    res.json({ ok: true, data: recordset });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Crear medicamento
router.post('/', async (req, res) => {
  const { codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('codigo', sql.NVarChar, codigo)
      .input('nombre', sql.NVarChar, nombre)
      .input('categoria', sql.NVarChar, categoria || null)
      .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
      .input('stock_actual', sql.Int, stock_actual ?? 0)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento || null)
      .input('proveedor', sql.NVarChar, proveedor || null)
      .query(`
        INSERT INTO dbo.medicamentos (codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor)
        VALUES (@codigo, @nombre, @categoria, @precio_unitario, @stock_actual, @fecha_vencimiento, @proveedor)
      `);
    res.json({ ok: true, msg: 'Medicamento agregado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Actualizar medicamento
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor } = req.body;
  try {
    const pool = await getPool();
    const { rowsAffected } = await pool.request()
      .input('id', sql.Int, id)
      .input('codigo', sql.NVarChar, codigo)
      .input('nombre', sql.NVarChar, nombre)
      .input('categoria', sql.NVarChar, categoria || null)
      .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
      .input('stock_actual', sql.Int, stock_actual)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento || null)
      .input('proveedor', sql.NVarChar, proveedor || null)
      .query(`
        UPDATE dbo.medicamentos
        SET codigo=@codigo, nombre=@nombre, categoria=@categoria,
            precio_unitario=@precio_unitario, stock_actual=@stock_actual,
            fecha_vencimiento=@fecha_vencimiento, proveedor=@proveedor
        WHERE id=@id
      `);
    if (!rowsAffected?.[0]) return res.status(404).json({ ok: false, msg: 'Medicamento no existe' });
    res.json({ ok: true, msg: 'Medicamento actualizado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Eliminar medicamento
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const { rowsAffected } = await pool.request()
      .input('id', sql.Int, Number(req.params.id))
      .query('DELETE FROM dbo.medicamentos WHERE id=@id');
    if (!rowsAffected?.[0]) return res.status(404).json({ ok: false, msg: 'Medicamento no existe' });
    res.json({ ok: true, msg: 'Medicamento eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

export default router;