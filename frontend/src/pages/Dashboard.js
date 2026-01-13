import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalVerifications: 0,
    verified: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user-specific statistics
      const [certsRes, verifRes] = await Promise.all([
        axios.get('http://localhost:5000/api/certificates?limit=1'),
        axios.get('http://localhost:5000/api/verifications?limit=1')
      ]);

      const verifiedRes = await axios.get('http://localhost:5000/api/verifications?status=verified&limit=1');
      const rejectedRes = await axios.get('http://localhost:5000/api/verifications?status=rejected&limit=1');

      setStats({
        totalCertificates: certsRes.data.total || 0,
        totalVerifications: verifRes.data.verifications?.length || 0,
        verified: verifiedRes.data.verifications?.length || 0,
        rejected: rejectedRes.data.verifications?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Certificate Verification Dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📜</div>
          <div className="stat-content">
            <h3>{stats.totalCertificates}</h3>
            <p>Total Certificates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.totalVerifications}</h3>
            <p>Total Verifications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>{stats.verified}</h3>
            <p>Verified</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✗</div>
          <div className="stat-content">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/verify" className="action-card">
            <div className="action-icon">🔍</div>
            <h3>Verify Certificate</h3>
            <p>Upload and verify a certificate</p>
          </Link>
          <Link to="/verifications" className="action-card">
            <div className="action-icon">📋</div>
            <h3>View Verifications</h3>
            <p>Check verification history</p>
          </Link>
          {(user?.role === 'institution' || user?.role === 'admin') && (
            <Link to="/certificates" className="action-card">
              <div className="action-icon">📄</div>
              <h3>Manage Certificates</h3>
              <p>Add and manage certificates</p>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="action-card">
              <div className="action-icon">⚙️</div>
              <h3>Admin Panel</h3>
              <p>System administration</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

