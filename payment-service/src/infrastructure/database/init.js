const { Pool } = require('pg');
const env = require('../../config/env');

async function initDb() {
  const pool = new Pool(env.database);

  const query = `
    CREATE TABLE IF NOT EXISTS payments (
      order_id VARCHAR(255) PRIMARY KEY,
      amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log('Initializing database table...');
    await pool.query(query);
    console.log('Database table "payments" is ready.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDb().catch(() => process.exit(1));
}

module.exports = { initDb };
