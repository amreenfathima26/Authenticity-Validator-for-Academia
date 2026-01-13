const pool = require('../config/db');
const crypto = require('crypto');

class VerificationService {
  async verifyCertificate(certificateData, uploadedFileUrl) {
    try {
      const anomalies = [];
      let matchScore = 0;
      let verificationStatus = 'pending';

      // Search for certificate in database
      const certificateNumber = certificateData.certificateNumber;
      if (!certificateNumber) {
        anomalies.push('Certificate number not found in document');
        return {
          status: 'rejected',
          matchScore: 0,
          anomalies,
          message: 'Certificate number is required for verification'
        };
      }

      // Find certificate in database
      const certResult = await pool.query(
        'SELECT * FROM certificates WHERE certificate_number = $1',
        [certificateNumber]
      );

      if (certResult.rows.length === 0) {
        anomalies.push('Certificate number not found in database');
        return {
          status: 'rejected',
          matchScore: 0,
          anomalies,
          message: 'Certificate not found in our records'
        };
      }

      const dbCertificate = certResult.rows[0];
      let matches = 0;
      let totalChecks = 0; // Dynamic total checks based on available data
      
      // Certificate number match counts as 1 (already verified above)
      matches = 1;
      totalChecks = 1;

      // Check student name
      if (certificateData.studentName && dbCertificate.student_name) {
        totalChecks++;
        const nameMatch = this.fuzzyMatch(
          certificateData.studentName.toLowerCase().trim(),
          dbCertificate.student_name.toLowerCase().trim()
        );
        if (nameMatch > 0.7) {
          matches++;
        } else {
          anomalies.push(`Student name mismatch: Found "${certificateData.studentName}", Expected "${dbCertificate.student_name}"`);
        }
      }

      // Check roll number
      if (certificateData.rollNumber && dbCertificate.roll_number) {
        totalChecks++;
        if (certificateData.rollNumber.toLowerCase().trim() === dbCertificate.roll_number.toLowerCase().trim()) {
          matches++;
        } else {
          anomalies.push(`Roll number mismatch: Found "${certificateData.rollNumber}", Expected "${dbCertificate.roll_number}"`);
        }
      }

      // Check course
      if (certificateData.courseName && dbCertificate.course_name) {
        totalChecks++;
        const courseMatch = this.fuzzyMatch(
          certificateData.courseName.toLowerCase().trim(),
          dbCertificate.course_name.toLowerCase().trim()
        );
        if (courseMatch > 0.7) {
          matches++;
        } else {
          anomalies.push(`Course mismatch: Found "${certificateData.courseName}", Expected "${dbCertificate.course_name}"`);
        }
      }

      // Check year
      if (certificateData.year && dbCertificate.year_of_passing) {
        totalChecks++;
        const year1 = parseInt(certificateData.year);
        const year2 = parseInt(dbCertificate.year_of_passing);
        if (year1 === year2) {
          matches++;
        } else {
          anomalies.push(`Year mismatch: Found "${certificateData.year}", Expected "${dbCertificate.year_of_passing}"`);
        }
      }

      // Check marks/percentage
      if (certificateData.marks && dbCertificate.marks_obtained) {
        totalChecks++;
        const marksDiff = Math.abs(certificateData.marks.obtained - parseFloat(dbCertificate.marks_obtained));
        if (marksDiff < 1) {
          matches++;
        } else {
          anomalies.push(`Marks mismatch: Found "${certificateData.marks.obtained}", Expected "${dbCertificate.marks_obtained}"`);
        }
      } else if (certificateData.percentage && dbCertificate.percentage) {
        totalChecks++;
        const percentDiff = Math.abs(parseFloat(certificateData.percentage) - parseFloat(dbCertificate.percentage));
        if (percentDiff < 1) {
          matches++;
        } else {
          anomalies.push(`Percentage mismatch: Found "${certificateData.percentage}", Expected "${dbCertificate.percentage}"`);
        }
      }

      // Calculate match score (minimum 60% if certificate number matches)
      if (totalChecks > 0) {
        matchScore = (matches / totalChecks) * 100;
      } else {
        // Only certificate number provided and matched
        matchScore = 100;
      }
      
      // If certificate number matches, minimum score is 60%
      if (certificateNumber && certResult.rows.length > 0 && matchScore < 60) {
        matchScore = 60;
      }

      // Determine verification status
      // If certificate number matches, it's at least suspicious (not rejected)
      // Only reject if certificate number doesn't match
      if (certificateNumber && certResult.rows.length > 0) {
        // Certificate found - check other fields
        if (matchScore >= 80 && anomalies.length === 0) {
          verificationStatus = 'verified';
        } else if (matchScore >= 40 || (certificateNumber && certResult.rows.length > 0)) {
          // If certificate number matches, at least suspicious
          verificationStatus = 'suspicious';
        } else {
          verificationStatus = 'suspicious'; // Changed from rejected to suspicious
        }
      } else {
        verificationStatus = 'rejected';
      }

      return {
        status: verificationStatus,
        matchScore: Math.round(matchScore),
        anomalies,
        certificateId: dbCertificate.id,
        message: verificationStatus === 'verified' 
          ? 'Certificate verified successfully' 
          : 'Certificate verification failed'
      };
    } catch (error) {
      console.error('Verification Error:', error);
      throw error;
    }
  }

  fuzzyMatch(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  generateCertificateHash(certificateData) {
    const dataString = JSON.stringify(certificateData);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
}

module.exports = new VerificationService();

