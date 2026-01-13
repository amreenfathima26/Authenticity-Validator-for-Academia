# Testing Guide

## Test Scenarios

### 1. User Registration & Login

**Test Admin Login:**
- Email: `admin@system.com`
- Password: `admin123`
- Expected: Successful login, redirect to dashboard

**Test User Registration:**
1. Click "Register here" on login page
2. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Role: Verifier
   - Password: test123
3. Expected: Account created, auto-login, redirect to dashboard

### 2. Institution Management (Admin Only)

**Create Institution:**
1. Login as admin
2. Navigate to "Institutions"
3. Click "+ Add Institution"
4. Fill in:
   - Name: Test University
   - Code: TU001
   - Type: University
   - Address: Test Address
5. Expected: Institution created successfully

**Create Institution User:**
1. Register new user with role "Institution"
2. Select the institution you just created
3. Expected: User linked to institution

### 3. Certificate Management

**Add Certificate (Institution/Admin):**
1. Login as institution user or admin
2. Navigate to "Certificates"
3. Click "+ Add Certificate"
4. Fill in:
   - Certificate Number: CERT001
   - Student Name: John Doe
   - Roll Number: ROLL001
   - Course: B.Tech Computer Science
   - Year: 2023
   - Marks: 85/100
   - Percentage: 85
5. Expected: Certificate saved successfully

**Bulk Upload:**
1. Navigate to "Institutions" page
2. Click "Bulk Upload Certificates"
3. Enter CSV data:
   ```
   CERT002, Jane Smith, ROLL002, B.Tech, 2023, 90, 100, 90
   CERT003, Bob Johnson, ROLL003, M.Tech, 2022, 88, 100, 88
   ```
4. Expected: Certificates uploaded successfully

### 4. Certificate Verification

**Manual Verification:**
1. Navigate to "Verify Certificate"
2. Select "Manual Entry" mode
3. Enter:
   - Certificate Number: CERT001
   - Student Name: John Doe
   - Roll Number: ROLL001
   - Course: B.Tech Computer Science
   - Year: 2023
4. Click "Verify Certificate"
5. Expected: Verification result showing "VERIFIED" status

**File Upload Verification:**
1. Navigate to "Verify Certificate"
2. Select "Upload File" mode
3. Upload a certificate image (JPG/PNG) or PDF
4. Click "Verify Certificate"
5. Expected: OCR extracts data, verification result displayed

**Test Invalid Certificate:**
1. Enter certificate number that doesn't exist: CERT999
2. Expected: Status "REJECTED" with message "Certificate not found"

**Test Mismatched Data:**
1. Use valid certificate number but wrong student name
2. Expected: Status "SUSPICIOUS" or "REJECTED" with anomalies listed

### 5. Admin Dashboard

**View Statistics:**
1. Login as admin
2. Navigate to "Admin"
3. Expected: See dashboard with:
   - Total users, institutions, certificates, verifications
   - Verification status distribution chart
   - Top institutions chart
   - Recent verifications
   - Recent alerts

**Manage Alerts:**
1. Perform a verification that fails
2. Check admin dashboard for new alert
3. Click "Resolve" on alert
4. Expected: Alert status changes to "resolved"

### 6. Verification History

**View All Verifications:**
1. Navigate to "Verifications"
2. Expected: List of all verification attempts

**Filter Verifications:**
1. Click filter buttons (All, Verified, Rejected, Suspicious)
2. Expected: List filtered by status

### 7. Responsive Design Testing

**Mobile View:**
1. Open browser DevTools
2. Switch to mobile view (375px width)
3. Test navigation, forms, and tables
4. Expected: All elements responsive and usable

## Sample Test Data

### Institutions
```
Name: Jharkhand University
Code: JHU001
Type: University

Name: Ranchi College
Code: RC001
Type: College
```

### Certificates
```
Certificate Number: CERT001
Student: John Doe
Roll: ROLL001
Course: B.Tech Computer Science
Year: 2023
Marks: 85/100
Percentage: 85

Certificate Number: CERT002
Student: Jane Smith
Roll: ROLL002
Course: M.Tech Data Science
Year: 2022
Marks: 90/100
Percentage: 90
```

## Common Issues & Solutions

### Issue: Database connection error
**Solution:** Check PostgreSQL is running and credentials in `.env` are correct

### Issue: OCR not extracting text
**Solution:** 
- Ensure file is clear and readable
- Try different file formats
- Check file size (max 10MB)

### Issue: Verification always fails
**Solution:**
- Ensure certificate exists in database
- Check certificate number matches exactly
- Verify data format matches database records

### Issue: File upload fails
**Solution:**
- Check `backend/uploads/` directory exists
- Verify file size is under 10MB
- Ensure file is PDF, JPG, or PNG format

## Performance Testing

1. **Load Testing:**
   - Upload 100+ certificates via bulk upload
   - Verify system handles large datasets

2. **Concurrent Users:**
   - Test multiple users verifying certificates simultaneously
   - Expected: System handles concurrent requests

3. **File Size Limits:**
   - Test with files near 10MB limit
   - Expected: Proper error handling for oversized files

