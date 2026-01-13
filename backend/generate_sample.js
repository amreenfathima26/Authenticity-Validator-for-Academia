const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ compress: false });
const outputPath = path.join(__dirname, '..', 'sample_certificate_iitb001.pdf');

doc.pipe(fs.createWriteStream(outputPath));

// Add some "Certificate" styling
doc.fontSize(25).text('CERTIFICATE OF COMPLETION', { align: 'center' });
doc.moveDown();
doc.fontSize(18).text('Indian Institute of Technology Bombay', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('This is to certify that', { align: 'center' });
doc.moveDown();
doc.fontSize(20).text('Aarav Sharma', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('has successfully completed the course', { align: 'center' });
doc.moveDown();
doc.fontSize(16).text('B.Tech Computer Science', { align: 'center' });
doc.moveDown();
doc.text('Year: 2023', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Certificate Number: IITB001', { align: 'center' });
doc.text('Roll Number: 19001001', { align: 'center' });
doc.text('Performance: 9.4 CGPA', { align: 'center' });

doc.end();

console.log(`Sample certificate generated at: ${outputPath}`);
