const express = require('express');
const pool = require('../config/db');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/batch/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'batch-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// @route   GET /api/certificates
// @desc    Get all certificates (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { institution_id, certificate_number, student_name, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, i.name as institution_name, i.code as institution_code
      FROM certificates c
      LEFT JOIN institutions i ON c.institution_id = i.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (institution_id) {
      paramCount++;
      query += ` AND c.institution_id = $${paramCount}`;
      params.push(institution_id);
    }

    if (certificate_number) {
      paramCount++;
      query += ` AND c.certificate_number ILIKE $${paramCount}`;
      params.push(`%${certificate_number}%`);
    }

    if (student_name) {
      paramCount++;
      query += ` AND c.student_name ILIKE $${paramCount}`;
      params.push(`%${student_name}%`);
    }

    // Role-based filtering
    if (req.user.role === 'institution' && req.user.institution_id) {
      paramCount++;
      query += ` AND c.institution_id = $${paramCount}`;
      params.push(req.user.institution_id);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM certificates c WHERE 1=1' +
      (institution_id ? ` AND c.institution_id = ${institution_id}` : '') +
      (req.user.role === 'institution' && req.user.institution_id ? ` AND c.institution_id = ${req.user.institution_id}` : ''));

    res.json({
      certificates: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/certificates/:id
// @desc    Get certificate by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // If ID is 'batch', this route might catch it if not careful. 
    // Express matches in order. 'batch' is not numeric, so if :id is not restricted, it might match.
    // However, I will put the POST /batch BEFORE the GET /:id just in case, or ensure route order.
    // Actually, 'batch' is a POST, this is a GET. so it won't conflict. 
    // But if I add GET /batch later, order matters.

    // Check if ID is numeric ID or special string (if needed)
    // UUID or Integer? The DB uses Serial/Integer.
    // 'batch' is a string so it would cause error if cast to integer inside the query if unchecked.
    if (isNaN(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const result = await pool.query(
      `SELECT c.*, i.name as institution_name, i.code as institution_code
       FROM certificates c
       LEFT JOIN institutions i ON c.institution_id = i.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({ certificate: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/certificates/batch
// @desc    Batch upload certificates via CSV
// @access  Private (Institution/Admin)
router.post('/batch', protect, authorize('institution', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    let successCount = 0;
    let failCount = 0;
    const results = [];

    let institutionId = req.body.institution_id;
    if (req.user.role === 'institution') {
      institutionId = req.user.institution_id;
    }

    for (const line of lines) {
      // Skip header
      const lineLower = line.toLowerCase();
      if (lineLower.includes('certificate number') && lineLower.includes('student name')) continue;

      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 5) continue;

      // CSV: Certificate Number, Student Name, Roll Number, Course Name, Year, Marks, Total, Percentage
      const [certNum, name, roll, course, year, marks, total, pct] = parts;

      try {
        // If admin, they might need to ensure institution_id
        if (!institutionId && req.user.role === 'admin') {
          throw new Error('Institution ID required for admin upload');
        }

        // SQLite INSERT OR IGNORE / ON CONFLICT logic via JS catch
        // Using standard INSERT. The unique constraint will throw error if exists.
        const result = await pool.query(
          `INSERT INTO certificates (
              institution_id, certificate_number, student_name, roll_number, course_name,
              year_of_passing, marks_obtained, total_marks, percentage, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
            RETURNING id, certificate_number`,
          [
            institutionId, certNum, name, roll, course,
            parseInt(year) || 0, parseFloat(marks) || 0, parseFloat(total) || 100, parseFloat(pct) || 0
          ]
        );

        if (result && result.rows && result.rows.length > 0) {
          successCount++;
          results.push({ certificate: certNum, status: 'success' });
        }
      } catch (err) {
        failCount++;
        results.push({ certificate: certNum, status: 'failed', error: err.message });
      }
    }

    // Cleanup
    try { fs.unlinkSync(filePath); } catch (e) { }

    res.json({
      message: 'Batch processing complete',
      summary: { total: lines.length, success: successCount, failed: failCount },
      details: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/certificates
// @desc    Create a new certificate
// @access  Private (Institution/Admin)
router.post('/', protect, authorize('institution', 'admin'), [
  body('certificate_number').notEmpty(),
  body('student_name').notEmpty(),
  body('course_name').notEmpty(),
  body('institution_id').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      institution_id,
      certificate_number,
      student_name,
      roll_number,
      course_name,
      degree_type,
      year_of_passing,
      marks_obtained,
      total_marks,
      percentage,
      photo_url,
      issued_date
    } = req.body;

    // Check if certificate number already exists
    const existingCert = await pool.query(
      'SELECT id FROM certificates WHERE certificate_number = $1',
      [certificate_number]
    );

    if (existingCert.rows.length > 0) {
      return res.status(400).json({ message: 'Certificate number already exists' });
    }

    // Verify institution access
    if (req.user.role === 'institution' && req.user.institution_id !== parseInt(institution_id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO certificates (
        institution_id, certificate_number, student_name, roll_number, course_name,
        degree_type, year_of_passing, marks_obtained, total_marks, percentage,
        photo_url, issued_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        institution_id, certificate_number, student_name, roll_number, course_name,
        degree_type, year_of_passing, marks_obtained, total_marks, percentage,
        photo_url, issued_date
      ]
    );

    res.status(201).json({ certificate: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/certificates/:id
// @desc    Update certificate
// @access  Private (Institution/Admin)
router.put('/:id', protect, authorize('institution', 'admin'), async (req, res) => {
  try {
    const certResult = await pool.query('SELECT * FROM certificates WHERE id = $1', [req.params.id]);

    if (certResult.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Verify institution access
    if (req.user.role === 'institution' && req.user.institution_id !== certResult.rows[0].institution_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      student_name, roll_number, course_name, degree_type, year_of_passing,
      marks_obtained, total_marks, percentage, photo_url, issued_date, status
    } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (student_name) { updateFields.push(`student_name = $${++paramCount}`); values.push(student_name); }
    if (roll_number !== undefined) { updateFields.push(`roll_number = $${++paramCount}`); values.push(roll_number); }
    if (course_name) { updateFields.push(`course_name = $${++paramCount}`); values.push(course_name); }
    if (degree_type) { updateFields.push(`degree_type = $${++paramCount}`); values.push(degree_type); }
    if (year_of_passing) { updateFields.push(`year_of_passing = $${++paramCount}`); values.push(year_of_passing); }
    if (marks_obtained !== undefined) { updateFields.push(`marks_obtained = $${++paramCount}`); values.push(marks_obtained); }
    if (total_marks !== undefined) { updateFields.push(`total_marks = $${++paramCount}`); values.push(total_marks); }
    if (percentage !== undefined) { updateFields.push(`percentage = $${++paramCount}`); values.push(percentage); }
    if (photo_url) { updateFields.push(`photo_url = $${++paramCount}`); values.push(photo_url); }
    if (issued_date) { updateFields.push(`issued_date = $${++paramCount}`); values.push(issued_date); }
    if (status) { updateFields.push(`status = $${++paramCount}`); values.push(status); }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE certificates SET ${updateFields.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      values
    );

    res.json({ certificate: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete certificate
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM certificates WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
