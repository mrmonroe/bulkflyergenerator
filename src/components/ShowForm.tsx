import React, { useState, useEffect } from 'react';
import { Show, ShowCreate } from '../types';
import { Button, FormGroup, Input, Modal } from './bootstrap';

interface ShowFormProps {
  show?: Show | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (showData: ShowCreate) => Promise<void>;
  loading?: boolean;
}

const ShowForm: React.FC<ShowFormProps> = ({ show, isOpen, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState<ShowCreate>({
    date: '',
    venue_name: '',
    venue_address: '',
    city_state: '',
    show_time: '',
    event_type: 'Live Acoustic Music',
    latitude: undefined,
    longitude: undefined,
    is_public: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (show) {
      setFormData({
        date: show.date.split('T')[0], // Convert to YYYY-MM-DD format
        venue_name: show.venue_name,
        venue_address: show.venue_address || '',
        city_state: show.city_state || '',
        show_time: show.show_time || '',
        event_type: show.event_type || 'Live Acoustic Music',
        latitude: show.latitude,
        longitude: show.longitude,
        is_public: show.is_public || false
      });
    } else {
      setFormData({
        date: '',
        venue_name: '',
        venue_address: '',
        city_state: '',
        show_time: '',
        event_type: 'Live Acoustic Music',
        latitude: undefined,
        longitude: undefined,
        is_public: false
      });
    }
    setErrors({});
  }, [show, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev: ShowCreate) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value ? parseFloat(value) : undefined) : value)
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    } else {
      const date = new Date(formData.date);
      if (isNaN(date.getTime())) {
        newErrors.date = 'Please enter a valid date';
      }
    }

    if (!formData.venue_name.trim()) {
      newErrors.venue_name = 'Venue name is required';
    }

    if (formData.show_time && formData.show_time.trim()) {
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.show_time)) {
        newErrors.show_time = 'Please enter time in HH:MM format (24-hour)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving show:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      date: '',
      venue_name: '',
      venue_address: '',
      city_state: '',
      show_time: '',
      event_type: 'Live Acoustic Music',
      latitude: undefined,
      longitude: undefined,
      is_public: false
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      title={show ? 'Edit Show' : 'Add New Show'}
      size="lg"
      centered
    >
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <FormGroup
              label="Date"
              htmlFor="date"
              required
              error={errors.date}
            >
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={loading}
                className={errors.date ? 'is-invalid' : ''}
              />
            </FormGroup>
          </div>
          <div className="col-md-6">
            <FormGroup
              label="Show Time"
              htmlFor="show_time"
              error={errors.show_time}
            >
              <Input
                type="time"
                id="show_time"
                name="show_time"
                value={formData.show_time}
                onChange={handleChange}
                disabled={loading}
                className={errors.show_time ? 'is-invalid' : ''}
                helperText="Enter time in 24-hour format (e.g., 19:30)"
              />
            </FormGroup>
          </div>
        </div>

        <FormGroup
          label="Venue Name"
          htmlFor="venue_name"
          required
          error={errors.venue_name}
        >
          <Input
            type="text"
            id="venue_name"
            name="venue_name"
            value={formData.venue_name}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter venue name"
            className={errors.venue_name ? 'is-invalid' : ''}
          />
        </FormGroup>

        <div className="row">
          <div className="col-md-8">
            <FormGroup
              label="Venue Address"
              htmlFor="venue_address"
            >
              <Input
                type="text"
                id="venue_address"
                name="venue_address"
                value={formData.venue_address}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter full venue address"
              />
            </FormGroup>
          </div>
          <div className="col-md-4">
            <FormGroup
              label="City, State"
              htmlFor="city_state"
            >
              <Input
                type="text"
                id="city_state"
                name="city_state"
                value={formData.city_state}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Austin, TX"
              />
            </FormGroup>
          </div>
        </div>

        <FormGroup
          label="Event Type"
          htmlFor="event_type"
        >
          <select
            id="event_type"
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
            disabled={loading}
            className="form-select"
          >
            <option value="Live Acoustic Music">Live Acoustic Music</option>
            <option value="Concert">Concert</option>
            <option value="Festival">Festival</option>
            <option value="Private Event">Private Event</option>
            <option value="Open Mic">Open Mic</option>
            <option value="Other">Other</option>
          </select>
        </FormGroup>

        <div className="row">
          <div className="col-md-6">
            <FormGroup
              label="Latitude"
              htmlFor="latitude"
            >
              <Input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude || ''}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., 30.2672"
                step="any"
                min="-90"
                max="90"
                helperText="Optional: GPS latitude coordinate"
              />
            </FormGroup>
          </div>
          <div className="col-md-6">
            <FormGroup
              label="Longitude"
              htmlFor="longitude"
            >
              <Input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude || ''}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., -97.7431"
                step="any"
                min="-180"
                max="180"
                helperText="Optional: GPS longitude coordinate"
              />
            </FormGroup>
          </div>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={formData.is_public || false}
            onChange={handleChange}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="is_public">
            <strong>Make this show public</strong>
            <br />
            <small className="text-muted">
              Public shows will be visible to everyone on the public shows page and can be found by location.
            </small>
          </label>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
          >
            <i className="fas fa-save me-1"></i>
            {show ? 'Update Show' : 'Add Show'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ShowForm;
