const express = require('express')
const { query } = require('express-validator')
const { getPool, sql } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

// Get energy usage data
router.get('/usage', authenticateToken, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020, max: 2030 })
], async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query
    const userId = req.user.userId
    const pool = getPool()
    
    // Current month usage
    const currentUsageResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .query(`
        SELECT 
          energy_type,
          SUM(amount) as total_amount,
          SUM(cost) as total_cost,
          MAX(unit) as unit
        FROM EnergyUsage 
        WHERE user_id = @userId 
          AND MONTH(usage_date) = @month 
          AND YEAR(usage_date) = @year
        GROUP BY energy_type
      `)
    
    // Previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    
    const prevUsageResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('prevMonth', sql.Int, prevMonth)
      .input('prevYear', sql.Int, prevYear)
      .query(`
        SELECT 
          energy_type,
          SUM(amount) as total_amount,
          SUM(cost) as total_cost
        FROM EnergyUsage 
        WHERE user_id = @userId 
          AND MONTH(usage_date) = @prevMonth 
          AND YEAR(usage_date) = @prevYear
        GROUP BY energy_type
      `)
    
    // Format data
    const currentData = {}
    const prevData = {}
    
    currentUsageResult.recordset.forEach(record => {
      currentData[record.energy_type] = {
        amount: record.total_amount,
        cost: record.total_cost,
        unit: record.unit
      }
    })
    
    prevUsageResult.recordset.forEach(record => {
      prevData[record.energy_type] = {
        amount: record.total_amount,
        cost: record.total_cost
      }
    })
    
    // Calculate reduction percentages
    const calculateReduction = (current, previous) => {
      if (!previous || previous === 0) return 0
      return Math.round(((previous - current) / previous) * 100 * 10) / 10
    }
    
    const response = {
      gas: {
        amount: currentData.gas?.amount || 0,
        cost: currentData.gas?.cost || 0,
        unit: currentData.gas?.unit || 'm³',
        reduction: calculateReduction(
          currentData.gas?.amount || 0,
          prevData.gas?.amount || 0
        )
      },
      electricity: {
        amount: currentData.electricity?.amount || 0,
        cost: currentData.electricity?.cost || 0,
        unit: currentData.electricity?.unit || 'kWh',
        reduction: calculateReduction(
          currentData.electricity?.amount || 0,
          prevData.electricity?.amount || 0
        )
      },
      water: {
        amount: currentData.water?.amount || 0,
        cost: currentData.water?.cost || 0,
        unit: currentData.water?.unit || 'm³',
        reduction: calculateReduction(
          currentData.water?.amount || 0,
          prevData.water?.amount || 0
        )
      },
      month: parseInt(month),
      year: parseInt(year)
    }
    
    res.json(response)
    
  } catch (error) {
    logger.error('Energy usage fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add energy usage data
router.post('/usage', authenticateToken, async (req, res) => {
  try {
    const { energyType, amount, cost, unit, usageDate } = req.body
    const userId = req.user.userId
    const pool = getPool()
    
    if (!energyType || !amount || !cost || !unit || !usageDate) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('energyType', sql.NVarChar, energyType)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('cost', sql.Decimal(10, 2), cost)
      .input('unit', sql.NVarChar, unit)
      .input('usageDate', sql.Date, usageDate)
      .query(`
        INSERT INTO EnergyUsage (user_id, energy_type, amount, cost, unit, usage_date)
        OUTPUT INSERTED.id
        VALUES (@userId, @energyType, @amount, @cost, @unit, @usageDate)
      `)
    
    const newRecordId = result.recordset[0].id
    
    logger.info(`Energy usage added - User: ${userId}, Type: ${energyType}, Amount: ${amount}`)
    
    res.status(201).json({
      success: true,
      id: newRecordId,
      message: 'Energy usage data added successfully'
    })
    
  } catch (error) {
    logger.error('Energy usage add error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get usage history
router.get('/history', authenticateToken, [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const userId = req.user.userId
    const pool = getPool()
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          id, energy_type, amount, cost, unit, usage_date, created_at
        FROM EnergyUsage 
        WHERE user_id = @userId 
        ORDER BY usage_date DESC, created_at DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `)
    
    res.json({
      data: result.recordset,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.recordset.length
      }
    })
    
  } catch (error) {
    logger.error('Energy usage history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router