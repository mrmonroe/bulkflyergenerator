import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img 
            src="/logo.png" 
            alt="Bulk Flyer Generator" 
            className="me-2" 
            style={{ height: '32px', width: 'auto' }}
          />
          <span className="d-none d-sm-inline">Bulk Flyer Generator</span>
          <span className="d-inline d-sm-none">BFG</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNav}
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                to="/shows" 
                className={`nav-link ${location.pathname === '/shows' ? 'active' : ''}`}
                onClick={() => setIsNavCollapsed(true)}
              >
                <i className="fas fa-calendar-alt me-1"></i>
                Shows
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link 
                    to="/" 
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="fas fa-home me-1"></i>
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/my-shows" 
                    className={`nav-link ${location.pathname === '/my-shows' ? 'active' : ''}`}
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="fas fa-calendar-check me-1"></i>
                    My Shows
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/profile" 
                    className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    <i className="fas fa-user me-1"></i>
                    Profile
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <div className="dropdown me-3">
                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user-circle me-1"></i>
                  <span className="d-none d-md-inline">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user.email
                    }
                  </span>
                  <span className="d-inline d-md-none">
                    {user.first_name ? user.first_name : user.email.split('@')[0]}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link to="/" className="dropdown-item">
                      <i className="fas fa-home me-2"></i>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-shows" className="dropdown-item">
                      <i className="fas fa-calendar-check me-2"></i>
                      My Shows
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      <i className="fas fa-user me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </Link>
                <Link to="/register" className="btn btn-light">
                  <i className="fas fa-user-plus me-1"></i>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
