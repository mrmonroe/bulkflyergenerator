import React, { useState, useEffect } from 'react';
import { showsAPI } from '../services/api';
import { Show, ShowCreate, LegacyShow } from '../types';
import { Card, Button, Spinner, Alert, Modal } from './bootstrap';
import ShowForm from './ShowForm';
import CSVUpload from './CSVUpload';
import { convertLegacyShowToFlyerData } from '../utils/flyerUtils';

const MyShows: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToDelete, setShowToDelete] = useState<Show | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await showsAPI.getShows();
      setShows(response.shows);
    } catch (err) {
      console.error('Failed to load shows:', err);
      setError('Failed to load shows. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (show: Show) => {
    setShowToDelete(show);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!showToDelete) return;

    try {
      setDeleting(true);
      await showsAPI.deleteShow(showToDelete.id);
      await loadShows(); // Reload the shows list
      setShowDeleteModal(false);
      setShowToDelete(null);
    } catch (err) {
      console.error('Failed to delete show:', err);
      setError('Failed to delete show. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setShowToDelete(null);
  };

  const handleAddShow = () => {
    setEditingShow(null);
    setShowFormModal(true);
  };

  const handleEditShow = (show: Show) => {
    setEditingShow(show);
    setShowFormModal(true);
  };

  const handleSaveShow = async (showData: ShowCreate) => {
    try {
      setSaving(true);
      setError(null);

      if (editingShow) {
        // Update existing show
        await showsAPI.updateShow(editingShow.id, showData);
      } else {
        // Create new show
        await showsAPI.createShow(showData);
      }

      await loadShows(); // Reload the shows list
      setShowFormModal(false);
      setEditingShow(null);
    } catch (err) {
      console.error('Failed to save show:', err);
      setError(editingShow ? 'Failed to update show. Please try again.' : 'Failed to create show. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCSVUpload = async (legacyShows: LegacyShow[]) => {
    try {
      setUploading(true);
      setError(null);

      // Convert legacy shows to new format
      const showData: ShowCreate[] = legacyShows.map(legacyShow => ({
        date: legacyShow.Date,
        venue_name: legacyShow['Venue Name'],
        venue_address: legacyShow['Venue Address'],
        show_time: legacyShow['Show Time'],
        event_type: 'Live Acoustic Music'
      }));

      await showsAPI.bulkCreateShows(showData);
      await loadShows(); // Reload the shows list
      setShowCSVModal(false);
    } catch (err) {
      console.error('Failed to upload shows:', err);
      setError('Failed to upload shows. Please check your CSV format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateFlyer = (show: Show) => {
    // Convert show to flyer data and generate flyer
    const flyerData = convertLegacyShowToFlyerData({
      Date: show.date,
      'Venue Name': show.venue_name,
      'Venue Address': show.venue_address || '',
      'Show Time': show.show_time || ''
    });
    
    // This would integrate with the existing flyer generation system
    console.log('Generate flyer for:', flyerData);
    // TODO: Implement flyer generation
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Time TBD';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner size="lg" className="mb-3" />
          <h4>Loading your shows...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <Card className="mb-4">
            <div className="text-center">
              <h1 className="display-5 mb-3">
                <i className="fas fa-calendar-alt me-3 text-primary"></i>
                My Shows
              </h1>
              <p className="lead text-muted">Manage all your upcoming and past shows</p>
              <div className="d-flex gap-2 justify-content-center">
                <Button variant="primary" onClick={handleAddShow}>
                  <i className="fas fa-plus me-2"></i>
                  Add Show
                </Button>
                <Button variant="outline-primary" onClick={() => setShowCSVModal(true)}>
                  <i className="fas fa-upload me-2"></i>
                  Upload CSV
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <Alert variant="danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          </div>
        </div>
      )}

      {shows.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <Card>
              <div className="card-body text-center py-5">
                <i className="fas fa-calendar-times fa-4x text-muted mb-4"></i>
                <h4 className="text-muted">No shows found</h4>
                <p className="text-muted mb-4">
                  You haven't added any shows yet. Start by adding your first show!
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Button variant="primary" size="lg" onClick={handleAddShow}>
                    <i className="fas fa-plus me-2"></i>
                    Add Your First Show
                  </Button>
                  <Button variant="outline-primary" size="lg" onClick={() => setShowCSVModal(true)}>
                    <i className="fas fa-upload me-2"></i>
                    Upload from CSV
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="row">
          {shows.map((show) => (
            <div key={show.id} className="col-12 col-md-6 col-lg-4 mb-4">
              <Card className="h-100">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title mb-1">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                        {show.venue_name}
                      </h5>
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(show.date)}
                      </small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(show)}
                      title="Delete show"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">
                      <i className="fas fa-clock me-2"></i>
                      Show Time
                    </h6>
                    <p className="mb-0">{formatTime(show.show_time)}</p>
                  </div>

                  {show.venue_address && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        Address
                      </h6>
                      <p className="mb-0">{show.venue_address}</p>
                    </div>
                  )}

                  {show.city_state && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">
                        <i className="fas fa-city me-2"></i>
                        Location
                      </h6>
                      <p className="mb-0">{show.city_state}</p>
                    </div>
                  )}

                  {show.event_type && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">
                        <i className="fas fa-tag me-2"></i>
                        Event Type
                      </h6>
                      <p className="mb-0">{show.event_type}</p>
                    </div>
                  )}

                  <div className="text-muted">
                    <small>
                      <i className="fas fa-calendar-plus me-1"></i>
                      Added {formatDate(show.created_at)}
                    </small>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="d-grid gap-2 d-md-flex">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleEditShow(show)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleGenerateFlyer(show)}
                    >
                      <i className="fas fa-image me-1"></i>
                      Generate Flyer
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={handleDeleteCancel}
        title="Delete Show"
        centered
      >
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h5>Are you sure you want to delete this show?</h5>
          {showToDelete && (
            <div className="bg-light p-3 rounded mb-3">
              <strong>{showToDelete.venue_name}</strong>
              <br />
              <small className="text-muted">
                {formatDate(showToDelete.date)} at {formatTime(showToDelete.show_time)}
              </small>
            </div>
          )}
          <p className="text-muted">This action cannot be undone.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="secondary"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              loading={deleting}
            >
              <i className="fas fa-trash me-1"></i>
              {deleting ? 'Deleting...' : 'Delete Show'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Show Form Modal */}
      <ShowForm
        show={editingShow}
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingShow(null);
        }}
        onSave={handleSaveShow}
        loading={saving}
      />

      {/* CSV Upload Modal */}
      <CSVUpload
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onUpload={handleCSVUpload}
        loading={uploading}
      />
    </div>
  );
};

export default MyShows;
