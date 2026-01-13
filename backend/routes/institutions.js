const express = require('express');
const pool = require('../config/db');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/institutions
// @desc    Get all institutions
// @access  Public (for registration) / Private (for authenticated users)
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM institutions WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR code ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json({ institutions: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/institutions/:id
// @desc    Get institution by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM institutions WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({ institution: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/institutions
// @desc    Create a new institution
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('name').notEmpty(),
  body('code').notEmpty(),
  body('type').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, type, address, contact_email, contact_phone } = req.body;

    // Check if code already exists
    const existingInst = await pool.query('SELECT id FROM institutions WHERE code = $1', [code]);
    if (existingInst.rows.length > 0) {
      return res.status(400).json({ message: 'Institution code already exists' });
    }

    const result = await pool.query(
      `INSERT INTO institutions (name, code, type, address, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, code, type, address, contact_email, contact_phone]
    );

    res.status(201).json({ institution: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/institutions/bulk-upload-institutions
// @desc    Bulk upload institutions (Admin only)
// @access  Private (Admin only)
router.post('/bulk-upload-institutions', protect, authorize('admin'), async (req, res) => {
  try {
    const { institutions } = req.body;

    console.log('Received bulk upload request:', { 
      hasInstitutions: !!institutions, 
      isArray: Array.isArray(institutions),
      length: institutions?.length 
    });

    if (!institutions) {
      return res.status(400).json({ message: 'Institutions array is required in request body' });
    }

    if (!Array.isArray(institutions)) {
      return res.status(400).json({ message: 'Institutions must be an array' });
    }

    if (institutions.length === 0) {
      return res.status(400).json({ message: 'Institutions array cannot be empty' });
    }

    const inserted = [];
    const errors = [];

    for (const inst of institutions) {
      try {
        // Check if code already exists
        const existingInst = await pool.query('SELECT id FROM institutions WHERE code = $1', [inst.code]);
        if (existingInst.rows.length > 0) {
          errors.push({ code: inst.code, error: 'Institution code already exists' });
          continue;
        }

        const result = await pool.query(
          `INSERT INTO institutions (name, code, type, address, contact_email, contact_phone)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            inst.name,
            inst.code,
            inst.type,
            inst.address || null,
            inst.contact_email || null,
            inst.contact_phone || null
          ]
        );

        inserted.push(result.rows[0]);
      } catch (error) {
        errors.push({ code: inst.code || 'unknown', error: error.message });
      }
    }

    res.json({
      message: `Bulk upload completed: ${inserted.length} institutions inserted`,
      inserted: inserted.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/institutions/bulk-upload
// @desc    Bulk upload certificates for an institution
// @access  Private (Institution/Admin)
router.post('/bulk-upload', protect, authorize('institution', 'admin'), async (req, res) => {
  try {
    const { institution_id, certificates } = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({ message: 'Certificates array is required' });
    }

    // Verify institution access
    if (req.user.role === 'institution' && req.user.institution_id !== parseInt(institution_id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const inserted = [];
    const errors = [];

    for (const cert of certificates) {
      try {
        const result = await pool.query(
          `INSERT INTO certificates (
            institution_id, certificate_number, student_name, roll_number, course_name,
            degree_type, year_of_passing, marks_obtained, total_marks, percentage, issued_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (certificate_number) DO NOTHING
          RETURNING *`,
          [
            institution_id,
            cert.certificate_number,
            cert.student_name,
            cert.roll_number,
            cert.course_name,
            cert.degree_type,
            cert.year_of_passing,
            cert.marks_obtained,
            cert.total_marks,
            cert.percentage,
            cert.issued_date
          ]
        );

        if (result.rows.length > 0) {
          inserted.push(result.rows[0]);
        }
      } catch (error) {
        errors.push({ certificate_number: cert.certificate_number, error: error.message });
      }
    }

    res.json({
      message: `Bulk upload completed: ${inserted.length} certificates inserted`,
      inserted: inserted.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/institutions/:id
// @desc    Update institution
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, type, address, contact_email, contact_phone, status } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (name) { updateFields.push(`name = $${++paramCount}`); values.push(name); }
    if (code) { updateFields.push(`code = $${++paramCount}`); values.push(code); }
    if (type) { updateFields.push(`type = $${++paramCount}`); values.push(type); }
    if (address !== undefined) { updateFields.push(`address = $${++paramCount}`); values.push(address); }
    if (contact_email) { updateFields.push(`contact_email = $${++paramCount}`); values.push(contact_email); }
    if (contact_phone) { updateFields.push(`contact_phone = $${++paramCount}`); values.push(contact_phone); }
    if (status) { updateFields.push(`status = $${++paramCount}`); values.push(status); }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE institutions SET ${updateFields.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({ institution: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

