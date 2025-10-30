import sql from 'mssql/msnodesqlv8.js';
import util from 'node:util';

const connectionString =
  'Server=MATIAS\\SQLEXPRESS;' +
  'Database=Farmatica;' +
  'Trusted_Connection=Yes;' +
  'Driver={ODBC Driver 17 for SQL Server};' +
  'Encrypt=Yes;' +
  'TrustServerCertificate=Yes;';

let pool;

export async function getPool() {
  if (pool && pool.connected) return pool;
  try {
    pool = await sql.connect({ connectionString, driver: 'msnodesqlv8' });
    console.log('Conectado a SQL Server');
    return pool;
  } catch (e) {
    console.error('Error conectando a SQL Server:\n', util.inspect(e, { depth: 6, colors: true }));
    throw e;
  }
}

export { sql };