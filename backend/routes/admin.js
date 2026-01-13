const express = require('express');
const pool = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const [users, institutions, certificates, verifications, alerts] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM institutions'),
      pool.query('SELECT COUNT(*) FROM certificates'),
      pool.query('SELECT COUNT(*) FROM verifications'),
      pool.query("SELECT COUNT(*) FROM alerts WHERE status = 'open'")
    ]);

    // Get verification statistics
    const verificationStats = await pool.query(`
      SELECT 
        verification_status,
        COUNT(*) as count
      FROM verifications
      GROUP BY verification_status
    `);

    // Get recent verifications
    const recentVerifications = await pool.query(`
      SELECT v.*, c.certificate_number, c.student_name, u.name as verifier_name
      FROM verifications v
      LEFT JOIN certificates c ON v.certificate_id = c.id
      LEFT JOIN users u ON v.verifier_id = u.id
      ORDER BY v.created_at DESC
      LIMIT 10
    `);

    // Get recent alerts
    const recentAlerts = await pool.query(`
      SELECT a.*, v.certificate_id, c.certificate_number
      FROM alerts a
      LEFT JOIN verifications v ON a.verification_id = v.id
      LEFT JOIN certificates c ON v.certificate_id = c.id
      WHERE a.status = 'open'
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    // Get institution-wise certificate counts
    const institutionStats = await pool.query(`
      SELECT i.name, i.code, COUNT(c.id) as certificate_count
      FROM institutions i
      LEFT JOIN certificates c ON i.id = c.institution_id
      GROUP BY i.id, i.name, i.code
      ORDER BY certificate_count DESC
      LIMIT 10
    `);

    res.json({
      statistics: {
        totalUsers: parseInt(users.rows[0].count),
        totalInstitutions: parseInt(institutions.rows[0].count),
        totalCertificates: parseInt(certificates.rows[0].count),
        totalVerifications: parseInt(verifications.rows[0].count),
        openAlerts: parseInt(alerts.rows[0].count)
      },
      verificationStats: verificationStats.rows,
      recentVerifications: recentVerifications.rows,
      recentAlerts: recentAlerts.rows,
      institutionStats: institutionStats.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/alerts
// @desc    Get all alerts
// @access  Private (Admin only)
router.get('/alerts', async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, v.certificate_id, c.certificate_number, c.student_name,
             u.name as resolved_by_name
      FROM alerts a
      LEFT JOIN verifications v ON a.verification_id = v.id
      LEFT JOIN certificates c ON v.certificate_id = c.id
      LEFT JOIN users u ON a.resolved_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (severity) {
      paramCount++;
      query += ` AND a.severity = $${paramCount}`;
      params.push(severity);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      alerts: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Private (Admin only)
router.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE alerts 
       SET status = 'resolved', resolved_by = $1, resolved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ alert: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.email, u.name, u.role, u.institution_id, u.created_at,
             i.name as institution_name
      FROM users u
      LEFT JOIN institutions i ON u.institution_id = i.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      users: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

