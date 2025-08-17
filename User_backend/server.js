require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const logger = require('./utils/logger')

// Route imports
const authRoutes = require('./routes/auth')
const energyRoutes = require('./routes/energy')
const pointsRoutes = require('./routes/points')
const rankingRoutes = require('./routes/ranking')
const uploadRoutes = require('./routes/upload')
const aiRoutes = require('./routes/ai')

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト制限
  message: 'Too many requests from this IP'
})
app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/energy', energyRoutes)
app.use('/api/points', pointsRoutes)
app.use('/api/ranking', rankingRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/ai', aiRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})