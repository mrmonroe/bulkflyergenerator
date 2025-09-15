import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import UserProfile from './components/UserProfile';
import AuthPage from './components/auth/AuthPage';
import { Show, FlyerData, ExportOptions } from './types';
import { convertShowToFlyerData } from './utils/flyerUtils';
import { loadShowsFromCSV } from './utils/csvParser';
import { FlyerGenerator } from './services/flyerGenerator';
import FlyerPreview from './components/FlyerPreview';
import ExportButton from './components/ExportButton';
import { Button, Card, Alert, Spinner } from './components/bootstrap';
import './App.css';

const MainApp: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [flyerElements, setFlyerElements] = useState<FlyerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShows = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const showsData = await loadShowsFromCSV();
      setShows(showsData);
      
      // Convert shows to flyer data
      const flyerData = showsData.map(convertShowToFlyerData);
      setFlyerElements(flyerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shows data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportFlyer = async (index: number, options: ExportOptions) => {
    try {
      await FlyerGenerator.exportSingleFlyer(flyerElements[index], options);
    } catch (err) {
      console.error('Error exporting flyer:', err);
      alert('Error exporting flyer. Please try again.');
    }
  };

  const handleExportAllInstagram = async () => {
    if (shows.length === 0) {
      alert('Please load shows data first');
      return;
    }
    
    setLoading(true);
    try {
      await FlyerGenerator.exportAllFlyers(shows, 'instagram');
      alert(`Successfully created zip file with Instagram flyers organized by month!`);
    } catch (err) {
      console.error('Error creating Instagram zip:', err);
      alert('Error creating Instagram zip file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllFacebook = async () => {
    if (shows.length === 0) {
      alert('Please load shows data first');
      return;
    }
    
    setLoading(true);
    try {
      await FlyerGenerator.exportAllFlyers(shows, 'facebook');
      alert(`Successfully created zip file with Facebook flyers organized by month!`);
    } catch (err) {
      console.error('Error creating Facebook zip:', err);
      alert('Error creating Facebook zip file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load shows when component mounts
  useEffect(() => {
    loadShows();
  }, []);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Header />
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <Card className="mb-4">
              <div className="text-center">
                <h1 className="display-4 mb-3">
                  <i className="fas fa-music me-3 text-primary"></i>
                  Show Flyer Generator
                </h1>
                <p className="lead text-muted">
                  Generate professional flyers for all your shows using your custom template
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <Card>
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-cogs me-2"></i>
                  Controls
                </h5>
                <div className="d-grid d-md-flex gap-2">
                  <Button 
                    onClick={loadShows} 
                    disabled={loading}
                    variant="primary"
                    size="lg"
                  >
                    <i className="fas fa-upload me-2"></i>
                    {loading ? 'Loading...' : 'Load Shows from CSV'}
                  </Button>
                  <Button 
                    onClick={handleExportAllInstagram}
                    disabled={loading || shows.length === 0}
                    variant="success"
                    size="lg"
                  >
                    <i className="fab fa-instagram me-2"></i>
                    Export All Instagram
                  </Button>
                  <Button 
                    onClick={handleExportAllFacebook}
                    disabled={loading || shows.length === 0}
                    variant="info"
                    size="lg"
                  >
                    <i className="fab fa-facebook me-2"></i>
                    Export All Facebook
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {loading && (
          <div className="row">
            <div className="col-12">
              <Card>
                <div className="card-body text-center">
                  <Spinner size="lg" className="mb-3" />
                  <h3>Generating flyers...</h3>
                  <p className="text-muted">Please wait while we process your shows data.</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {error && (
          <div className="row">
            <div className="col-12">
              <Alert variant="danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Error loading shows data:</strong> {error}
                <br />
                Make sure shows.csv is in the same directory as this HTML file.
              </Alert>
            </div>
          </div>
        )}

        <div className="row">
          {flyerElements.map((flyerData, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
              <Card className="h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    {flyerData.venueName}
                  </h5>
                  <small className="text-muted">
                    <i className="fas fa-calendar me-1"></i>
                    {flyerData.date}
                  </small>
                </div>
                <div className="card-body p-2">
                  <FlyerPreview data={flyerData} id={index.toString()} />
                </div>
                <div className="card-footer">
                  <div className="d-grid gap-2 d-md-flex">
                    <ExportButton
                      platform="instagram"
                      onExport={(options) => handleExportFlyer(index, options)}
                      disabled={loading}
                    >
                      <i className="fab fa-instagram me-1"></i>
                      Instagram
                    </ExportButton>
                    <ExportButton
                      platform="facebook"
                      onExport={(options) => handleExportFlyer(index, options)}
                      disabled={loading}
                    >
                      <i className="fab fa-facebook me-1"></i>
                      Facebook
                    </ExportButton>
                  </div>
                </div>
              </Card>
            </div>
          ))}
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
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;