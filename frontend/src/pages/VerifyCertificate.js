import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './VerifyCertificate.css';

const VerifyCertificate = () => {
  const [file, setFile] = useState(null);
  const [manualData, setManualData] = useState({
    certificate_number: '',
    student_name: '',
    roll_number: '',
    course_name: '',
    year: ''
  });
  const [verificationMode, setVerificationMode] = useState('file'); // 'file' or 'manual'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleManualChange = (e) => {
    setManualData({ ...manualData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      setLoading(true);
      const uploadRes = await axios.post('http://localhost:5000/api/upload/certificate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return uploadRes.data.fileUrl;
    } catch (error) {
      toast.error('File upload failed');
      throw error;
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let fileUrl = null;

      if (verificationMode === 'file') {
        fileUrl = await handleFileUpload();
      }

      const verificationData = {
        uploaded_file_url: fileUrl,
        manual_data: verificationMode === 'manual' ? manualData : null,
        certificate_number: manualData.certificate_number || null
      };

      const response = await axios.post('http://localhost:5000/api/verifications', verificationData);

      setResult(response.data);
      
      if (response.data.result.status === 'verified') {
        toast.success('Certificate verified successfully!');
      } else if (response.data.result.status === 'suspicious') {
        toast.warning('Certificate verification shows suspicious results');
      } else {
        toast.error('Certificate verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1>Verify Certificate</h1>
        <p>Upload a certificate or enter details manually to verify authenticity</p>

        <div className="mode-selector">
          <button
            className={verificationMode === 'file' ? 'active' : ''}
            onClick={() => setVerificationMode('file')}
          >
            📄 Upload File
          </button>
          <button
            className={verificationMode === 'manual' ? 'active' : ''}
            onClick={() => setVerificationMode('manual')}
          >
            ✍️ Manual Entry
          </button>
        </div>

        <form onSubmit={handleVerify} className="verify-form">
          {verificationMode === 'file' ? (
            <div className="form-group">
              <label>Upload Certificate (PDF, JPG, PNG)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
              />
              {file && <p className="file-name">Selected: {file.name}</p>}
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Certificate Number *</label>
                  <input
                    type="text"
                    name="certificate_number"
                    value={manualData.certificate_number}
                    onChange={handleManualChange}
                    required
                    placeholder="Enter certificate number"
                  />
                </div>
                <div className="form-group">
                  <label>Student Name</label>
                  <input
                    type="text"
                    name="student_name"
                    value={manualData.student_name}
                    onChange={handleManualChange}
                    placeholder="Enter student name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    name="roll_number"
                    value={manualData.roll_number}
                    onChange={handleManualChange}
                    placeholder="Enter roll number"
                  />
                </div>
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    name="course_name"
                    value={manualData.course_name}
                    onChange={handleManualChange}
                    placeholder="Enter course name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Year of Passing</label>
                <input
                  type="number"
                  name="year"
                  value={manualData.year}
                  onChange={handleManualChange}
                  placeholder="Enter year"
                  min="1900"
                  max="2100"
                />
              </div>
            </>
          )}

          <button type="submit" className="verify-button" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </form>

        {result && (
          <div className="verification-result">
            <h2>Verification Result</h2>
            <div className={`result-status ${result.result.status}`}>
              <span className="status-icon">
                {result.result.status === 'verified' ? '✅' : 
                 result.result.status === 'suspicious' ? '⚠️' : '❌'}
              </span>
              <span className="status-text">{result.result.status.toUpperCase()}</span>
            </div>
            <div className="result-details">
              <div className="detail-item">
                <strong>Match Score:</strong> {result.result.matchScore}%
              </div>
              <div className="detail-item">
                <strong>Message:</strong> {result.result.message}
              </div>
              {result.result.anomalies && result.result.anomalies.length > 0 && (
                <div className="anomalies">
                  <strong>Anomalies Detected:</strong>
                  <ul>
                    {result.result.anomalies.map((anomaly, idx) => (
                      <li key={idx}>{anomaly}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.extractedData && (
                <div className="extracted-data">
                  <strong>Extracted Data:</strong>
                  <pre>{JSON.stringify(result.extractedData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;

