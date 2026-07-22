const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'haica_demo',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 5000,
})

async function connect() {
  try {
    const conn = await pool.getConnection()
    console.log('✅ Database connected')
    await conn.query(`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        user_agent VARCHAR(512),
        device_type VARCHAR(50),
        browser VARCHAR(100),
        os VARCHAR(100),
        referrer VARCHAR(512),
        page VARCHAR(512),
        consent_given TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    conn.release()
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
    throw err
  }
}

module.exports = { pool, connect }
