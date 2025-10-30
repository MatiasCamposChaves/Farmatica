import sql from 'mssql';
import 'dotenv/config';

const config = {
  server: 'localhost',              // o 'Matias\\SQLEXPRESS' si falla el puerto
  database: 'Farmatica',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: 'SQLEXPRESS'      // muy importante
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',                   // vacío si no usás dominio
      userName: process.env.USERNAME, // usuario de Windows
      password: process.env.USERDOMAIN || '' // normalmente vacío
    }
  }
};

let pool;
export async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    console.log('✅ SQL Server conectado (Windows Auth)');
    return pool;
  } catch (err) {
    console.error('❌ Error conectando a SQL Server:', err);
    throw err;
  }
}

export { sql };