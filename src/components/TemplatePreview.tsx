import React from 'react';
import { Card, Button } from './bootstrap';
import { FlyerTemplate, Show } from '../types';

interface TemplatePreviewProps {
  template: FlyerTemplate;
  show?: Show;
  onExport?: () => void;
  onEdit?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, show, onExport, onEdit }) => {
  // Mock show data for preview if no show is provided
  const previewShow: Show = show || {
    id: 1,
    user_id: 1,
    date: '2024-01-15',
    venue_name: 'The Blue Note',
    venue_address: '123 Music Street',
    city_state: 'New York, NY',
    show_time: '8:00 PM',
    event_type: 'Concert',
    latitude: 40.7589,
    longitude: -73.9851,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const getFieldValue = (field: any): string => {
    switch (field.type) {
      case 'venue':
        return show?.venue_name || previewShow.venue_name;
      case 'date':
        return show?.date ? new Date(show.date).toLocaleDateString() : new Date(previewShow.date).toLocaleDateString();
      case 'time':
        return show?.show_time || previewShow.show_time;
      case 'address':
        return show?.venue_address || previewShow.venue_address || '';
      case 'price':
        return '$25'; // Mock price
      case 'description':
        return show?.event_type || previewShow.event_type || 'Live Music Event';
      case 'text':
        return field.placeholder || field.label;
      default:
        return field.placeholder || field.label;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">
          <i className="fas fa-eye me-2"></i>
          Template Preview
        </h6>
        <div className="d-flex gap-2">
          {onEdit && (
            <Button variant="outline-secondary" size="sm" onClick={onEdit}>
              <i className="fas fa-edit me-1"></i>
              Edit
            </Button>
          )}
          {onExport && (
            <Button variant="primary" size="sm" onClick={onExport}>
              <i className="fas fa-download me-1"></i>
              Export
            </Button>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-center">
          <div
            className="position-relative border"
            style={{
              width: Math.min(template.width, 400),
              height: Math.min(template.height, 300),
              backgroundColor: '#f8f9fa',
              backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {template.fields.map((field) => (
              <div
                key={field.id}
                className="position-absolute"
                style={{
                  left: field.x,
                  top: field.y,
                  width: field.width,
                  height: field.height,
                  fontSize: field.fontSize,
                  fontWeight: field.fontWeight,
                  fontFamily: field.fontFamily,
                  color: field.color,
                  textAlign: field.textAlign,
                  backgroundColor: field.backgroundColor || 'transparent',
                  borderColor: field.borderColor || 'transparent',
                  borderWidth: field.borderWidth || 0,
                  borderStyle: 'solid',
                  borderRadius: field.borderRadius || 0,
                  padding: field.padding || 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: field.textAlign === 'center' ? 'center' : field.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {field.showLabel && (
                  <span className="me-2" style={{ fontSize: field.fontSize * 0.8, opacity: 0.7 }}>
                    {field.label}:
                  </span>
                )}
                <span>
                  {field.type === 'date' ? formatDate(getFieldValue(field)) : getFieldValue(field)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <small className="text-muted">
            {template.width} × {template.height}px
            {show ? ' • Live Preview' : ' • Sample Data'}
          </small>
        </div>

        {/* Field List */}
        {template.fields.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Template Fields</h6>
            <div className="row">
              {template.fields.map((field) => (
                <div key={field.id} className="col-md-6 mb-2">
                  <div className="d-flex align-items-center">
                    <div
                      className="me-2"
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: field.color,
                        border: `1px solid ${field.borderColor || 'transparent'}`,
                        borderRadius: field.borderRadius || 0
                      }}
                    />
                    <div className="flex-grow-1">
                      <small className="fw-bold">{field.label}</small>
                      <br />
                      <small className="text-muted">
                        {field.type} • {field.fontSize}px • {field.fontWeight}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TemplatePreview;
