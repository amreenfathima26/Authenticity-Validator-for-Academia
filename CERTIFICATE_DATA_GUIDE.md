# Certificate Data Guide - Institution Wise

## How to Use

1. **Login as Institution User** (after creating institution)
2. Go to **Institutions** page
3. Click **"📤 Bulk Upload Certificates"**
4. Copy the data from the file matching your institution code
5. Paste in the modal
6. Click **Upload**

---

## Institution Codes & Their Certificate Data Files

### 1. Jharkhand University (JHU001)
**File:** `sample_certificates_jhu001.csv`
- 10 certificates
- Mix of B.Tech, M.Tech, B.Sc, M.Sc, B.Com, B.A courses
- Years: 2022, 2023

### 2. Ranchi College (RC001)
**File:** `sample_certificates_rc001.csv`
- 10 certificates
- Mix of B.Sc, B.Com, B.A, B.Tech, M.Com courses
- Years: 2022, 2023

### 3. Dhanbad Institute of Technology (DIT001)
**File:** `sample_certificates_dit001.csv`
- 10 certificates
- Mostly Engineering courses (B.Tech, M.Tech)
- Years: 2022, 2023

### 4. Jamshedpur University (JU001)
**File:** `sample_certificates_ju001.csv`
- 10 certificates
- Mostly Post-graduate courses (M.Sc, M.A, M.Com, M.Tech)
- Years: 2022, 2023

### 5. Bokaro Engineering College (BEC001)
**File:** `sample_certificates_bec001.csv`
- 10 certificates
- All Engineering courses (B.Tech)
- Years: 2022, 2023

---

## Certificate Data Format

Each line represents one certificate:
```
Certificate Number, Student Name, Roll Number, Course Name, Year, Marks Obtained, Total Marks, Percentage
```

**Example:**
```
CERT001, Rajesh Kumar, ROLL001, B.Tech Computer Science, 2023, 85, 100, 85
```

---

## Quick Reference - All Institutions

| Institution Code | Institution Name | Certificate File | Count |
|-----------------|------------------|-------------------|-------|
| JHU001 | Jharkhand University | sample_certificates_jhu001.csv | 10 |
| RC001 | Ranchi College | sample_certificates_rc001.csv | 10 |
| DIT001 | Dhanbad Institute | sample_certificates_dit001.csv | 10 |
| JU001 | Jamshedpur University | sample_certificates_ju001.csv | 10 |
| BEC001 | Bokaro Engineering College | sample_certificates_bec001.csv | 10 |

---

## Steps to Upload Certificates

### For Institution User:

1. **Login** with your institution account
2. Navigate to **Institutions** page
3. Click **"📤 Bulk Upload Certificates"** button
4. **Open the certificate file** for your institution
   - Example: If you're from Jharkhand University (JHU001), use `sample_certificates_jhu001.csv`
5. **Copy all data** (Ctrl+A, Ctrl+C)
6. **Paste in the textarea** (Ctrl+V)
7. Click **Upload**
8. Success message will show: "Successfully uploaded X certificates"

---

## Sample Data Preview

### Jharkhand University (JHU001) - First 3 Certificates:
```
CERT001, Rajesh Kumar, ROLL001, B.Tech Computer Science, 2023, 85, 100, 85
CERT002, Priya Sharma, ROLL002, B.Tech Electronics, 2023, 88, 100, 88
CERT003, Amit Singh, ROLL003, B.Tech Mechanical, 2022, 82, 100, 82
```

### Ranchi College (RC001) - First 3 Certificates:
```
CERT101, Deepak Kumar, ROLL101, B.Sc Chemistry, 2023, 88, 100, 88
CERT102, Meera Singh, ROLL102, B.Com, 2022, 85, 100, 85
CERT103, Ravi Shankar, ROLL103, B.A History, 2023, 87, 100, 87
```

---

## Important Notes

1. **Certificate Numbers** are unique per institution
2. **Roll Numbers** follow pattern: ROLL001, ROLL002, etc.
3. **Years** are 2022 or 2023
4. **Marks** are realistic (80-95 range)
5. **All certificates** have 100 as total marks
6. **Percentage** is calculated automatically

---

## Testing Verification

After uploading certificates, you can test verification:

1. Go to **Verify Certificate** page
2. Use **Manual Entry** mode
3. Enter certificate details:
   - Certificate Number: CERT001
   - Student Name: Rajesh Kumar
   - Roll Number: ROLL001
   - Course: B.Tech Computer Science
   - Year: 2023
4. Click **Verify**
5. Should show **Verified** status

---

## Adding More Certificates

You can add more certificates by:
1. Following the same format
2. Using unique certificate numbers
3. Adding to the existing file or creating new entries
4. Uploading again (duplicates will be skipped)

---

## Troubleshooting

**Issue:** "No valid certificates found"
- **Solution:** Check data format - each line needs at least 3 fields (Certificate Number, Student Name, Roll Number)

**Issue:** "Certificate number already exists"
- **Solution:** Use different certificate numbers for new entries

**Issue:** Upload fails
- **Solution:** Check console for errors, ensure data format is correct

---

## Total Certificates Available

- **5 Institutions** × **10 Certificates each** = **50 Total Certificates**

All ready for bulk upload! 🎓

