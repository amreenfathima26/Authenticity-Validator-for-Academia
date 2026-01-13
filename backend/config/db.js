const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const { Pool } = require('pg');

let dbInstance = null;
let pgPool = null;
const isProduction = !!process.env.DATABASE_URL;

const dbPath = path.join(__dirname, '..', 'authenticity_validator.sqlite');

const connectDB = async () => {
  if (isProduction) {
    if (pgPool) return pgPool;
    try {
      let connStr = process.env.DATABASE_URL;

      // AUTO-FIX: Clean the connection string if the user pasted the full 'psql' command
      if (connStr.startsWith('psql ')) {
        console.log('Detected "psql" command format. Cleaning the connection string...');
        connStr = connStr.replace(/^psql\s+['"]?/, '').replace(/['"]?$/, '');
      }

      // Mask sensitive info for logging
      try {
        const masked = connStr.replace(/(:\/\/)(.*)(:)(.*)(@)/, '$1***:***@');
        console.log(`Attempting to connect to PostgreSQL at: ${masked}`);

        if (process.env.PGHOST) {
          console.log(`Note: PGHOST environment variable is also set to: ${process.env.PGHOST}`);
        }

        // Specific check for the common "ENOTFOUND base" error
        if (connStr.includes('@base') || connStr.includes('//base')) {
          console.error('CRITICAL: Your DATABASE_URL contains "base" as a hostname. This is likely a placeholder. Please check your Render Environment Variables!');
        }
      } catch (e) {
        console.log('Attempting to connect to PostgreSQL (URL masking failed)');
      }

      pgPool = new Pool({
        connectionString: connStr,
        ssl: {
          rejectUnauthorized: false
        }
      });

      // Test the connection immediately
      await pgPool.query('SELECT NOW()');
      console.log('Successfully connected to PostgreSQL database');

      await initializeDB();
      return pgPool;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error.message);
      // Don't exit process here so server can still respond with health checks/errors
      return null;
    }
  } else {
    // SQLite Fallback
    if (dbInstance) return dbInstance;
    try {
      dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      await dbInstance.run('PRAGMA foreign_keys = ON');
      console.log('Connected to SQLite database at', dbPath);
      await initializeDB();
      return dbInstance;
    } catch (error) {
      console.error('Failed to connect to SQLite:', error);
      process.exit(1);
    }
  }
};

const initializeDB = async () => {
  const isPg = isProduction;
  const serialType = isPg ? 'SERIAL' : 'INTEGER';
  const autoIncrement = isPg ? '' : 'AUTOINCREMENT';

  try {
    const db = isPg ? pgPool : dbInstance;
    const run = async (sql, params = []) => {
      if (isPg) return db.query(sql, params);
      return db.run(sql, params);
    };

    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id ${serialType} PRIMARY KEY ${autoIncrement},
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'institution', 'verifier')),
        institution_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Institutions table
    await run(`
      CREATE TABLE IF NOT EXISTS institutions (
        id ${serialType} PRIMARY KEY ${autoIncrement},
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        address TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Certificates table
    await run(`
      CREATE TABLE IF NOT EXISTS certificates (
        id ${serialType} PRIMARY KEY ${autoIncrement},
        institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
        certificate_number TEXT UNIQUE NOT NULL,
        student_name TEXT NOT NULL,
        roll_number TEXT,
        course_name TEXT NOT NULL,
        degree_type TEXT,
        year_of_passing INTEGER,
        marks_obtained DECIMAL(10,2),
        total_marks DECIMAL(10,2),
        percentage DECIMAL(5,2),
        photo_url TEXT,
        certificate_hash TEXT,
        qr_code_data TEXT,
        status TEXT DEFAULT 'active',
        issued_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verifications table
    await run(`
      CREATE TABLE IF NOT EXISTS verifications (
        id ${serialType} PRIMARY KEY ${autoIncrement},
        certificate_id INTEGER REFERENCES certificates(id) ON DELETE CASCADE,
        verifier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        verification_type TEXT NOT NULL,
        uploaded_document_url TEXT,
        extracted_data TEXT,
        verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspicious')),
        match_score DECIMAL(5,2),
        anomalies TEXT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Alerts table
    await run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id ${serialType} PRIMARY KEY ${autoIncrement},
        verification_id INTEGER REFERENCES verifications(id) ON DELETE CASCADE,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        description TEXT,
        status TEXT DEFAULT 'open',
        resolved_by INTEGER REFERENCES users(id),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    if (isPg) {
      await run(`CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_certificates_institution ON certificates(institution_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_verifications_certificate ON verifications(certificate_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(verification_status)`);
    } else {
      await run(`CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_certificates_institution ON certificates(institution_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_verifications_certificate ON verifications(certificate_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(verification_status)`);
    }

    // Default Admin
    const bcrypt = require('bcryptjs');
    const adminPassword = bcrypt.hashSync('admin123', 10);

    // Check if admin exists
    const checkAdmin = isPg
      ? await run('SELECT id FROM users WHERE email = $1', ['admin@system.com'])
      : await db.get('SELECT id FROM users WHERE email = ?', ['admin@system.com']);

    const hasAdmin = isPg ? (checkAdmin.rowCount > 0) : !!checkAdmin;

    if (!hasAdmin) {
      await run(
        `INSERT INTO users (email, password, name, role) VALUES ($1, $2, 'System Admin', 'admin')`
          .replace(/\$1/g, isPg ? '$1' : '?')
          .replace(/\$2/g, isPg ? '$2' : '?'),
        ['admin@system.com', adminPassword]
      );
    }

    console.log('Database initialized successfully (' + (isPg ? 'PostgreSQL' : 'SQLite') + ')');
  } catch (error) {
    console.error('Error during database initialization:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('TIP: This usually means the hostname in your DATABASE_URL is wrong.');
    }
  }
};

const query = async (text, params = []) => {
  if (isProduction) {
    if (!pgPool) await connectDB();
    try {
      // Postgres natively supports $1, $2... so we pass 'text' directly
      const result = await pgPool.query(text, params);
      return result; // pg returns { rows: [], rowCount: ... }
    } catch (err) {
      console.error('Query error (PG):', err.message);
      throw err;
    }
  } else {
    // SQLite Fallback
    if (!dbInstance) await connectDB();
    // Convert pg params ($1...) to sqlite params (?, ?...)
    const sql = text.replace(/\$\d+/g, '?');

    try {
      const rows = await dbInstance.all(sql, params);

      // Emulate PG result structure
      // Also need to parse JSON fields if SQLite stored them as text
      const jsonFields = ['extracted_data', 'anomalies'];
      const processedRows = rows.map(row => {
        const newRow = { ...row };
        jsonFields.forEach(field => {
          if (newRow[field] && typeof newRow[field] === 'string') {
            try { newRow[field] = JSON.parse(newRow[field]); } catch (e) { }
          }
        });
        return newRow;
      });

      return { rows: processedRows, rowCount: processedRows.length };
    } catch (err) {
      console.error('Query error (SQLite):', err.message);
      throw err;
    }
  }
};

// Initialize immediately
connectDB();

module.exports = {
  query,
  connectDB
};
