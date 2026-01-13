const fs = require('fs');
const path = require('path');
const { query } = require('./config/db');

// Map of Institution Code to Institution ID (populated during execution)
const institutionMap = new Map();

const seedData = async () => {
    console.log('Starting seed process...');

    // 1. Seed Institutions
    // We check for sample, real, and bulk institution files
    const institutionFiles = ['sample_institutions.csv', 'real_institutions.csv', 'bulk_institutions.csv'];

    for (const file of institutionFiles) {
        const institutionsFile = path.join(__dirname, '..', file);
        if (fs.existsSync(institutionsFile)) {
            console.log(`Reading institutions from ${file}`);
            const content = fs.readFileSync(institutionsFile, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                const parts = line.split(',').map(s => s.trim());
                if (parts.length < 2) continue;

                // Flexible parsing: Name, Code, Type, City, State, Email, Phone
                const [name, code, type, city, state, email, phone] = parts;

                if (!code) continue;

                try {
                    // Check if exists
                    const existingRes = await query('SELECT id FROM institutions WHERE code = $1', [code]);

                    let institutionId;

                    if (existingRes.rows.length > 0) {
                        institutionId = existingRes.rows[0].id;
                        // console.log(`Institution ${code} already exists.`);
                    } else {
                        // Use RETURNING id to get the inserted ID in a cross-compatible way (works in PG and modern SQLite)
                        const insertRes = await query(
                            `INSERT INTO institutions (name, code, type, address, contact_email, contact_phone) 
                             VALUES ($1, $2, $3, $4, $5, $6)
                             RETURNING id`,
                            [name, code, type || 'University', `${city || ''}, ${state || ''}`, email || '', phone || '']
                        );
                        // If result has rows, use the first row's id. 
                        // Note: validation of insert success relies on rows being present.
                        if (insertRes.rows && insertRes.rows.length > 0) {
                            institutionId = insertRes.rows[0].id;
                            console.log(`Inserted Institution: ${name}`);
                        }
                    }
                    if (institutionId) {
                        institutionMap.set(code, institutionId);
                    }
                } catch (err) {
                    console.error(`Error inserting institution ${code}:`, err.message);
                }
            }
        } else {
            console.log(`${file} not found!`);
        }
    }

    // 2. Seed Certificates
    // We will look for csv files starting with sample_certificates_ OR real_certificates.csv
    const parentDir = path.join(__dirname, '..');
    const allFiles = fs.readdirSync(parentDir);
    const certificateFiles = allFiles.filter(f =>
        (f.startsWith('sample_certificates_') || f === 'real_certificates.csv') && f.endsWith('.csv')
    );

    for (const file of certificateFiles) {
        console.log(`\nProcessing certificates from ${file}...`);
        const content = fs.readFileSync(path.join(parentDir, file), 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
            const parts = line.split(',').map(s => s.trim());
            if (parts.length < 5) continue; // Basic check

            const [certNum, name, roll, course, year, marks, total, pct] = parts;
            let institutionId;

            // 1. Try checking filename for code (legacy)
            const match = file.match(/sample_certificates_(.+)\.csv/i);
            if (match) {
                const fileCode = match[1].toUpperCase();
                institutionId = institutionMap.get(fileCode);
            } else {
                // 2. Try matching Prefix (real_certificates.csv)
                // Iterate map keys to find matching prefix logic
                for (const [code, id] of institutionMap.entries()) {
                    if (certNum && certNum.toUpperCase().startsWith(code.toUpperCase())) {
                        institutionId = id;
                        break;
                    }
                }
            }

            if (!institutionId) {
                // console.warn(`Skipping ${certNum} in ${file}: No matching institution found.`);
                continue;
            }

            try {
                // Ensure unique certificate number insert
                // Postgres requires ON CONFLICT(column) to trigger, which is correct
                await query(
                    `INSERT INTO certificates (
                        institution_id, certificate_number, student_name, roll_number, 
                        course_name, year_of_passing, marks_obtained, total_marks, percentage,
                        status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active') 
                    ON CONFLICT(certificate_number) DO NOTHING`,
                    [institutionId, certNum, name, roll, course, parseInt(year) || 0, parseFloat(marks) || 0, parseFloat(total) || 100, parseFloat(pct) || 0]
                );
            } catch (err) {
                console.error(`Failed to insert certificate ${certNum}:`, err.message);
            }
        }
        console.log(`Finished processing ${file}`);
    }

    console.log('\nSeeding Complete!');
};

seedData().catch(console.error);
