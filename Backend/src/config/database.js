const { Pool } = require('pg');

let pool;

const connectDB = async () => {
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    // Se estiver usando Supabase, usar a URL de conexão
    if (process.env.DB_URL) {
      config.connectionString = process.env.DB_URL;
    }

    pool = new Pool(config);

    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');
    client.release();

    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    throw error;
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executou query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

const getClient = async () => {
  return await pool.connect();
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('🔌 Pool de conexões fechado');
  }
};

// Graceful shutdown
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

module.exports = {
  connectDB,
  query,
  getClient,
  closePool
};
