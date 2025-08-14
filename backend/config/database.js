const sql = require('mssql')
const logger = require('../utils/logger')

const dbConfig = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USERNAME,
  password: process.env.AZURE_SQL_PASSWORD,
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

let pool = null

const initializeDatabase = async () => {
  try {
    if (pool) {
      await pool.close()
    }
    
    pool = await sql.connect(dbConfig)
    logger.info('✅ Connected to Azure SQL Database')
    
    // Connection error handling
    pool.on('error', (err) => {
      logger.error('Database connection error:', err)
    })
    
    return pool
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message)
    throw error
  }
}

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return pool
}

const closeDatabase = async () => {
  if (pool) {
    await pool.close()
    pool = null
    logger.info('🔌 Database connection closed')
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await closeDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeDatabase()
  process.exit(0)
})

module.exports = {
  initializeDatabase,
  getPool,
  closeDatabase,
  sql
}