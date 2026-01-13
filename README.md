# Authenticity Validator for Academia

A comprehensive digital platform for authenticating and detecting fake degrees/certificates issued by higher education institutions. This system enables seamless certificate verification using OCR, database matching, and AI-powered anomaly detection.

## Features

- **Certificate Verification**: Upload certificates (PDF, images) or enter details manually for verification
- **OCR Integration**: Automatic text extraction from certificate images/PDFs using Tesseract.js
- **Database Matching**: Cross-verify certificates against institutional databases
- **Anomaly Detection**: Identifies tampered grades, forged signatures, invalid certificate numbers, and more
- **Role-Based Access**: Three user roles - Admin, Institution, and Verifier
- **Admin Dashboard**: Comprehensive analytics, monitoring, and alert system
- **Institution Management**: Institutions can bulk upload certificates
- **Verification History**: Track all verification attempts with detailed results
- **Responsive UI**: Modern, mobile-friendly interface built with React

## Tech Stack

### Frontend
- React 18
- React Router
- Axios
- React Toastify
- Recharts (for analytics)

### Backend
- Node.js
- Express.js
- PostgreSQL
- Tesseract.js (OCR)
- PDF-Parse
- JWT Authentication
- Bcrypt (password hashing)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   cd "Authenticity Validator for Academia"
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Setup PostgreSQL Database**
   - Create a new PostgreSQL database named `authenticity_validator`
   - Update database credentials in `backend/.env` (create from `.env.example`)

4. **Configure Environment Variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `backend/.env` with your database credentials:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=authenticity_validator
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. **Start the application**
   ```bash
   # From root directory
   npm run dev
   ```
   This will start both backend (port 5000) and frontend (port 3000) concurrently.

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Credentials

- **Admin Account:**
  - Email: `admin@system.com`
  - Password: `admin123`

## Project Structure

```
Authenticity Validator for Academia/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── certificates.js    # Certificate management
│   │   ├── verifications.js   # Verification endpoints
│   │   ├── institutions.js   # Institution management
│   │   ├── admin.js           # Admin routes
│   │   └── upload.js           # File upload handling
│   ├── services/
│   │   ├── ocrService.js      # OCR text extraction
│   │   └── verificationService.js  # Verification logic
│   ├── uploads/               # Uploaded certificate files
│   ├── server.js              # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   └── App.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Certificates
- `GET /api/certificates` - Get all certificates (with filters)
- `GET /api/certificates/:id` - Get certificate by ID
- `POST /api/certificates` - Create certificate (Institution/Admin)
- `PUT /api/certificates/:id` - Update certificate
- `DELETE /api/certificates/:id` - Delete certificate (Admin)

### Verifications
- `POST /api/verifications` - Verify a certificate
- `GET /api/verifications` - Get verification history
- `GET /api/verifications/:id` - Get verification details

### Institutions
- `GET /api/institutions` - Get all institutions
- `POST /api/institutions` - Create institution (Admin)
- `POST /api/institutions/bulk-upload` - Bulk upload certificates

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/alerts` - Get all alerts
- `PUT /api/admin/alerts/:id/resolve` - Resolve alert
- `GET /api/admin/users` - Get all users

## Usage Guide

### For Verifiers
1. Login/Register as a Verifier
2. Go to "Verify Certificate"
3. Upload a certificate file or enter details manually
4. View verification results with match score and anomalies

### For Institutions
1. Register with an institution account
2. Add certificates manually or use bulk upload
3. Manage your institution's certificates
4. View verification history for your certificates

### For Admins
1. Login with admin credentials
2. Access admin dashboard for system overview
3. Manage institutions and users
4. Monitor alerts and verification trends
5. Resolve security alerts

## Features in Detail

### OCR Processing
- Extracts text from PDF and image files
- Parses certificate details (name, roll number, marks, etc.)
- Handles various certificate formats

### Verification Algorithm
- Matches extracted data against database records
- Calculates match score based on multiple criteria
- Flags anomalies (name mismatch, marks discrepancy, etc.)
- Classifies results as: Verified, Suspicious, or Rejected

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Secure file uploads

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## Database Schema

The system automatically creates the following tables:
- `users` - User accounts with roles
- `institutions` - Educational institutions
- `certificates` - Certificate records
- `verifications` - Verification history
- `alerts` - Security alerts

## Contributing

This is a BTech final year project. For improvements or bug fixes, please create an issue or submit a pull request.

## License

MIT License

## Support

For issues or questions, please refer to the project documentation or contact the development team.

