const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

class OCRService {
  async extractTextFromImage(imagePath) {
    try {
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: m => console.log(m)
      });
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromPDF(pdfPath) {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF Parse Error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async extractCertificateData(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      let extractedText = '';

      if (ext === '.pdf') {
        extractedText = await this.extractTextFromPDF(filePath);
      } else {
        extractedText = await this.extractTextFromImage(filePath);
      }

      // Parse extracted text to find key information
      const data = this.parseCertificateText(extractedText);
      return data;
    } catch (error) {
      console.error('Extraction Error:', error);
      throw error;
    }
  }

  parseCertificateText(text) {
    const data = {
      studentName: this.extractField(text, ['name', 'student', 'candidate']),
      rollNumber: this.extractField(text, ['roll', 'registration', 'enrollment']),
      certificateNumber: this.extractField(text, ['certificate', 'cert', 'number', 'id']),
      courseName: this.extractField(text, ['course', 'degree', 'program', 'programme']),
      year: this.extractYear(text),
      marks: this.extractMarks(text),
      percentage: this.extractPercentage(text),
      institution: this.extractField(text, ['university', 'college', 'institute', 'institution']),
      rawText: text
    };

    return data;
  }

  extractField(text, keywords) {
    const lines = text.split('\n');
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          // Try to extract value after the keyword
          const match = line.match(new RegExp(`${keyword}[\\s:]*([^\\n]+)`, 'i'));
          if (match && match[1]) {
            return match[1].trim();
          }
        }
      }
    }
    return null;
  }

  extractYear(text) {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }

  extractMarks(text) {
    const marksMatch = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (marksMatch) {
      return {
        obtained: parseFloat(marksMatch[1]),
        total: parseFloat(marksMatch[2])
      };
    }
    return null;
  }

  extractPercentage(text) {
    const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    return percentMatch ? parseFloat(percentMatch[1]) : null;
  }
}

module.exports = new OCRService();

