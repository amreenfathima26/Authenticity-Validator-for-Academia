const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const ocrService = require('../services/ocrService');
const verificationService = require('../services/verificationService');
const path = require('path');

const router = express.Router();

// @route   POST /api/verifications
// @desc    Verify a certificate
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { uploaded_file_url, certificate_number, manual_data } = req.body;

    let extractedData = null;
    let verificationResult = null;

    // If file is uploaded, extract data using OCR
    if (uploaded_file_url) {
      const filePath = path.join(__dirname, '..', uploaded_file_url.replace('/uploads/', 'uploads/'));
      try {
        extractedData = await ocrService.extractCertificateData(filePath);
      } catch (error) {
        console.error('OCR extraction failed:', error);
        return res.status(400).json({ 
          message: 'Failed to extract data from certificate', 
          error: error.message 
        });
      }
    } else if (manual_data) {
      // Convert snake_case to camelCase for verification service
      extractedData = {
        certificateNumber: manual_data.certificate_number || certificate_number || manual_data.certificateNumber,
        studentName: manual_data.student_name || manual_data.studentName,
        rollNumber: manual_data.roll_number || manual_data.rollNumber,
        courseName: manual_data.course_name || manual_data.courseName,
        year: manual_data.year || manual_data.year_of_passing,
        marks: manual_data.marks || (manual_data.marks_obtained ? {
          obtained: parseFloat(manual_data.marks_obtained),
          total: parseFloat(manual_data.total_marks || 100)
        } : null),
        percentage: manual_data.percentage
      };
    } else {
      return res.status(400).json({ message: 'Either file URL or manual data is required' });
    }

    // If certificate number is provided directly, use it (override)
    if (certificate_number) {
      extractedData.certificateNumber = certificate_number;
    }

    // Verify certificate
    verificationResult = await verificationService.verifyCertificate(extractedData, uploaded_file_url);

    // Save verification record
    const verificationRecord = await pool.query(
      `INSERT INTO verifications (
        certificate_id, verifier_id, verification_type, uploaded_document_url,
        extracted_data, verification_status, match_score, anomalies
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        verificationResult.certificateId || null,
        req.user.id,
        uploaded_file_url ? 'ocr' : 'manual',
        uploaded_file_url,
        JSON.stringify(extractedData),
        verificationResult.status,
        verificationResult.matchScore,
        JSON.stringify(verificationResult.anomalies)
      ]
    );

    // Create alert if verification failed or is suspicious
    if (verificationResult.status === 'rejected' || verificationResult.status === 'suspicious') {
      const severity = verificationResult.status === 'rejected' ? 'high' : 'medium';
      await pool.query(
        `INSERT INTO alerts (verification_id, alert_type, severity, description)
         VALUES ($1, $2, $3, $4)`,
        [
          verificationRecord.rows[0].id,
          'verification_failed',
          severity,
          `Certificate verification ${verificationResult.status}: ${verificationResult.anomalies.join(', ')}`
        ]
      );
    }

    res.json({
      verification: verificationRecord.rows[0],
      result: verificationResult,
      extractedData: extractedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/verifications
// @desc    Get all verifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT v.*, c.certificate_number, c.student_name, c.course_name,
             u.name as verifier_name, i.name as institution_name
      FROM verifications v
      LEFT JOIN certificates c ON v.certificate_id = c.id
      LEFT JOIN users u ON v.verifier_id = u.id
      LEFT JOIN institutions i ON c.institution_id = i.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND v.verification_status = $${paramCount}`;
      params.push(status);
    }

    // Role-based filtering
    if (req.user.role === 'institution' && req.user.institution_id) {
      paramCount++;
      query += ` AND c.institution_id = $${paramCount}`;
      params.push(req.user.institution_id);
    } else if (req.user.role === 'verifier') {
      paramCount++;
      query += ` AND v.verifier_id = $${paramCount}`;
      params.push(req.user.id);
    }

    query += ` ORDER BY v.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      verifications: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/verifications/:id
// @desc    Get verification by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, c.*, u.name as verifier_name, i.name as institution_name
       FROM verifications v
       LEFT JOIN certificates c ON v.certificate_id = c.id
       LEFT JOIN users u ON v.verifier_id = u.id
       LEFT JOIN institutions i ON c.institution_id = i.id
       WHERE v.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    res.json({ verification: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

