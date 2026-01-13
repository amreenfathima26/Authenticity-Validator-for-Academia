const ocrService = require('./services/ocrService');
const path = require('path');

const testPDF = async () => {
    // Correct path: parent of backend dir
    const filePath = path.join(__dirname, '..', 'sample_certificate_iitb001.png');
    console.log(`Testing OCR on: ${filePath}`);

    try {
        const data = await ocrService.extractCertificateData(filePath);
        console.log('--- Extracted Data ---');
        console.log(data);
    } catch (error) {
        console.error('OCR Failed:', error);
    }
};

testPDF();
