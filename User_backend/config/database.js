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
    // Check if database configuration is available
    if (!process.env.AZURE_SQL_SERVER || process.env.AZURE_SQL_SERVER === 'your-server.database.windows.net') {
      logger.warn('⚠️ Azure SQL Database not configured - running in development mode without database')
      return null
    }

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
    logger.warn('🔧 Running in development mode without database connection')
    return null
  }
}

const getPool = () => {
  if (!pool) {
    logger.warn('Database not available - returning null (development mode)')
    return null
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