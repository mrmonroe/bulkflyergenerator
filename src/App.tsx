import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import UserProfile from './components/UserProfile';
import MyShows from './components/MyShows';
import PublicShows from './components/PublicShows';
import AuthPage from './components/auth/AuthPage';
import { Card, Button } from './components/bootstrap';
import './App.css';

const HomePage: React.FC = () => {
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Header />
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <Card className="text-center">
              <div className="card-body py-5">
                <h1 className="display-4 mb-4">
                  <i className="fas fa-music me-3 text-primary"></i>
                  Show Flyer Generator
                </h1>
                <p className="lead text-muted mb-5">
                  Create professional flyers for your shows with custom templates
                </p>
                
                <div className="row g-4">
                  <div className="col-md-6">
                    <Card className="h-100 border-0 shadow-sm">
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-plus-circle fa-3x text-primary"></i>
                        </div>
                        <h4 className="card-title">Create Shows</h4>
                        <p className="card-text text-muted">
                          Add individual shows or upload multiple shows via CSV
                        </p>
                        <div className="d-grid gap-2">
                          <Link to="/my-shows" className="btn btn-primary">
                            <i className="fas fa-plus me-2"></i>
                            Add Show
                          </Link>
                          <Link to="/my-shows" className="btn btn-outline-primary">
                            <i className="fas fa-upload me-2"></i>
                            Upload CSV
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="col-md-6">
                    <Card className="h-100 border-0 shadow-sm">
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <i className="fas fa-palette fa-3x text-success"></i>
                        </div>
                        <h4 className="card-title">Design Templates</h4>
                        <p className="card-text text-muted">
                          Create custom flyer templates with your own backgrounds
                        </p>
                        <div className="d-grid gap-2">
                          <Button variant="success" disabled>
                            <i className="fas fa-palette me-2"></i>
                            Create Template
                            <small className="d-block mt-1 text-muted">Coming Soon</small>
                          </Button>
                          <Button variant="outline-success" disabled>
                            <i className="fas fa-edit me-2"></i>
                            Manage Templates
                            <small className="d-block mt-1 text-muted">Coming Soon</small>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
                
                <div className="mt-5">
                  <Card className="border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <h4 className="card-title mb-3">Generate Flyers</h4>
                      <p className="card-text text-muted mb-4">
                        Once you have shows and templates, generate professional flyers
                      </p>
                      <Button variant="primary" size="lg" disabled>
                        <i className="fas fa-magic me-2"></i>
                        Generate Flyers
                        <small className="d-block mt-1 text-muted">Coming Soon</small>
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/shows" element={
            <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
              <Header />
              <div className="container-fluid py-4">
                <PublicShows />
              </div>
            </div>
          } />
          <Route path="/my-shows" element={
            <ProtectedRoute>
              <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
                <Header />
                <div className="container-fluid py-4">
                  <MyShows />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
                <Header />
                <div className="container-fluid py-4">
                  <UserProfile />
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;