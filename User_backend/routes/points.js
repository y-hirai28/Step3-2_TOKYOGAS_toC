const express = require('express')
const { getPool, sql } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

// Get user points balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const pool = getPool()
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT points FROM Users WHERE id = @userId')
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      points: result.recordset[0].points || 0,
      userId: userId
    })
    
  } catch (error) {
    logger.error('Points balance error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get points history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 50, offset = 0 } = req.query
    const pool = getPool()
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT id, points, type, description, created_at
        FROM PointHistory 
        WHERE user_id = @userId 
        ORDER BY created_at DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `)
    
    res.json({
      history: result.recordset,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    })
    
  } catch (error) {
    logger.error('Points history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Award points
router.post('/award', authenticateToken, async (req, res) => {
  try {
    const { points, description } = req.body
    const userId = req.user.userId
    const pool = getPool()
    
    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Points must be a positive number' })
    }
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }
    
    const transaction = pool.transaction()
    
    try {
      await transaction.begin()
      
      // Add points to user
      await transaction.request()
        .input('userId', sql.Int, userId)
        .input('points', sql.Int, points)
        .query('UPDATE Users SET points = points + @points WHERE id = @userId')
      
      // Record in history
      await transaction.request()
        .input('userId', sql.Int, userId)
        .input('points', sql.Int, points)
        .input('description', sql.NVarChar, description)
        .query(`
          INSERT INTO PointHistory (user_id, points, type, description)
          VALUES (@userId, @points, 'earn', @description)
        `)
      
      await transaction.commit()
      
      logger.info(`Points awarded - User: ${userId}, Points: ${points}, Description: ${description}`)
      
      res.json({
        success: true,
        pointsAwarded: points,
        description: description
      })
      
    } catch (error) {
      await transaction.rollback()
      throw error
    }
    
  } catch (error) {
    logger.error('Award points error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Redeem points
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { points, description, rewardId } = req.body
    const userId = req.user.userId
    const pool = getPool()
    
    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Points must be a positive number' })
    }
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }
    
    const transaction = pool.transaction()
    
    try {
      await transaction.begin()
      
      // Check user has enough points
      const userResult = await transaction.request()
        .input('userId', sql.Int, userId)
        .query('SELECT points FROM Users WHERE id = @userId')
      
      const currentPoints = userResult.recordset[0].points
      
      if (currentPoints < points) {
        await transaction.rollback()
        return res.status(400).json({ error: 'Insufficient points' })
      }
      
      // Deduct points from user
      await transaction.request()
        .input('userId', sql.Int, userId)
        .input('points', sql.Int, points)
        .query('UPDATE Users SET points = points - @points WHERE id = @userId')
      
      // Record in history
      await transaction.request()
        .input('userId', sql.Int, userId)
        .input('points', sql.Int, points)
        .input('description', sql.NVarChar, description)
        .query(`
          INSERT INTO PointHistory (user_id, points, type, description)
          VALUES (@userId, @points, 'redeem', @description)
        `)
      
      // If reward redemption, record it
      if (rewardId) {
        await transaction.request()
          .input('userId', sql.Int, userId)
          .input('rewardId', sql.Int, rewardId)
          .input('points', sql.Int, points)
          .query(`
            INSERT INTO RewardRedemptions (user_id, reward_id, points_used)
            VALUES (@userId, @rewardId, @points)
          `)
      }
      
      await transaction.commit()
      
      logger.info(`Points redeemed - User: ${userId}, Points: ${points}, Description: ${description}`)
      
      res.json({
        success: true,
        pointsRedeemed: points,
        remainingPoints: currentPoints - points,
        description: description
      })
      
    } catch (error) {
      await transaction.rollback()
      throw error
    }
    
  } catch (error) {
    logger.error('Redeem points error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get available rewards
router.get('/rewards', async (req, res) => {
  try {
    const pool = getPool()
    
    const result = await pool.request()
      .query(`
        SELECT id, name, description, points_required, category
        FROM Rewards 
        WHERE is_active = 1
        ORDER BY points_required ASC
      `)
    
    res.json({
      rewards: result.recordset
    })
    
  } catch (error) {
    logger.error('Get rewards error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router