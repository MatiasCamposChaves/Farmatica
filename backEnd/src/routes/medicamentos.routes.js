import { Router } from 'express';
import { getPool, sql } from '../utils/db.js';

const router = Router();

// Listar medicamentos
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM medicamentos ORDER BY nombre ASC');
    res.json({ ok: true, data: result.recordset });
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
      .input('categoria', sql.NVarChar, categoria)
      .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
      .input('stock_actual', sql.Int, stock_actual)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento)
      .input('proveedor', sql.NVarChar, proveedor)
      .query(`INSERT INTO medicamentos 
              (codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor)
              VALUES (@codigo, @nombre, @categoria, @precio_unitario, @stock_actual, @fecha_vencimiento, @proveedor)`);
    res.json({ ok: true, msg: 'Medicamento agregado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Actualizar medicamento
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { codigo, nombre, categoria, precio_unitario, stock_actual, fecha_vencimiento, proveedor } = req.body;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('codigo', sql.NVarChar, codigo)
      .input('nombre', sql.NVarChar, nombre)
      .input('categoria', sql.NVarChar, categoria)
      .input('precio_unitario', sql.Decimal(10, 2), precio_unitario)
      .input('stock_actual', sql.Int, stock_actual)
      .input('fecha_vencimiento', sql.Date, fecha_vencimiento)
      .input('proveedor', sql.NVarChar, proveedor)
      .query(`UPDATE medicamentos SET 
              codigo=@codigo, nombre=@nombre, categoria=@categoria, 
              precio_unitario=@precio_unitario, stock_actual=@stock_actual, 
              fecha_vencimiento=@fecha_vencimiento, proveedor=@proveedor
              WHERE id=@id`);
    res.json({ ok: true, msg: 'Medicamento actualizado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Eliminar medicamento
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM medicamentos WHERE id=@id');
    res.json({ ok: true, msg: 'Medicamento eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

export default router;