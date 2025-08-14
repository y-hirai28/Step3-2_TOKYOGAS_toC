const express = require('express')
const { getPool, sql } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

// Get individual rankings
router.get('/individual', authenticateToken, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query
    const pool = getPool()
    
    const result = await pool.request()
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .query(`
        SELECT 
          u.id,
          u.name,
          u.department,
          u.points,
          mr.reduction_rate,
          mr.rank_individual,
          ROW_NUMBER() OVER (ORDER BY mr.reduction_rate DESC, u.points DESC) as current_rank
        FROM Users u
        LEFT JOIN MonthlyRanking mr ON u.id = mr.user_id 
          AND mr.month = @month 
          AND mr.year = @year
        WHERE mr.reduction_rate IS NOT NULL
        ORDER BY mr.reduction_rate DESC, u.points DESC
      `)
    
    res.json({
      rankings: result.recordset,
      month: parseInt(month),
      year: parseInt(year)
    })
    
  } catch (error) {
    logger.error('Individual ranking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get department rankings
router.get('/department', authenticateToken, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query
    const pool = getPool()
    
    const result = await pool.request()
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .query(`
        SELECT 
          dr.department,
          dr.avg_reduction_rate,
          dr.total_points,
          dr.member_count,
          dr.rank_department,
          ROW_NUMBER() OVER (ORDER BY dr.avg_reduction_rate DESC) as current_rank
        FROM DepartmentRanking dr
        WHERE dr.month = @month AND dr.year = @year
        ORDER BY dr.avg_reduction_rate DESC
      `)
    
    res.json({
      rankings: result.recordset,
      month: parseInt(month),
      year: parseInt(year)
    })
    
  } catch (error) {
    logger.error('Department ranking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's ranking position
router.get('/my-position', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query
    const pool = getPool()
    
    // Get user's individual ranking
    const individualResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .query(`
        WITH RankedUsers AS (
          SELECT 
            u.id,
            u.name,
            u.department,
            u.points,
            mr.reduction_rate,
            ROW_NUMBER() OVER (ORDER BY mr.reduction_rate DESC, u.points DESC) as rank
          FROM Users u
          LEFT JOIN MonthlyRanking mr ON u.id = mr.user_id 
            AND mr.month = @month 
            AND mr.year = @year
          WHERE mr.reduction_rate IS NOT NULL
        )
        SELECT * FROM RankedUsers WHERE id = @userId
      `)
    
    // Get user's department ranking
    const departmentResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .query(`
        WITH RankedDepartments AS (
          SELECT 
            dr.department,
            dr.avg_reduction_rate,
            dr.total_points,
            dr.member_count,
            ROW_NUMBER() OVER (ORDER BY dr.avg_reduction_rate DESC) as rank
          FROM DepartmentRanking dr
          WHERE dr.month = @month AND dr.year = @year
        )
        SELECT rd.* 
        FROM RankedDepartments rd
        INNER JOIN Users u ON u.department = rd.department
        WHERE u.id = @userId
      `)
    
    res.json({
      individual: individualResult.recordset[0] || null,
      department: departmentResult.recordset[0] || null,
      month: parseInt(month),
      year: parseInt(year)
    })
    
  } catch (error) {
    logger.error('My position ranking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update monthly rankings (admin function)
router.post('/update-monthly', authenticateToken, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.body
    const pool = getPool()
    
    // Calculate individual rankings
    await pool.request()
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .query(`
        -- Delete existing rankings for the month
        DELETE FROM MonthlyRanking WHERE month = @month AND year = @year;
        
        -- Calculate and insert new rankings
        WITH UserReductions AS (
          SELECT 
            u.id as user_id,
            u.points,
            COALESCE(
              CASE 
                WHEN prev_usage.total_amount > 0 
                THEN ((prev_usage.total_amount - curr_usage.total_amount) / prev_usage.total_amount * 100)
                ELSE 0 
              END, 0
            ) as reduction_rate
          FROM Users u
          LEFT JOIN (
            SELECT 
              user_id,
              SUM(amount) as total_amount
            FROM EnergyUsage 
            WHERE MONTH(usage_date) = @month AND YEAR(usage_date) = @year
            GROUP BY user_id
          ) curr_usage ON u.id = curr_usage.user_id
          LEFT JOIN (
            SELECT 
              user_id,
              SUM(amount) as total_amount
            FROM EnergyUsage 
            WHERE MONTH(usage_date) = CASE WHEN @month = 1 THEN 12 ELSE @month - 1 END
              AND YEAR(usage_date) = CASE WHEN @month = 1 THEN @year - 1 ELSE @year END
            GROUP BY user_id
          ) prev_usage ON u.id = prev_usage.user_id
        ),
        RankedUsers AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY reduction_rate DESC, points DESC) as rank
          FROM UserReductions
          WHERE reduction_rate > 0
        )
        INSERT INTO MonthlyRanking (user_id, year, month, reduction_rate, total_points, rank_individual)
        SELECT user_id, @year, @month, reduction_rate, points, rank
        FROM RankedUsers;
      `)
    
    // Calculate department rankings
    await pool.request()
      .input('month', sql.Int, month)
      .input('year', sql.Int, year)
      .query(`
        -- Delete existing department rankings for the month
        DELETE FROM DepartmentRanking WHERE month = @month AND year = @year;
        
        -- Calculate and insert new department rankings
        WITH DepartmentStats AS (
          SELECT 
            u.department,
            AVG(mr.reduction_rate) as avg_reduction_rate,
            SUM(mr.total_points) as total_points,
            COUNT(*) as member_count
          FROM MonthlyRanking mr
          INNER JOIN Users u ON mr.user_id = u.id
          WHERE mr.month = @month AND mr.year = @year
          GROUP BY u.department
        ),
        RankedDepartments AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY avg_reduction_rate DESC) as rank
          FROM DepartmentStats
        )
        INSERT INTO DepartmentRanking (department, year, month, avg_reduction_rate, total_points, member_count, rank_department)
        SELECT department, @year, @month, avg_reduction_rate, total_points, member_count, rank
        FROM RankedDepartments;
      `)
    
    logger.info(`Monthly rankings updated for ${year}-${month}`)
    
    res.json({
      success: true,
      message: 'Monthly rankings updated successfully',
      month: parseInt(month),
      year: parseInt(year)
    })
    
  } catch (error) {
    logger.error('Update monthly rankings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get achievements and badges
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const pool = getPool()
    
    // Get user's achievements based on their performance
    const achievementsResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          -- Monthly winner
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM MonthlyRanking 
              WHERE user_id = @userId AND rank_individual = 1
            ) THEN 1 ELSE 0 
          END as monthly_winner,
          
          -- Consistent performer (top 10 for 3+ months)
          CASE 
            WHEN (
              SELECT COUNT(*) FROM MonthlyRanking 
              WHERE user_id = @userId AND rank_individual <= 10
            ) >= 3 THEN 1 ELSE 0 
          END as consistent_performer,
          
          -- High reducer (15%+ reduction)
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM MonthlyRanking 
              WHERE user_id = @userId AND reduction_rate >= 15
            ) THEN 1 ELSE 0 
          END as high_reducer,
          
          -- Points collector (1000+ points)
          CASE 
            WHEN (SELECT points FROM Users WHERE id = @userId) >= 1000 THEN 1 ELSE 0 
          END as points_collector
      `)
    
    const achievements = achievementsResult.recordset[0]
    
    // Format achievements
    const badgesList = []
    if (achievements.monthly_winner) badgesList.push({ name: '月間王者', icon: '🥇', description: '月間削減率1位を獲得' })
    if (achievements.consistent_performer) badgesList.push({ name: '継続王', icon: '🔥', description: '3ヶ月連続トップ10入り' })
    if (achievements.high_reducer) badgesList.push({ name: 'エコ達人', icon: '🌱', description: '削減率15%を達成' })
    if (achievements.points_collector) badgesList.push({ name: '成長王', icon: '📈', description: '1000ポイント達成' })
    
    res.json({
      badges: badgesList,
      totalBadges: badgesList.length
    })
    
  } catch (error) {
    logger.error('Achievements error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router