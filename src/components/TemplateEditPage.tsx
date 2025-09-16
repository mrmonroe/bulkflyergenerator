import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Modal } from './bootstrap';
import FieldEditor from './FieldEditor';
import TemplatePreview from './TemplatePreview';
import BackgroundImageEditor from './BackgroundImageEditor';
import { FlyerTemplate, TemplateField, TEMPLATE_FIELD_TYPES, BackgroundImage } from '../types';

const TemplateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FlyerTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);

  // Load template on component mount
  useEffect(() => {
    loadTemplate();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTemplate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (id === 'new') {
        // Create new template - no need to load from database
        const newTemplate: FlyerTemplate = {
          id: Date.now().toString(),
          name: 'New Template',
          description: '',
          userId: 1, // TODO: Get from auth context
          width: 800,
          height: 600,
          fields: [],
          background: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setTemplate(newTemplate);
        setLoading(false);
        return;
      }

      // Load existing template from database
      // TODO: Replace with actual API call
      const mockTemplates: FlyerTemplate[] = [
        {
          id: '1',
          name: 'Default Template',
          description: 'A simple default template',
          userId: 1,
          width: 800,
          height: 600,
          fields: [
            {
              id: 'venue-1',
              type: 'venue',
              label: 'Venue Name',
              x: 50,
              y: 50,
              width: 300,
              height: 40,
              fontSize: 24,
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              textAlign: 'left',
              isRequired: true
            },
            {
              id: 'date-1',
              type: 'date',
              label: 'Date',
              x: 50,
              y: 100,
              width: 200,
              height: 30,
              fontSize: 18,
              fontWeight: 'normal',
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              textAlign: 'left',
              isRequired: true
            }
          ],
          background: undefined,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const foundTemplate = mockTemplates.find(t => t.id === id);
      if (foundTemplate) {
        setTemplate(foundTemplate);
      } else {
        setError('Template not found');
      }
    } catch (err) {
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (updates: Partial<FlyerTemplate>) => {
    setTemplate(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleAddField = (fieldType: TemplateField['type']) => {
    if (!template) return;

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

    setTemplate(prev => prev ? {
      ...prev,
      fields: [...prev.fields, newField]
    } : null);
  };


  const handleFieldDelete = (fieldId: string) => {
    setTemplate(prev => prev ? ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }) : null);
  };

  const handleFieldSelect = (field: TemplateField) => {
    setSelectedField(field);
    setShowFieldEditor(true);
  };

  const handleFieldSave = (updatedField: TemplateField) => {
    setTemplate(prev => prev ? ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === updatedField.id ? updatedField : field
      )
    }) : null);
    setShowFieldEditor(false);
    setSelectedField(null);
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      console.log('Saving template:', template);
      
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

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleBackgroundSave = (background: BackgroundImage) => {
    setTemplate(prev => prev ? {
      ...prev,
      background
    } : null);
    setShowBackgroundEditor(false);
  };

  const handleBackgroundRemove = () => {
    setTemplate(prev => prev ? {
      ...prev,
      background: undefined
    } : null);
    setShowBackgroundEditor(false);
  };


  if (loading) {
    return (
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container-fluid py-4">
          <div className="text-center py-5">
            <Spinner size="lg" />
            <p className="mt-3">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <Card>
                <div className="card-body text-center py-5">
                  <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                  <h4>Error</h4>
                  <p className="text-muted">{error}</p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="primary" onClick={() => navigate('/templates')}>
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Templates
                    </Button>
                    {id === 'new' && (
                      <Button variant="outline-primary" onClick={() => window.location.reload()}>
                        <i className="fas fa-refresh me-2"></i>
                        Try Again
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container-fluid py-4">
          <div className="text-center py-5">
            <Spinner size="lg" />
            <p className="mt-3">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log template state
  console.log('Template state:', template);
  console.log('Background property:', template.background);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="fas fa-edit me-2"></i>
                  {id === 'new' ? 'Create Template' : 'Edit Template'}
                </h2>
                <p className="text-muted mb-0">
                  {id === 'new' ? 'Design a new flyer template' : `Editing: ${template.name}`}
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => navigate('/templates')}>
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Templates
                </Button>
                <Button variant="outline-info" onClick={handlePreview}>
                  <i className="fas fa-eye me-2"></i>
                  Preview
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
          <div className="col-md-4">
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
                    value={template.description || ''}
                    onChange={(e) => handleTemplateChange({ description: e.target.value })}
                  />
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="form-label">Width (px)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={template.width}
                      onChange={(e) => handleTemplateChange({ width: parseInt(e.target.value) || 800 })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Height (px)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={template.height}
                      onChange={(e) => handleTemplateChange({ height: parseInt(e.target.value) || 600 })}
                    />
                  </div>
                </div>
              </div>
            </Card>


            {/* Add Field Buttons */}
            <Card className="mt-3">
              <div className="card-header">
                <h6 className="card-title mb-0">Add Fields</h6>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  {TEMPLATE_FIELD_TYPES.map((fieldType) => (
                    <Button
                      key={fieldType.type}
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleAddField(fieldType.type)}
                    >
                      <i className="fas fa-plus me-1"></i>
                      {fieldType.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Template Preview */}
          <div className="col-md-8">
            <TemplatePreview
              template={template}
              onSizeChange={(width, height) => {
                handleTemplateChange({ width, height });
              }}
              onFieldSelect={handleFieldSelect}
              onBackgroundEdit={() => setShowBackgroundEditor(true)}
            />
          </div>
        </div>

        {/* Field Editor Modal */}
        {showFieldEditor && selectedField && (
          <Modal 
            show={true} 
            onHide={() => setShowFieldEditor(false)} 
            size="lg"
            title={`Edit Field: ${selectedField.label}`}
          >
            <FieldEditor
              field={selectedField}
              onSave={handleFieldSave}
              onCancel={() => setShowFieldEditor(false)}
              onDelete={() => {
                handleFieldDelete(selectedField.id);
                setShowFieldEditor(false);
                setSelectedField(null);
              }}
            />
          </Modal>
        )}

        {/* Template Preview Modal */}
        {showPreview && (
          <Modal 
            show={true} 
            onHide={() => setShowPreview(false)} 
            size="lg"
            title={`Template Preview: ${template.name}`}
          >
            <TemplatePreview
              template={template}
              onEdit={() => {
                setShowPreview(false);
                // Already in edit mode, no need to navigate
              }}
              onSizeChange={(width, height) => {
                handleTemplateChange({ width, height });
              }}
              onBackgroundEdit={() => {
                setShowPreview(false);
                setShowBackgroundEditor(true);
              }}
            />
          </Modal>
        )}

        {/* Background Image Editor Modal */}
        {showBackgroundEditor && template && (
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
    </div>
  );
};

export default TemplateEditPage;
