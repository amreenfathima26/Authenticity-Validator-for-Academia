# Sample Data for Bulk Upload

## Institutions Sample Data

Copy and paste this data into the "Bulk Upload Institutions" modal:

```
Jharkhand University, JHU001, University, Ranchi, Jharkhand, admin@jhu.edu, 0651-1234567
Ranchi College, RC001, College, Ranchi, Jharkhand, info@rc.edu, 0651-2345678
Dhanbad Institute of Technology, DIT001, Institute, Dhanbad, Jharkhand, contact@dit.edu, 0326-3456789
Jamshedpur University, JU001, University, Jamshedpur, Jharkhand, admin@ju.edu, 0657-4567890
Bokaro Engineering College, BEC001, College, Bokaro, Jharkhand, info@bec.edu, 06542-5678901
Hazaribagh College, HC001, College, Hazaribagh, Jharkhand, contact@hc.edu, 06546-6789012
Deoghar College, DC001, College, Deoghar, Jharkhand, admin@dc.edu, 06432-7890123
Giridih Institute, GI001, Institute, Giridih, Jharkhand, info@gi.edu, 06532-8901234
Chaibasa College, CC001, College, Chaibasa, Jharkhand, contact@cc.edu, 06587-9012345
Dumka University, DU001, University, Dumka, Jharkhand, admin@du.edu, 06434-0123456
Pakur College, PC001, College, Pakur, Jharkhand, info@pc.edu, 06436-1234567
Sahibganj Institute, SI001, Institute, Sahibganj, Jharkhand, contact@si.edu, 06436-2345678
Godda College, GC001, College, Godda, Jharkhand, admin@gc.edu, 06426-3456789
Ramgarh Engineering College, REC001, College, Ramgarh, Jharkhand, info@rec.edu, 06553-4567890
Koderma College, KC001, College, Koderma, Jharkhand, contact@kc.edu, 06534-5678901
Gumla University, GU001, University, Gumla, Jharkhand, admin@gu.edu, 06524-6789012
Lohardaga College, LC001, College, Lohardaga, Jharkhand, info@lc.edu, 06526-7890123
Simdega Institute, SGI001, Institute, Simdega, Jharkhand, contact@sgi.edu, 06525-8901234
Khunti College, KHC001, College, Khunti, Jharkhand, admin@khc.edu, 06528-9012345
Latehar College, LTC001, College, Latehar, Jharkhand, info@ltc.edu, 06559-0123456
Palamu University, PU001, University, Palamu, Jharkhand, admin@pu.edu, 06562-1234567
Garhwa College, GWC001, College, Garhwa, Jharkhand, contact@gwc.edu, 06561-2345678
```

## Format Explanation

Each line represents one institution with the following fields (comma-separated):

1. **Name** - Institution name (Required)
2. **Code** - Unique institution code (Required)
3. **Type** - Institution type: University/College/Institute (Required)
4. **Address** - Full address (Optional)
5. **Contact Email** - Email address (Optional)
6. **Contact Phone** - Phone number (Optional)

## Sample Certificates Data

For bulk uploading certificates (after creating institutions):

```
CERT001, John Doe, ROLL001, B.Tech Computer Science, 2023, 85, 100, 85
CERT002, Jane Smith, ROLL002, M.Tech Data Science, 2022, 90, 100, 90
CERT003, Bob Johnson, ROLL003, B.Sc Mathematics, 2023, 78, 100, 78
CERT004, Alice Williams, ROLL004, B.Com, 2022, 88, 100, 88
CERT005, Charlie Brown, ROLL005, M.Sc Physics, 2023, 92, 100, 92
```

Certificate Format:
1. Certificate Number
2. Student Name
3. Roll Number
4. Course Name
5. Year of Passing
6. Marks Obtained
7. Total Marks
8. Percentage

## Quick Start Guide

### Step 1: Upload Institutions
1. Login as Admin
2. Go to Institutions page
3. Click "📤 Bulk Upload Institutions"
4. Paste the institutions data above
5. Click Upload

### Step 2: Create Institution User
1. Go to Register page
2. Select "Institution" role
3. Select an institution from dropdown
4. Complete registration

### Step 3: Upload Certificates
1. Login as Institution user
2. Go to Institutions page
3. Click "📤 Bulk Upload Certificates"
4. Paste certificate data
5. Click Upload

## Notes

- Make sure each institution has a unique code
- Duplicate codes will be skipped with error message
- All fields except Name, Code, Type are optional
- You can modify the data as per your requirements

