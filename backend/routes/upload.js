const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const { BlobServiceClient } = require('@azure/storage-blob')
const pdf = require('pdf-parse')
const sharp = require('sharp')
const { getPool, sql } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'))
    }
  }
})

// Azure Blob Storage client (optional - will skip if not configured)
let blobServiceClient = null
if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    )
  } catch (error) {
    logger.warn('Azure Storage not configured - file uploads will be stored locally only')
  }
}
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'energy-documents'

// Upload energy bill document
router.post('/document', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const userId = req.user.userId
    const file = req.file
    const pool = getPool()

    let azureBlobUrl = null
    
    // Upload to Azure Blob Storage if configured
    if (blobServiceClient) {
      try {
        const blobName = `${userId}/${Date.now()}-${file.originalname}`
        const blockBlobClient = blobServiceClient.getContainerClient(containerName).getBlockBlobClient(blobName)
        const fileBuffer = await fs.readFile(file.path)
        await blockBlobClient.upload(fileBuffer, fileBuffer.length)
        azureBlobUrl = blockBlobClient.url
        logger.info(`File uploaded to Azure Blob Storage: ${blobName}`)
      } catch (error) {
        logger.warn(`Azure upload failed, storing locally: ${error.message}`)
        azureBlobUrl = `local://uploads/${file.filename}`
      }
    } else {
      azureBlobUrl = `local://uploads/${file.filename}`
      logger.info('File stored locally (Azure Storage not configured)')
    }

    // Save file record to database
    const fileRecord = await pool.request()
      .input('userId', sql.Int, userId)
      .input('filename', sql.NVarChar, file.originalname)
      .input('fileType', sql.NVarChar, file.mimetype)
      .input('fileSize', sql.Int, file.size)
      .input('azureBlobUrl', sql.NVarChar, azureBlobUrl)
      .query(`
        INSERT INTO FileUploads (user_id, filename, file_type, file_size, azure_blob_url, processing_status)
        OUTPUT INSERTED.id
        VALUES (@userId, @filename, @fileType, @fileSize, @azureBlobUrl, 'pending')
      `)

    const fileId = fileRecord.recordset[0].id

    // Process the file in background (simulate with setTimeout)
    processFileAsync(fileId, file.path, file.mimetype)

    // Clean up local file
    await fs.unlink(file.path)

    logger.info(`File uploaded - User: ${userId}, File: ${file.originalname}, ID: ${fileId}`)

    res.json({
      success: true,
      fileId: fileId,
      filename: file.originalname,
      status: 'pending',
      message: 'File uploaded successfully and is being processed'
    })

  } catch (error) {
    logger.error('File upload error:', error)
    
    // Clean up local file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path)
      } catch (cleanupError) {
        logger.error('File cleanup error:', cleanupError)
      }
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get upload history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 20, offset = 0 } = req.query
    const pool = getPool()

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          id,
          filename,
          file_type,
          file_size,
          processing_status,
          points_earned,
          created_at
        FROM FileUploads 
        WHERE user_id = @userId 
        ORDER BY created_at DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `)

    res.json({
      files: result.recordset,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    })

  } catch (error) {
    logger.error('Upload history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get file processing status
router.get('/status/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params
    const userId = req.user.userId
    const pool = getPool()

    const result = await pool.request()
      .input('fileId', sql.Int, fileId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          id,
          filename,
          processing_status,
          extracted_data,
          points_earned,
          created_at
        FROM FileUploads 
        WHERE id = @fileId AND user_id = @userId
      `)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    const file = result.recordset[0]
    
    res.json({
      fileId: file.id,
      filename: file.filename,
      status: file.processing_status,
      extractedData: file.extracted_data ? JSON.parse(file.extracted_data) : null,
      pointsEarned: file.points_earned,
      processedAt: file.created_at
    })

  } catch (error) {
    logger.error('File status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Background file processing function
async function processFileAsync(fileId, filePath, mimeType) {
  const pool = getPool()
  
  try {
    // Update status to processing
    await pool.request()
      .input('fileId', sql.Int, fileId)
      .query("UPDATE FileUploads SET processing_status = 'processing' WHERE id = @fileId")

    let extractedData = {}
    let pointsEarned = 0

    if (mimeType === 'application/pdf') {
      // Process PDF
      const fileBuffer = await fs.readFile(filePath)
      const pdfData = await pdf(fileBuffer)
      
      // Simple text extraction (in real implementation, use more sophisticated OCR/parsing)
      const text = pdfData.text
      extractedData = {
        textContent: text.substring(0, 1000), // First 1000 chars
        pageCount: pdfData.numpages,
        // Add more sophisticated extraction logic here
        extractedValues: extractNumbersFromText(text)
      }
      pointsEarned = 25
      
    } else if (mimeType.startsWith('image/')) {
      // Process image
      const imageBuffer = await fs.readFile(filePath)
      const metadata = await sharp(imageBuffer).metadata()
      
      extractedData = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        // In real implementation, use OCR service like Azure Computer Vision
        message: 'Image processed successfully. OCR feature coming soon.'
      }
      pointsEarned = 20
    }

    // Update database with results
    await pool.request()
      .input('fileId', sql.Int, fileId)
      .input('extractedData', sql.NVarChar, JSON.stringify(extractedData))
      .input('pointsEarned', sql.Int, pointsEarned)
      .query(`
        UPDATE FileUploads 
        SET processing_status = 'completed', 
            extracted_data = @extractedData,
            points_earned = @pointsEarned
        WHERE id = @fileId
      `)

    // Award points to user
    if (pointsEarned > 0) {
      await pool.request()
        .input('fileId', sql.Int, fileId)
        .input('pointsEarned', sql.Int, pointsEarned)
        .query(`
          UPDATE Users 
          SET points = points + @pointsEarned 
          WHERE id = (SELECT user_id FROM FileUploads WHERE id = @fileId);
          
          INSERT INTO PointHistory (user_id, points, type, description)
          SELECT user_id, @pointsEarned, 'earn', CONCAT('ファイルアップロード: ', filename)
          FROM FileUploads WHERE id = @fileId;
        `)
    }

    logger.info(`File processing completed - FileID: ${fileId}, Points: ${pointsEarned}`)

  } catch (error) {
    logger.error(`File processing failed - FileID: ${fileId}`, error)
    
    // Update status to failed
    try {
      await pool.request()
        .input('fileId', sql.Int, fileId)
        .query("UPDATE FileUploads SET processing_status = 'failed' WHERE id = @fileId")
    } catch (updateError) {
      logger.error('Failed to update file status to failed:', updateError)
    }
  }
}

// Helper function to extract numbers from text (basic implementation)
function extractNumbersFromText(text) {
  const numbers = text.match(/\d+(?:[.,]\d+)?/g) || []
  return {
    allNumbers: numbers.slice(0, 10), // First 10 numbers found
    potentialCosts: numbers.filter(n => parseFloat(n.replace(',', '')) > 100),
    potentialUsage: numbers.filter(n => parseFloat(n.replace(',', '')) < 1000)
  }
}

module.exports = router