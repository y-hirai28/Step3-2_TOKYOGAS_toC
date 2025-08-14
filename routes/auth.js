const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const { getPool, sql } = require('../config/database')
const logger = require('../utils/logger')

const router = express.Router()

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Login endpoint
router.post('/login', [
  body('loginType').isIn(['general', 'tokyogas']),
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('customerNumber').optional().isLength({ min: 1 }),
  body('companyCode').optional().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { loginType, email, password, customerNumber, companyCode } = req.body
    const pool = getPool()
    let user = null
    let query = ''
    
    if (loginType === 'tokyogas') {
      // 東京ガス連携ログイン
      if (!customerNumber) {
        return res.status(400).json({ error: 'Customer number is required' })
      }
      
      query = `
        SELECT id, name, email, department, points, tokyogas_customer_number 
        FROM Users 
        WHERE tokyogas_customer_number = @customerNumber
      `
      
      const result = await pool.request()
        .input('customerNumber', sql.NVarChar, customerNumber)
        .query(query)
      
      user = result.recordset[0]
    } else {
      // 一般ログイン
      if (!email || !password || !companyCode) {
        return res.status(400).json({ error: 'Email, password, and company code are required' })
      }
      
      query = `
        SELECT id, name, email, password_hash, department, points, company_code 
        FROM Users 
        WHERE email = @email AND company_code = @companyCode
      `
      
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('companyCode', sql.NVarChar, companyCode)
        .query(query)
      
      const dbUser = result.recordset[0]
      
      if (dbUser && await bcrypt.compare(password, dbUser.password_hash)) {
        user = dbUser
      }
    }
    
    if (!user) {
      logger.warn(`Failed login attempt - Type: ${loginType}, Email: ${email}, Customer: ${customerNumber}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name,
        department: user.department 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    logger.info(`Successful login - User: ${user.name}, Type: ${loginType}`)
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        points: user.points
      }
    })
    
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Register endpoint
router.post('/register', [
  body('name').isLength({ min: 1 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('companyCode').isLength({ min: 1 }).trim(),
  body('department').isLength({ min: 1 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, companyCode, department, tokyogasCustomerNumber } = req.body
    const pool = getPool()
    
    // Check if user already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Users WHERE email = @email')
    
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Insert new user
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, hashedPassword)
      .input('companyCode', sql.NVarChar, companyCode)
      .input('department', sql.NVarChar, department)
      .input('tokyogasCustomerNumber', sql.NVarChar, tokyogasCustomerNumber || null)
      .query(`
        INSERT INTO Users (name, email, password_hash, company_code, department, tokyogas_customer_number)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.department, INSERTED.points
        VALUES (@name, @email, @passwordHash, @companyCode, @department, @tokyogasCustomerNumber)
      `)
    
    const newUser = result.recordset[0]
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        name: newUser.name,
        department: newUser.department 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    logger.info(`New user registered: ${newUser.name} (${newUser.email})`)
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        points: newUser.points || 0
      }
    })
    
  } catch (error) {
    logger.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

module.exports = router