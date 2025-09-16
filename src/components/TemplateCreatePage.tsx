import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Modal } from './bootstrap';
import Header from './Header';
import TemplatePreview from './TemplatePreview';
import BackgroundImageEditor from './BackgroundImageEditor';
import { FlyerTemplate, TemplateField, TEMPLATE_FIELD_TYPES, BackgroundImage } from '../types';

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

const TemplateCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FlyerTemplate>({
    id: '',
    name: 'New Template',
    description: '',
    userId: 1,
    width: 800,
    height: 600,
    fields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('Custom');
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#f8f9fa');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(20);
  const [showGridDropdown, setShowGridDropdown] = useState<boolean>(false);
  const [showFieldsDropdown, setShowFieldsDropdown] = useState<boolean>(false);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState<boolean>(false);
  const [showColorsDropdown, setShowColorsDropdown] = useState<boolean>(false);
  const [showDimensionsDropdown, setShowDimensionsDropdown] = useState<boolean>(false);
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown')) {
        setShowGridDropdown(false);
        setShowFieldsDropdown(false);
        setShowPresetsDropdown(false);
        setShowColorsDropdown(false);
        setShowDimensionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to snap coordinates to grid
  const snapToGridPosition = (x: number, y: number): { x: number; y: number } => {
    if (!snapToGrid) return { x, y };
    
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    return { x: snappedX, y: snappedY };
  };

  const handleTemplateChange = (updates: Partial<FlyerTemplate>) => {
    setTemplate(prev => {
      const newTemplate = { ...prev, ...updates };
      
      // If width or height is being changed manually, set preset to Custom
      if (updates.width !== undefined || updates.height !== undefined) {
        const matchingPreset = SOCIAL_MEDIA_PRESETS.find(preset => 
          preset.width === newTemplate.width && preset.height === newTemplate.height
        );
        if (matchingPreset) {
          setSelectedPreset(matchingPreset.name);
        } else {
          setSelectedPreset('Custom');
        }
      }
      
      return newTemplate;
    });
  };

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = SOCIAL_MEDIA_PRESETS.find(p => p.name === presetName);
    if (preset && preset.width > 0 && preset.height > 0) {
      setTemplate(prev => ({
        ...prev,
        width: preset.width,
        height: preset.height
      }));
    }
  };

  const handleAddField = (fieldType: TemplateField['type']) => {
    const fieldConfig = TEMPLATE_FIELD_TYPES.find(f => f.type === fieldType);
    if (!fieldConfig) return;

    const newField: TemplateField = {
      id: Date.now().toString(),
      type: fieldType,
      label: fieldConfig.label,
      x: 50,
      y: 50,
      width: fieldConfig.defaultWidth,
      height: fieldConfig.defaultHeight,
      fontSize: fieldConfig.defaultFontSize,
      fontWeight: fieldConfig.defaultFontWeight,
      fontFamily: fieldConfig.defaultFontFamily,
      color: fieldConfig.defaultColor,
      textAlign: 'left',
      placeholder: fieldConfig.placeholder,
      maxLength: fieldConfig.maxLength,
      isRequired: true
    };

    setTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleFieldDelete = (fieldId: string) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
  };

  const handleFieldDrop = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    
    if (draggedField && draggedField !== fieldId) {
      // Swap positions of the dragged field and the target field
      setTemplate(prev => ({
        ...prev,
        fields: prev.fields.map(field => {
          if (field.id === draggedField) {
            const targetField = prev.fields.find(f => f.id === fieldId);
            return targetField ? { ...field, x: targetField.x, y: targetField.y } : field;
          }
          if (field.id === fieldId) {
            const draggedFieldData = prev.fields.find(f => f.id === draggedField);
            return draggedFieldData ? { ...field, x: draggedFieldData.x, y: draggedFieldData.y } : field;
          }
          return field;
        })
      }));
    }
  };

  const handlePreviewDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedField) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const field = template.fields.find(f => f.id === draggedField);
      if (!field) return;
      
      let newX = Math.max(0, Math.min(x - field.width / 2, template.width - field.width));
      let newY = Math.max(0, Math.min(y - field.height / 2, template.height - field.height));
      
      // Apply snap to grid if enabled
      const snapped = snapToGridPosition(newX, newY);
      newX = snapped.x;
      newY = snapped.y;
      
      // Update the dragged field's position
      setTemplate(prev => ({
        ...prev,
        fields: prev.fields.map(field => 
          field.id === draggedField 
            ? { ...field, x: newX, y: newY }
            : field
        )
      }));
    }
  };

  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    const startX = e.clientX;
    const startY = e.clientY;
    const field = template.fields.find(f => f.id === fieldId);
    if (!field) return;

    const startFieldX = field.x;
    const startFieldY = field.y;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newX = Math.max(0, Math.min(startFieldX + deltaX, template.width - field.width));
      let newY = Math.max(0, Math.min(startFieldY + deltaY, template.height - field.height));
      
      // Apply snap to grid if enabled
      const snapped = snapToGridPosition(newX, newY);
      newX = snapped.x;
      newY = snapped.y;
      
      setTemplate(prev => ({
        ...prev,
        fields: prev.fields.map(f => 
          f.id === fieldId 
            ? { ...f, x: newX, y: newY }
            : f
        )
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleBackgroundSave = (background: BackgroundImage) => {
    setTemplate(prev => ({
      ...prev,
      background
    }));
    setShowBackgroundEditor(false);
  };

  const handleBackgroundRemove = () => {
    setTemplate(prev => ({
      ...prev,
      background: undefined
    }));
    setShowBackgroundEditor(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      const templateWithBackground = {
        ...template,
        backgroundColor: backgroundColor
      };
      console.log('Saving template:', templateWithBackground);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to templates list
      navigate('/templates');
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Header />
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="fas fa-plus me-2"></i>
                  Create New Template
                </h2>
                <p className="text-muted mb-0">
                  Design a new flyer template from scratch
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => navigate('/templates')}>
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Templates
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Template
                    </>
                  )}
                </Button>
              </div>
            </div>
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

        <div className="row">
          {/* Template Settings */}
          <div className="col-md-3">
            <Card>
              <div className="card-header">
                <h6 className="card-title mb-0">Template Settings</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Template Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={template.name}
                    onChange={(e) => handleTemplateChange({ name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={template.description}
                    onChange={(e) => handleTemplateChange({ description: e.target.value })}
                  />
                </div>
                <div className="text-center py-4">
                  <i className="fas fa-info-circle fa-2x text-muted mb-3"></i>
                  <h6 className="text-muted">Template Controls</h6>
                  <p className="text-muted small mb-0">
                    Use the toolbar above the preview to access all template controls including presets, colors, dimensions, grid settings, and field types.
                  </p>
                </div>
              </div>
            </Card>

          </div>

          {/* Template Preview */}
          <div className="col-md-9">
            <TemplatePreview
              template={template}
              showToolbar={true}
              onSizeChange={(width, height) => {
                handleTemplateChange({ width, height });
              }}
              onFieldSelect={(field) => {
                // Handle field selection for editing
                console.log('Field selected:', field);
              }}
              onBackgroundEdit={() => setShowBackgroundEditor(true)}
              onAddField={(fieldType) => {
                const fieldConfig = TEMPLATE_FIELD_TYPES.find(config => config.type === fieldType);
                if (fieldConfig) {
                  const newField: TemplateField = {
                    id: `field-${Date.now()}`,
                    type: fieldConfig.type,
                    label: fieldConfig.label,
                    x: 50,
                    y: 50,
                    width: fieldConfig.defaultWidth,
                    height: fieldConfig.defaultHeight,
                    fontSize: fieldConfig.defaultFontSize,
                    fontWeight: fieldConfig.defaultFontWeight,
                    fontFamily: fieldConfig.defaultFontFamily,
                    color: fieldConfig.defaultColor,
                    textAlign: 'left',
                    isRequired: false,
                    showLabel: true,
                    placeholder: fieldConfig.placeholder || `Enter ${fieldConfig.label}`
                  };
                  setTemplate(prev => ({
                    ...prev,
                    fields: [...prev.fields, newField]
                  }));
                }
              }}
              onPresetChange={(preset) => {
                if (preset.width > 0 && preset.height > 0) {
                  handleTemplateChange({ width: preset.width, height: preset.height });
                }
              }}
              onBackgroundColorChange={(color) => {
                setBackgroundColor(color);
              }}
              onGridToggle={(enabled) => {
                setSnapToGrid(enabled);
              }}
              onGridSizeChange={(size) => {
                setGridSize(size);
              }}
              onShowGridToggle={(enabled) => {
                setShowGrid(enabled);
              }}
            />
          </div>
        </div>
      </div>

      {/* Background Image Editor Modal */}
      {showBackgroundEditor && (
        <BackgroundImageEditor
          background={template.background || null}
          templateWidth={template.width}
          templateHeight={template.height}
          onSave={handleBackgroundSave}
          onCancel={() => setShowBackgroundEditor(false)}
          onRemove={handleBackgroundRemove}
        />
      )}
    </div>
  );
};

export default TemplateCreatePage;
