import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🎓</span>
          Authenticity Validator
        </Link>
        
        {user && (
          <div className="navbar-menu">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/verify" className="nav-link">Verify Certificate</Link>
            
            {(user.role === 'institution' || user.role === 'admin') && (
              <Link to="/certificates" className="nav-link">Certificates</Link>
            )}
            
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="nav-link">Admin</Link>
                <Link to="/institutions" className="nav-link">Institutions</Link>
              </>
            )}
            
            <Link to="/verifications" className="nav-link">Verifications</Link>
            
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

