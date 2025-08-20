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
  body('companyCode').optional().isLength({ min: 1 }),
  body('employeeId').optional().isLength({ min: 1 }),
  body('userName').optional().isLength({ min: 1 }),
  body('department').optional().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { loginType, email, password, customerNumber, companyCode, employeeId, userName, department } = req.body
    const pool = getPool()
    let user = null
    
    // Development mode - bypass database authentication
    if (!pool) {
      logger.warn('Development mode: Using mock authentication')
      
      if (loginType === 'tokyogas') {
        if (!customerNumber) {
          return res.status(400).json({ error: 'Customer number is required' })
        }
        user = {
          id: 1,
          name: '東京ガステストユーザー',
          email: 'tokyogas@example.com',
          department: 'エネルギー管理部',
          points: 1500,
          tokyogas_customer_number: customerNumber
        }
      } else {
        if (!email || !password || !companyCode || !employeeId || !userName || !department) {
          return res.status(400).json({ error: 'Email, password, company code, employee ID, name, and department are required' })
        }
        user = {
          id: 1,
          name: userName,
          email: email,
          department: department,
          points: 1200,
          company_code: companyCode,
          employee_id: employeeId
        }
      }
    } else {
      // Production mode - use database authentication
      let query = ''
      
      if (loginType === 'tokyogas') {
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
        if (!email || !password || !companyCode || !employeeId || !userName || !department) {
          return res.status(400).json({ error: 'Email, password, company code, employee ID, name, and department are required' })
        }
        
        query = `
          SELECT id, name, email, password_hash, department, points, company_code, employee_id 
          FROM Users 
          WHERE email = @email AND company_code = @companyCode AND employee_id = @employeeId
        `
        
        const result = await pool.request()
          .input('email', sql.NVarChar, email)
          .input('companyCode', sql.NVarChar, companyCode)
          .input('employeeId', sql.NVarChar, employeeId)
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
  body('registerType').isIn(['general', 'tokyogas']),
  body('userName').isLength({ min: 1 }).trim(),
  body('password').isLength({ min: 6 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('companyCode').optional().isLength({ min: 1 }).trim(),
  body('employeeId').optional().isLength({ min: 1 }).trim(),
  body('department').optional().trim(),
  body('position').optional().trim(),
  body('customerNumber').optional().isLength({ min: 1 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { 
      registerType, 
      userName, 
      email, 
      password, 
      companyCode, 
      employeeId, 
      department, 
      position, 
      customerNumber 
    } = req.body
    
    const pool = getPool()
    
    // Development mode - bypass database registration
    if (!pool) {
      logger.warn('Development mode: Using mock registration')
      
      const newUser = {
        id: Date.now(), // Use timestamp as mock ID
        name: userName,
        email: email || `${customerNumber}@tokyogas.com`,
        department: department || 'テスト部署',
        points: 0,
        company_code: companyCode,
        employee_id: employeeId,
        tokyogas_customer_number: customerNumber
      }
      
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
      
      logger.info(`Mock registration successful: ${userName}`)
      
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          department: newUser.department,
          points: newUser.points
        }
      })
    }
    
    // Production mode - use database registration
    let existingUserQuery = ''
    let existingUser = null
    
    if (registerType === 'tokyogas') {
      if (!customerNumber || !email || !companyCode || !employeeId) {
        return res.status(400).json({ error: 'Customer number, email, company code, and employee ID are required for Tokyo Gas registration' })
      }
      
      // Check if customer number already exists
      existingUserQuery = 'SELECT id FROM Users WHERE tokyogas_customer_number = @customerNumber OR email = @email'
      existingUser = await pool.request()
        .input('customerNumber', sql.NVarChar, customerNumber)
        .input('email', sql.NVarChar, email)
        .query(existingUserQuery)
    } else {
      if (!email || !companyCode || !employeeId) {
        return res.status(400).json({ error: 'Email, company code, and employee ID are required for general registration' })
      }
      
      // Check if email already exists
      existingUserQuery = 'SELECT id FROM Users WHERE email = @email'
      existingUser = await pool.request()
        .input('email', sql.NVarChar, email)
        .query(existingUserQuery)
    }
    
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Insert new user
    let insertQuery = ''
    let request = pool.request()
      .input('userName', sql.NVarChar, userName)
      .input('passwordHash', sql.NVarChar, hashedPassword)
    
    if (registerType === 'tokyogas') {
      request = request
        .input('customerNumber', sql.NVarChar, customerNumber)
        .input('email', sql.NVarChar, email)
        .input('companyCode', sql.NVarChar, companyCode)
        .input('employeeId', sql.NVarChar, employeeId)
        .input('department', sql.NVarChar, department || '')
        .input('position', sql.NVarChar, position || '')
      
      insertQuery = `
        INSERT INTO Users (name, email, password_hash, tokyogas_customer_number, company_code, employee_id, department, position)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.department, INSERTED.points
        VALUES (@userName, @email, @passwordHash, @customerNumber, @companyCode, @employeeId, @department, @position)
      `
    } else {
      request = request
        .input('email', sql.NVarChar, email)
        .input('companyCode', sql.NVarChar, companyCode)
        .input('employeeId', sql.NVarChar, employeeId)
        .input('department', sql.NVarChar, department || '')
        .input('position', sql.NVarChar, position || '')
      
      insertQuery = `
        INSERT INTO Users (name, email, password_hash, company_code, employee_id, department, position)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.department, INSERTED.points
        VALUES (@userName, @email, @passwordHash, @companyCode, @employeeId, @department, @position)
      `
    }
    
    const result = await request.query(insertQuery)
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
    
    logger.info(`New user registered: ${newUser.name} (${newUser.email}) - Type: ${registerType}`)
    
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