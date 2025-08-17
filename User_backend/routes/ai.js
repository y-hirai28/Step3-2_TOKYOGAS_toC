const express = require('express')
const OpenAI = require('openai')
const { getPool, sql } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Generate AI analysis for user's energy usage
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const pool = getPool()
    
    // Get user's recent energy usage data
    const usageResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          energy_type,
          amount,
          cost,
          unit,
          usage_date,
          MONTH(usage_date) as usage_month,
          YEAR(usage_date) as usage_year
        FROM EnergyUsage 
        WHERE user_id = @userId 
          AND usage_date >= DATEADD(month, -6, GETDATE())
        ORDER BY usage_date DESC
      `)
    
    if (usageResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Insufficient usage data for analysis' })
    }
    
    // Prepare data for AI analysis
    const usageData = usageResult.recordset
    const analysisPrompt = `
以下のエネルギー使用データを分析して、改善提案とコメントを日本語で提供してください：

使用データ:
${JSON.stringify(usageData, null, 2)}

以下の形式でJSON形式で回答してください：
{
  "overallScore": 85,
  "summary": "全体的な分析コメント",
  "recommendations": [
    {
      "category": "ガス",
      "title": "改善提案タイトル",
      "description": "具体的な改善提案",
      "impact": "high",
      "difficulty": "easy",
      "estimatedSavings": 1500
    }
  ],
  "patterns": {
    "peakUsage": "14:00-16:00",
    "lowUsage": "22:00-06:00",
    "weeklyTrend": "平日が多め",
    "seasonalTrend": "冬季にピーク"
  },
  "predictions": {
    "nextMonthReduction": 12.5,
    "annualSavings": 45600,
    "co2Reduction": 280
  }
}
`
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは企業エネルギー管理の専門家です。データを分析し、実用的な改善提案を提供します。"
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
    
    let analysisResult
    try {
      analysisResult = JSON.parse(completion.choices[0].message.content)
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError)
      return res.status(500).json({ error: 'Failed to parse AI analysis' })
    }
    
    // Save analysis results to database
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('analysisDate', sql.Date, new Date())
      .input('overallScore', sql.Int, analysisResult.overallScore)
      .input('recommendations', sql.NVarChar, JSON.stringify(analysisResult.recommendations))
      .input('usagePatterns', sql.NVarChar, JSON.stringify(analysisResult.patterns))
      .input('predictions', sql.NVarChar, JSON.stringify(analysisResult.predictions))
      .query(`
        INSERT INTO AIAnalysis (user_id, analysis_date, overall_score, recommendations, usage_patterns, predictions)
        VALUES (@userId, @analysisDate, @overallScore, @recommendations, @usagePatterns, @predictions)
      `)
    
    logger.info(`AI analysis completed for user ${userId}`)
    
    res.json({
      success: true,
      analysis: analysisResult,
      generatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    logger.error('AI analysis error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's AI analysis history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 10, offset = 0 } = req.query
    const pool = getPool()
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          id,
          analysis_date,
          overall_score,
          recommendations,
          usage_patterns,
          predictions,
          created_at
        FROM AIAnalysis 
        WHERE user_id = @userId 
        ORDER BY created_at DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `)
    
    // Parse JSON fields
    const analyses = result.recordset.map(record => ({
      ...record,
      recommendations: JSON.parse(record.recommendations),
      usage_patterns: JSON.parse(record.usage_patterns),
      predictions: JSON.parse(record.predictions)
    }))
    
    res.json({
      analyses: analyses,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    })
    
  } catch (error) {
    logger.error('AI analysis history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get latest AI analysis
router.get('/latest', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const pool = getPool()
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT TOP 1
          id,
          analysis_date,
          overall_score,
          recommendations,
          usage_patterns,
          predictions,
          created_at
        FROM AIAnalysis 
        WHERE user_id = @userId 
        ORDER BY created_at DESC
      `)
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No analysis found' })
    }
    
    const analysis = result.recordset[0]
    
    res.json({
      analysis: {
        ...analysis,
        recommendations: JSON.parse(analysis.recommendations),
        usage_patterns: JSON.parse(analysis.usage_patterns),
        predictions: JSON.parse(analysis.predictions)
      }
    })
    
  } catch (error) {
    logger.error('Latest AI analysis error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Generate AI comment for specific action
router.post('/comment', authenticateToken, async (req, res) => {
  try {
    const { action, context } = req.body
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' })
    }
    
    const commentPrompt = `
以下のエネルギー関連の行動について、励ましのコメントまたは改善提案を日本語で1-2文で提供してください：

行動: ${action}
${context ? `背景情報: ${context}` : ''}

ポジティブで具体的なアドバイスをお願いします。
`
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはエネルギー効率の専門家で、ユーザーの行動を評価し建設的なフィードバックを提供します。"
        },
        {
          role: "user",
          content: commentPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    })
    
    const comment = completion.choices[0].message.content
    
    res.json({
      comment: comment,
      action: action,
      generatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    logger.error('AI comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router