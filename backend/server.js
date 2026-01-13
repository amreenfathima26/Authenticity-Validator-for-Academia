const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST before requiring db
dotenv.config();

const pool = require('./config/db');

const app = express();

// Database connection is automatically established when db.js is loaded

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/verifications', require('./routes/verifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

