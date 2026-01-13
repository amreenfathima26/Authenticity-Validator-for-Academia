import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Institutions.css';

const Institutions = () => {
  const { user } = useContext(AuthContext);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkInstitutionModal, setShowBulkInstitutionModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    address: '',
    contact_email: '',
    contact_phone: ''
  });
  const [bulkData, setBulkData] = useState('');
  const [bulkInstitutionData, setBulkInstitutionData] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/institutions');
      setInstitutions(response.data.institutions);
    } catch (error) {
      toast.error('Failed to fetch institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/institutions', formData);
      toast.success('Institution created successfully');
      setShowModal(false);
      resetForm();
      fetchInstitutions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleBulkUpload = async () => {
    try {
      const lines = bulkData.split('\n').filter(line => line.trim());
      const certificates = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          institution_id: user?.institution_id,
          certificate_number: parts[0],
          student_name: parts[1],
          roll_number: parts[2] || '',
          course_name: parts[3] || '',
          year_of_passing: parts[4] ? parseInt(parts[4]) : null,
          marks_obtained: parts[5] ? parseFloat(parts[5]) : null,
          total_marks: parts[6] ? parseFloat(parts[6]) : null,
          percentage: parts[7] ? parseFloat(parts[7]) : null
        };
      });

      await api.post('/api/institutions/bulk-upload', {
        institution_id: user?.institution_id,
        certificates
      });

      toast.success(`Successfully uploaded ${certificates.length} certificates`);
      setShowBulkModal(false);
      setBulkData('');
      fetchInstitutions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk upload failed');
    }
  };

  const handleBulkInstitutionUpload = async () => {
    if (uploading) return;

    try {
      // Get the current value directly from the textarea if possible
      const dataToProcess = bulkInstitutionData || '';
      console.log('Bulk institution data:', dataToProcess);
      console.log('Data length:', dataToProcess?.length);
      console.log('Trimmed length:', dataToProcess?.trim()?.length);

      if (!dataToProcess || dataToProcess.trim() === '') {
        toast.error('Please enter institution data in the text area. Format: Name, Code, Type');
        return;
      }

      setUploading(true);

      const lines = dataToProcess.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        toast.error('No valid data found. Please enter institution data.');
        setUploading(false);
        return;
      }

      const institutions = [];
      const errors = [];

      lines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim());

        if (parts.length < 3) {
          errors.push(`Line ${index + 1}: Insufficient data. Required: Name, Code, Type`);
          return;
        }

        if (!parts[0] || !parts[1] || !parts[2]) {
          errors.push(`Line ${index + 1}: Name, Code, and Type are required`);
          return;
        }

        institutions.push({
          name: parts[0],
          code: parts[1],
          type: parts[2],
          address: parts[3] || '',
          contact_email: parts[4] || '',
          contact_phone: parts[5] || ''
        });
      });

      if (errors.length > 0) {
        toast.warning(`${errors.length} line(s) have errors. Check console.`);
        console.log('Data errors:', errors);
      }

      if (institutions.length === 0) {
        toast.error('No valid institutions found. Please check your data format.');
        setUploading(false);
        return;
      }

      console.log('Sending institutions:', institutions);
      console.log('Institutions count:', institutions.length);

      const response = await api.post('/api/institutions/bulk-upload-institutions', {
        institutions
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast.success(`Successfully uploaded ${response.data.inserted} institutions. ${response.data.errors} errors.`);
      if (response.data.errorDetails && response.data.errorDetails.length > 0) {
        console.log('Upload errors:', response.data.errorDetails);
        toast.warning('Some institutions failed to upload. Check console for details.');
      }
      setShowBulkInstitutionModal(false);
      setBulkInstitutionData('');
      fetchInstitutions();
    } catch (error) {
      console.error('Bulk upload error:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message && error.message.includes('Line')) {
        toast.error(error.message);
      } else {
        toast.error('Bulk upload failed. Please check the data format and try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: '',
      address: '',
      contact_email: '',
      contact_phone: ''
    });
  };

  return (
    <div className="institutions-container">
      <div className="page-header">
        <h1>Institutions</h1>
        {user?.role === 'admin' && (
          <>
            <button className="add-button" onClick={() => { resetForm(); setShowModal(true); }}>
              + Add Institution
            </button>
            <button className="add-button" onClick={() => setShowBulkInstitutionModal(true)}>
              📤 Bulk Upload Institutions
            </button>
          </>
        )}
        {(user?.role === 'institution' || user?.role === 'admin') && (
          <button className="add-button" onClick={() => setShowBulkModal(true)}>
            📤 Bulk Upload Certificates
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading institutions...</div>
      ) : (
        <div className="institutions-grid">
          {institutions.map(inst => (
            <div key={inst.id} className="institution-card">
              <div className="institution-header">
                <h3>{inst.name}</h3>
                <span className={`status-badge ${inst.status}`}>{inst.status}</span>
              </div>
              <div className="institution-details">
                <p><strong>Code:</strong> {inst.code}</p>
                <p><strong>Type:</strong> {inst.type}</p>
                {inst.address && <p><strong>Address:</strong> {inst.address}</p>}
                {inst.contact_email && <p><strong>Email:</strong> {inst.contact_email}</p>}
                {inst.contact_phone && <p><strong>Phone:</strong> {inst.contact_phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && user?.role === 'admin' && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Institution</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    placeholder="e.g., University, College"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay" onClick={() => { setShowBulkModal(false); setBulkData(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Bulk Upload Certificates</h2>
            <p className="bulk-instructions">
              Enter certificate data in CSV format (one per line):<br />
              Certificate Number, Student Name, Roll Number, Course, Year, Marks Obtained, Total Marks, Percentage
            </p>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows="15"
              className="bulk-textarea"
              placeholder="CERT001, John Doe, ROLL001, B.Tech, 2023, 85, 100, 85"
            />
            <div className="modal-actions">
              <button type="button" onClick={() => { setShowBulkModal(false); setBulkData(''); }}>Cancel</button>
              <button type="button" onClick={handleBulkUpload}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {showBulkInstitutionModal && user?.role === 'admin' && (
        <div className="modal-overlay" onClick={() => { setShowBulkInstitutionModal(false); setBulkInstitutionData(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Bulk Upload Institutions</h2>
            <p className="bulk-instructions">
              Enter institution data in CSV format (one per line):<br />
              <strong>Format:</strong> Name, Code, Type, Address, Contact Email, Contact Phone<br />
              <strong>Required:</strong> Name, Code, Type<br />
              <strong>Optional:</strong> Address, Contact Email, Contact Phone
            </p>
            <textarea
              value={bulkInstitutionData}
              onChange={(e) => {
                console.log('Textarea value changed:', e.target.value);
                setBulkInstitutionData(e.target.value);
              }}
              rows="15"
              className="bulk-textarea"
              placeholder="Jharkhand University, JHU001, University, Ranchi, Jharkhand, contact@jhu.edu, 1234567890&#10;Ranchi College, RC001, College, Ranchi, Jharkhand, contact@rc.edu, 9876543210"
            />
            {bulkInstitutionData && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                {bulkInstitutionData.split('\n').filter(line => line.trim()).length} line(s) detected
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBulkInstitutionModal(false);
                  setBulkInstitutionData('');
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBulkInstitutionUpload();
                }}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutions;

