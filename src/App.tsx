import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import UserProfile from './components/UserProfile';
import { Show, FlyerData, ExportOptions } from './types';
import { convertShowToFlyerData } from './utils/flyerUtils';
import { loadShowsFromCSV } from './utils/csvParser';
import { FlyerGenerator } from './services/flyerGenerator';
import FlyerPreview from './components/FlyerPreview';
import ExportButton from './components/ExportButton';
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
    <div className="app">
      <Header />
      <div className="container">
        <div className="main-header">
          <h1>Show Flyer Generator</h1>
          <p>Generate professional flyers for all your shows using your custom template</p>
        </div>

        <div className="controls">
          <button className="btn" onClick={loadShows} disabled={loading}>
            {loading ? 'Loading...' : 'Load Shows from CSV'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleExportAllInstagram}
            disabled={loading || shows.length === 0}
          >
            Export All Instagram (ZIP with Monthly Folders)
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleExportAllFacebook}
            disabled={loading || shows.length === 0}
          >
            Export All Facebook (ZIP with Monthly Folders)
          </button>
        </div>

        {loading && (
          <div className="loading">
            <h3>Generating flyers...</h3>
            <p>Please wait while we process your shows data.</p>
          </div>
        )}

        {error && (
          <div className="error">
            <strong>Error loading shows data:</strong> {error}
            <br /><br />
            Make sure shows.csv is in the same directory as this HTML file.
          </div>
        )}

        <div className="flyers-grid">
          {flyerElements.map((flyerData, index) => (
            <div key={index} className="flyer-item">
              <h3>{flyerData.venueName} - {flyerData.date}</h3>
              <FlyerPreview data={flyerData} id={index.toString()} />
              
              <div className="export-buttons">
                <ExportButton
                  platform="instagram"
                  onExport={(options) => handleExportFlyer(index, options)}
                  disabled={loading}
                >
                  Instagram
                </ExportButton>
                <ExportButton
                  platform="facebook"
                  onExport={(options) => handleExportFlyer(index, options)}
                  disabled={loading}
                >
                  Facebook
                </ExportButton>
              </div>
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
          <Route path="/login" element={<div>Login Page (to be implemented)</div>} />
          <Route path="/register" element={<div>Register Page (to be implemented)</div>} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="app">
                <Header />
                <div className="container">
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