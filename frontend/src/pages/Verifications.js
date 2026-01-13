import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Verifications.css';

const Verifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const params = filter ? `?status=${filter}` : '';
      const response = await api.get(`/api/verifications${params}`);
      setVerifications(response.data.verifications);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'status-verified';
      case 'rejected':
        return 'status-rejected';
      case 'suspicious':
        return 'status-suspicious';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="verifications-container">
      <div className="page-header">
        <h1>Verification History</h1>
        <div className="filter-buttons">
          <button
            className={filter === '' ? 'active' : ''}
            onClick={() => setFilter('')}
          >
            All
          </button>
          <button
            className={filter === 'verified' ? 'active' : ''}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
          <button
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
          <button
            className={filter === 'suspicious' ? 'active' : ''}
            onClick={() => setFilter('suspicious')}
          >
            Suspicious
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading verifications...</div>
      ) : (
        <div className="verifications-list">
          {verifications.length === 0 ? (
            <div className="empty-state">No verifications found</div>
          ) : (
            verifications.map(verif => (
              <div key={verif.id} className="verification-card">
                <div className="verification-header">
                  <div>
                    <h3>Certificate #{verif.certificate_number || 'N/A'}</h3>
                    <p className="student-name">{verif.student_name || 'N/A'}</p>
                  </div>
                  <div className={`status-badge ${getStatusColor(verif.verification_status)}`}>
                    {verif.verification_status}
                  </div>
                </div>
                <div className="verification-details">
                  <div className="detail-row">
                    <span><strong>Verifier:</strong> {verif.verifier_name || 'N/A'}</span>
                    <span><strong>Institution:</strong> {verif.institution_name || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span><strong>Type:</strong> {verif.verification_type}</span>
                    <span><strong>Match Score:</strong> {verif.match_score || 0}%</span>
                  </div>
                  {verif.anomalies && typeof verif.anomalies === 'object' && (
                    <div className="anomalies">
                      <strong>Anomalies:</strong>
                      <ul>
                        {Array.isArray(verif.anomalies) ? (
                          verif.anomalies.map((anomaly, idx) => (
                            <li key={idx}>{anomaly}</li>
                          ))
                        ) : (
                          <li>{JSON.stringify(verif.anomalies)}</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <div className="verification-date">
                    Verified on: {new Date(verif.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Verifications;

