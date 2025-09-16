import React, { useState } from 'react';
import { Card, Button } from './bootstrap';
import { FlyerTemplate, Show, TEMPLATE_FIELD_TYPES } from '../types';

// Social media preset dimensions
const SOCIAL_MEDIA_PRESETS = [
  { name: 'Custom', width: 0, height: 0 },
  { name: 'Instagram Post (Square)', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Instagram Reel', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Facebook Cover', width: 1200, height: 315 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Pinterest Pin', width: 1000, height: 1500 },
  { name: 'TikTok Video', width: 1080, height: 1920 },
  { name: 'Snapchat Story', width: 1080, height: 1920 }
];

// Common background color presets
const BACKGROUND_COLOR_PRESETS = [
  { name: 'White', color: '#ffffff' },
  { name: 'Light Gray', color: '#f8f9fa' },
  { name: 'Dark Gray', color: '#343a40' },
  { name: 'Black', color: '#000000' },
  { name: 'Blue', color: '#007bff' },
  { name: 'Green', color: '#28a745' },
  { name: 'Red', color: '#dc3545' },
  { name: 'Yellow', color: '#ffc107' },
  { name: 'Purple', color: '#6f42c1' },
  { name: 'Orange', color: '#fd7e14' }
];

interface TemplatePreviewProps {
  template: FlyerTemplate;
  show?: Show;
  onExport?: () => void;
  onEdit?: () => void;
  onSizeChange?: (width: number, height: number) => void;
  onFieldSelect?: (field: any) => void;
  onBackgroundEdit?: () => void;
  onAddField?: (fieldType: string) => void;
  onPresetChange?: (preset: { name: string; width: number; height: number }) => void;
  onBackgroundColorChange?: (color: string) => void;
  onGridToggle?: (enabled: boolean) => void;
  onGridSizeChange?: (size: number) => void;
  onShowGridToggle?: (enabled: boolean) => void;
  showToolbar?: boolean;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template, 
  show, 
  onExport, 
  onEdit, 
  onSizeChange, 
  onFieldSelect, 
  onBackgroundEdit,
  onAddField,
  onPresetChange,
  onBackgroundColorChange,
  onGridToggle,
  onGridSizeChange,
  onShowGridToggle,
  showToolbar = false
}) => {
  // State for dropdowns
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const [showColorsDropdown, setShowColorsDropdown] = useState(false);
  const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
  const [showGridDropdown, setShowGridDropdown] = useState(false);
  const [showDimensionsDropdown, setShowDimensionsDropdown] = useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown')) {
        setShowPresetsDropdown(false);
        setShowColorsDropdown(false);
        setShowFieldsDropdown(false);
        setShowGridDropdown(false);
        setShowDimensionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to get field icons
  const getFieldIcon = (fieldType: string): string => {
    switch (fieldType) {
      case 'venue': return 'building';
      case 'date': return 'calendar';
      case 'time': return 'clock';
      case 'address': return 'map-marker-alt';
      case 'price': return 'dollar-sign';
      case 'description': return 'align-left';
      case 'text': return 'font';
      default: return 'text';
    }
  };

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
        return show?.show_time || previewShow.show_time || '8:00 PM';
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
        <div className="d-flex align-items-center gap-3">
          {showToolbar ? (
            <>
              {/* Social Media Presets */}
              <div className="dropdown">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
                >
                  <i className="fas fa-th me-1"></i>
                  Presets
                </Button>
                {showPresetsDropdown && (
                  <div className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {SOCIAL_MEDIA_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        className="dropdown-item"
                        onClick={() => {
                          if (onPresetChange) {
                            onPresetChange(preset);
                          }
                          setShowPresetsDropdown(false);
                        }}
                      >
                        {preset.name}
                        {preset.width > 0 && (
                          <small className="text-muted ms-2">
                            ({preset.width} × {preset.height})
                          </small>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Background Colors */}
              <div className="dropdown">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowColorsDropdown(!showColorsDropdown)}
                >
                  <i className="fas fa-palette me-1"></i>
                  Colors
                </Button>
                {showColorsDropdown && (
                  <div className="dropdown-menu show p-2" style={{ minWidth: '200px' }}>
                    <div className="row g-1">
                      {BACKGROUND_COLOR_PRESETS.map((colorPreset) => (
                        <div key={colorPreset.name} className="col-6">
                          <button
                            className="btn btn-sm w-100 d-flex align-items-center"
                            style={{ 
                              backgroundColor: colorPreset.color,
                              color: colorPreset.color === '#000000' || colorPreset.color === '#343a40' ? 'white' : 'black',
                              border: '1px solid #dee2e6'
                            }}
                            onClick={() => {
                              if (onBackgroundColorChange) {
                                onBackgroundColorChange(colorPreset.color);
                              }
                              setShowColorsDropdown(false);
                            }}
                          >
                            <div
                              className="me-2"
                              style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: colorPreset.color,
                                border: '1px solid #000'
                              }}
                            />
                            {colorPreset.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Field Types */}
              <div className="dropdown">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowFieldsDropdown(!showFieldsDropdown)}
                >
                  <i className="fas fa-plus me-1"></i>
                  Add Field
                </Button>
                {showFieldsDropdown && (
                  <div className="dropdown-menu show">
                    {TEMPLATE_FIELD_TYPES.map((fieldConfig) => (
                      <button
                        key={fieldConfig.type}
                        className="dropdown-item"
                        onClick={() => {
                          if (onAddField) {
                            onAddField(fieldConfig.type);
                          }
                          setShowFieldsDropdown(false);
                        }}
                      >
                        <i className={`fas fa-${getFieldIcon(fieldConfig.type)} me-2`}></i>
                        {fieldConfig.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid Controls */}
              <div className="dropdown">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowGridDropdown(!showGridDropdown)}
                >
                  <i className="fas fa-th-large me-1"></i>
                  Grid
                </Button>
                {showGridDropdown && (
                  <div className="dropdown-menu show p-3" style={{ minWidth: '250px' }}>
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="snapToGrid"
                          defaultChecked
                          onChange={(e) => onGridToggle?.(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="snapToGrid">
                          Snap to Grid
                        </label>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="showGrid"
                          defaultChecked
                          onChange={(e) => onShowGridToggle?.(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="showGrid">
                          Show Grid
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="form-label small">Grid Size</label>
                      <input
                        type="range"
                        className="form-range"
                        min="10"
                        max="50"
                        step="5"
                        defaultValue="20"
                        onChange={(e) => onGridSizeChange?.(parseInt(e.target.value))}
                      />
                      <div className="d-flex justify-content-between small text-muted">
                        <span>10px</span>
                        <span>50px</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dimensions */}
              <div className="dropdown">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowDimensionsDropdown(!showDimensionsDropdown)}
                >
                  <i className="fas fa-expand-arrows-alt me-1"></i>
                  Size
                </Button>
                {showDimensionsDropdown && (
                  <div className="dropdown-menu show p-3" style={{ minWidth: '200px' }}>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small">Width</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={template.width}
                          onChange={(e) => {
                            const width = parseInt(e.target.value) || template.width;
                            onSizeChange?.(width, template.height);
                          }}
                          min="100"
                          max="2000"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small">Height</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={template.height}
                          onChange={(e) => {
                            const height = parseInt(e.target.value) || template.height;
                            onSizeChange?.(template.width, height);
                          }}
                          min="100"
                          max="2000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Image */}
              {onBackgroundEdit && (
                <Button 
                  variant={template.background ? "outline-info" : "outline-secondary"} 
                  size="sm" 
                  onClick={onBackgroundEdit}
                  title={template.background ? "Edit Background Image" : "Add Background Image"}
                >
                  <i className="fas fa-image me-1"></i>
                  {template.background ? "Edit BG" : "Add BG"}
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Simple Size Controls for non-toolbar mode */}
              {onSizeChange && (
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center gap-1">
                    <label className="form-label mb-0 small">W:</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '70px' }}
                      value={template.width}
                      onChange={(e) => {
                        const width = parseInt(e.target.value) || template.width;
                        onSizeChange(width, template.height);
                      }}
                      min="100"
                      max="2000"
                    />
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <label className="form-label mb-0 small">H:</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '70px' }}
                      value={template.height}
                      onChange={(e) => {
                        const height = parseInt(e.target.value) || template.height;
                        onSizeChange(template.width, height);
                      }}
                      min="100"
                      max="2000"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
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
      </div>
      <div className="card-body">
        {/* Template Information */}
        <div className="mb-4">
          <h5 className="mb-2">{template.name}</h5>
          {template.description && template.description.trim() && (
            <p className="text-muted mb-0">{template.description}</p>
          )}
        </div>
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
            {/* New Background System */}
            {template.background && (
              <div
                className="position-absolute"
                style={{
                  left: template.background.x,
                  top: template.background.y,
                  width: template.background.width,
                  height: template.background.height,
                  backgroundImage: `url(${template.background.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: template.background.opacity,
                  mixBlendMode: template.background.blendMode,
                  transform: `rotate(${template.background.rotation}deg)`,
                  transformOrigin: 'center',
                  zIndex: 0
                }}
              />
            )}
            {template.fields.map((field) => (
              <div
                key={field.id}
                className={`position-absolute ${onFieldSelect ? 'border border-primary' : ''}`}
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
                  borderColor: onFieldSelect ? '#007bff' : (field.borderColor || 'transparent'),
                  borderWidth: onFieldSelect ? 1 : (field.borderWidth || 0),
                  borderStyle: 'solid',
                  borderRadius: field.borderRadius || 0,
                  padding: field.padding || 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: field.textAlign === 'center' ? 'center' : field.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: onFieldSelect ? 'pointer' : 'default',
                  zIndex: 1
                }}
                onClick={onFieldSelect ? () => onFieldSelect(field) : undefined}
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
            {onFieldSelect && ' • Click fields to edit'}
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
