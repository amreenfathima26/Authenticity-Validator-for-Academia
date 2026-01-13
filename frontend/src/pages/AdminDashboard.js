import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/alerts?status=open');
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/alerts/${alertId}/resolve`);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>System Overview & Analytics</p>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.statistics.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-content">
                <h3>{stats.statistics.totalInstitutions}</h3>
                <p>Institutions</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📜</div>
              <div className="stat-content">
                <h3>{stats.statistics.totalCertificates}</h3>
                <p>Certificates</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.statistics.totalVerifications}</h3>
                <p>Verifications</p>
              </div>
            </div>
            <div className="stat-card alert-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>{stats.statistics.openAlerts}</h3>
                <p>Open Alerts</p>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h2>Verification Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.verificationStats}
                    dataKey="count"
                    nameKey="verification_status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.verificationStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h2>Top Institutions by Certificates</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.institutionStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="certificate_count" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="recent-section">
            <div className="recent-card">
              <h2>Recent Verifications</h2>
              <div className="recent-list">
                {stats.recentVerifications.map(verif => (
                  <div key={verif.id} className="recent-item">
                    <div>
                      <strong>{verif.certificate_number || 'N/A'}</strong>
                      <span className="student-name">{verif.student_name || 'N/A'}</span>
                    </div>
                    <span className={`status-badge status-${verif.verification_status}`}>
                      {verif.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recent-card">
              <h2>Recent Alerts</h2>
              <div className="recent-list">
                {stats.recentAlerts.map(alert => (
                  <div key={alert.id} className="recent-item alert-item">
                    <div>
                      <strong>{alert.alert_type}</strong>
                      <span className="alert-desc">{alert.description}</span>
                      <span className="alert-severity severity-{alert.severity}">{alert.severity}</span>
                    </div>
                    <button 
                      className="resolve-btn"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

