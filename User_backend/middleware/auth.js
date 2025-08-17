const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Invalid token attempt from ${req.ip}`)
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    
    req.user = user
    next()
  })
}

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user
      }
    })
  }
  
  next()
}

module.exports = {
  authenticateToken,
  optionalAuth
}