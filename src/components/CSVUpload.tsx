import React, { useState, useRef } from 'react';
import { parseCSV } from '../utils/csvParser';
import { LegacyShow } from '../types';
import { Button, Alert, Modal } from './bootstrap';

interface CSVUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (shows: LegacyShow[]) => Promise<void>;
  loading?: boolean;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ isOpen, onClose, onUpload, loading = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<LegacyShow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Parse and preview the CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const shows = parseCSV(csvText);
        setPreview(shows.slice(0, 10)); // Show first 10 rows as preview
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csvText = event.target?.result as string;
          const shows = parseCSV(csvText);
          await onUpload(shows);
          handleClose();
        } catch (err) {
          console.error('Error processing CSV:', err);
          setError('Error processing CSV file. Please try again.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setError('Error uploading CSV file. Please try again.');
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'Date,Venue Name,Venue Address,Show Time\n2024-01-15,The Blue Note,123 Main St,19:30\n2024-01-20,Red Rocks,18300 W Alameda Pkwy,20:00';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shows_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      title="Upload Shows from CSV"
      size="lg"
      centered
    >
      <div>
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <div className="mb-4">
          <h6>CSV Format Requirements</h6>
          <p className="text-muted small mb-3">
            Your CSV file should have the following columns (in any order):
          </p>
          <ul className="small text-muted">
            <li><strong>Date</strong> - Show date in YYYY-MM-DD format</li>
            <li><strong>Venue Name</strong> - Name of the venue (required)</li>
            <li><strong>Venue Address</strong> - Full address of the venue (optional)</li>
            <li><strong>Show Time</strong> - Show time in HH:MM format (optional)</li>
          </ul>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={downloadTemplate}
            disabled={loading || uploading}
          >
            <i className="fas fa-download me-1"></i>
            Download Template
          </Button>
        </div>

        <div className="mb-4">
          <label htmlFor="csvFile" className="form-label">
            <i className="fas fa-file-csv me-2"></i>
            Select CSV File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="csvFile"
            className="form-control"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading || uploading}
          />
          <div className="form-text">
            Maximum file size: 5MB
          </div>
        </div>

        {preview.length > 0 && (
          <div className="mb-4">
            <h6>Preview (first 10 rows)</h6>
            <div className="table-responsive" style={{ maxHeight: '300px' }}>
              <table className="table table-sm table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Venue Name</th>
                    <th>Venue Address</th>
                    <th>Show Time</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((show, index) => (
                    <tr key={index}>
                      <td>{show.Date}</td>
                      <td>{show['Venue Name']}</td>
                      <td>{show['Venue Address']}</td>
                      <td>{show['Show Time']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-muted small">
              {preview.length === 10 ? 'Showing first 10 rows...' : `Showing ${preview.length} rows`}
            </div>
          </div>
        )}

        <div className="d-flex gap-2 justify-content-end">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading || uploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || loading || uploading}
            loading={uploading}
          >
            <i className="fas fa-upload me-1"></i>
            {uploading ? 'Uploading...' : 'Upload Shows'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CSVUpload;
