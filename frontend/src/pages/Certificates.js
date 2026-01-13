import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Certificates.css';

const Certificates = () => {
  const { user } = useContext(AuthContext);
  const [certificates, setCertificates] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [formData, setFormData] = useState({
    institution_id: '',
    certificate_number: '',
    student_name: '',
    roll_number: '',
    course_name: '',
    degree_type: '',
    year_of_passing: '',
    marks_obtained: '',
    total_marks: '',
    percentage: '',
    issued_date: ''
  });
  const [filters, setFilters] = useState({
    institution_id: '',
    certificate_number: '',
    student_name: ''
  });

  useEffect(() => {
    fetchCertificates();
    fetchInstitutions();
  }, [filters]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.institution_id) params.append('institution_id', filters.institution_id);
      if (filters.certificate_number) params.append('certificate_number', filters.certificate_number);
      if (filters.student_name) params.append('student_name', filters.student_name);

      const response = await api.get(`/api/certificates?${params}`);
      setCertificates(response.data.certificates);
    } catch (error) {
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/api/institutions');
      setInstitutions(response.data.institutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCert) {
        await api.put(`/api/certificates/${editingCert.id}`, formData);
        toast.success('Certificate updated successfully');
      } else {
        await api.post('/api/certificates', formData);
        toast.success('Certificate created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setFormData({
      institution_id: cert.institution_id || '',
      certificate_number: cert.certificate_number || '',
      student_name: cert.student_name || '',
      roll_number: cert.roll_number || '',
      course_name: cert.course_name || '',
      degree_type: cert.degree_type || '',
      year_of_passing: cert.year_of_passing || '',
      marks_obtained: cert.marks_obtained || '',
      total_marks: cert.total_marks || '',
      percentage: cert.percentage || '',
      issued_date: cert.issued_date || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      institution_id: user?.institution_id || '',
      certificate_number: '',
      student_name: '',
      roll_number: '',
      course_name: '',
      degree_type: '',
      year_of_passing: '',
      marks_obtained: '',
      total_marks: '',
      percentage: '',
      issued_date: ''
    });
    setEditingCert(null);
  };

  const handleBulkUpload = async () => {
    if (uploading) return;

    try {
      if (!bulkFile) {
        toast.error('Please select a CSV file');
        return;
      }

      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', bulkFile);

      const instId = user?.institution_id || formData.institution_id;
      if (instId) {
        formDataUpload.append('institution_id', instId);
      }

      const response = await api.post('/api/certificates/batch', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { summary, details } = response.data;
      toast.success(`Processed: ${summary.success} success, ${summary.failed} failed`);

      if (summary.failed > 0) {
        console.warn('Failed rows:', details.filter(d => d.status === 'failed'));
        toast.warning('Check console for details on failed rows');
      }

      setShowBulkModal(false);
      setBulkFile(null);
      fetchCertificates();
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error(error.response?.data?.message || 'Bulk upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="certificates-container">
      <div className="page-header">
        <h1>Certificates</h1>
        {(user?.role === 'institution' || user?.role === 'admin') && (
          <>
            <button className="add-button" onClick={() => { resetForm(); setShowModal(true); }}>
              + Add Certificate
            </button>
            <button className="add-button" onClick={() => setShowBulkModal(true)}>
              📤 Bulk Upload
            </button>
          </>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by certificate number"
          value={filters.certificate_number}
          onChange={(e) => setFilters({ ...filters, certificate_number: e.target.value })}
        />
        <input
          type="text"
          placeholder="Search by student name"
          value={filters.student_name}
          onChange={(e) => setFilters({ ...filters, student_name: e.target.value })}
        />
        {user?.role === 'admin' && (
          <select
            value={filters.institution_id}
            onChange={(e) => setFilters({ ...filters, institution_id: e.target.value })}
          >
            <option value="">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading certificates...</div>
      ) : (
        <div className="certificates-table">
          <table>
            <thead>
              <tr>
                <th>Certificate #</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Year</th>
                <th>Marks</th>
                <th>Institution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => (
                <tr key={cert.id}>
                  <td>{cert.certificate_number}</td>
                  <td>{cert.student_name}</td>
                  <td>{cert.course_name}</td>
                  <td>{cert.year_of_passing}</td>
                  <td>{cert.marks_obtained}/{cert.total_marks} ({cert.percentage}%)</td>
                  <td>{cert.institution_name || cert.institution_code}</td>
                  <td>
                    {(user?.role === 'institution' || user?.role === 'admin') && (
                      <button className="edit-btn" onClick={() => handleEdit(cert)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCert ? 'Edit Certificate' : 'Add Certificate'}</h2>
            <form onSubmit={handleSubmit}>
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Institution *</label>
                  <select
                    name="institution_id"
                    value={formData.institution_id}
                    onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Certificate Number *</label>
                  <input
                    type="text"
                    name="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                    required
                    disabled={!!editingCert}
                  />
                </div>
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    name="course_name"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Degree Type</label>
                  <input
                    type="text"
                    name="degree_type"
                    value={formData.degree_type}
                    onChange={(e) => setFormData({ ...formData, degree_type: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Year of Passing</label>
                  <input
                    type="number"
                    name="year_of_passing"
                    value={formData.year_of_passing}
                    onChange={(e) => setFormData({ ...formData, year_of_passing: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Marks Obtained</label>
                  <input
                    type="number"
                    step="0.01"
                    name="marks_obtained"
                    value={formData.marks_obtained}
                    onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Total Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    name="percentage"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Issued Date</label>
                  <input
                    type="date"
                    name="issued_date"
                    value={formData.issued_date}
                    onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
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

      {showBulkModal && (user?.role === 'institution' || user?.role === 'admin') && (
        <div className="modal-overlay" onClick={() => { setShowBulkModal(false); setBulkFile(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Batch Upload Certificates</h2>
            <p className="bulk-instructions">
              Upload a CSV file with certificate data.<br />
              <strong>Columns:</strong> Certificate Number, Student Name, Roll Number, Course, Year, Marks, Total, Percentage
            </p>

            <div className="file-upload-area" style={{ padding: '20px', border: '2px dashed #ccc', textAlign: 'center', margin: '20px 0' }}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setBulkFile(e.target.files[0])}
                style={{ display: 'block', margin: '0 auto' }}
              />
              {bulkFile && <p>Selected: {bulkFile.name}</p>}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBulkModal(false);
                  setBulkFile(null);
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBulkUpload();
                }}
                disabled={uploading || !bulkFile}
              >
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;

