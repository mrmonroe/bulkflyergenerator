import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="header-logo-link">
            <img src="/logo.png" alt="Matt Monroe Logo" className="header-logo" />
            <h1 className="header-title">Bulk Flyer Generator</h1>
          </Link>
        </div>
        
        {user && (
          <div className="header-right">
            <nav className="header-nav">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Shows
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Profile
              </Link>
            </nav>
            <div className="user-info">
              <span className="user-name">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user.email
                }
              </span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
