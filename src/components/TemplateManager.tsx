import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Modal } from './bootstrap';
import FieldEditor from './FieldEditor';
import TemplatePreview from './TemplatePreview';
import { FlyerTemplate, TemplateField, TEMPLATE_FIELD_TYPES } from '../types';

interface TemplateManagerProps {
  onTemplateSelect?: (template: FlyerTemplate) => void;
  onTemplateSave?: (template: FlyerTemplate) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onTemplateSelect, onTemplateSave }) => {
  const [templates, setTemplates] = useState<FlyerTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FlyerTemplate | null>(null);
  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
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
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setTemplates(mockTemplates);
    } catch (err) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: FlyerTemplate = {
      id: Date.now().toString(),
      name: 'New Template',
      description: '',
      userId: 1, // TODO: Get from auth context
      width: 800,
      height: 600,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingTemplate(newTemplate);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: FlyerTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleSaveTemplate = (template: FlyerTemplate) => {
    if (editingTemplate) {
      const updatedTemplates = templates.map(t => 
        t.id === template.id ? template : t
      );
      setTemplates(updatedTemplates);
    } else {
      setTemplates([...templates, template]);
    }
    setShowCreateModal(false);
    setEditingTemplate(null);
    onTemplateSave?.(template);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleFieldSelect = (field: TemplateField) => {
    setSelectedField(field);
    setShowFieldEditor(true);
  };

  const handleFieldSave = (updatedField: TemplateField) => {
    if (editingTemplate) {
      const updatedTemplate = {
        ...editingTemplate,
        fields: editingTemplate.fields.map(field =>
          field.id === updatedField.id ? updatedField : field
        )
      };
      setEditingTemplate(updatedTemplate);
    }
    setShowFieldEditor(false);
    setSelectedField(null);
  };

  const handleFieldDelete = (fieldId: string) => {
    if (editingTemplate) {
      const updatedTemplate = {
        ...editingTemplate,
        fields: editingTemplate.fields.filter(field => field.id !== fieldId)
      };
      setEditingTemplate(updatedTemplate);
    }
    setShowFieldEditor(false);
    setSelectedField(null);
  };

  const handlePreview = (template: FlyerTemplate) => {
    setEditingTemplate(template);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner size="lg" />
        <p className="mt-3">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <Card>
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="fas fa-palette me-2"></i>
              Flyer Templates
            </h5>
            <Button variant="primary" onClick={handleCreateTemplate}>
              <i className="fas fa-plus me-2"></i>
              Create Template
            </Button>
          </div>
          <div className="card-body">
            {error && (
              <Alert variant="danger" className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {templates.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-palette fa-3x text-muted mb-3"></i>
                <h5>No Templates Yet</h5>
                <p className="text-muted">Create your first flyer template to get started</p>
                <Button variant="primary" onClick={handleCreateTemplate}>
                  <i className="fas fa-plus me-2"></i>
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="row">
                {templates.map((template) => (
                  <div key={template.id} className="col-md-6 col-lg-4 mb-4">
                    <Card className="h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">{template.name}</h6>
                          {template.isDefault && (
                            <span className="badge bg-primary">Default</span>
                          )}
                        </div>
                        {template.description && (
                          <p className="card-text text-muted small mb-3">
                            {template.description}
                          </p>
                        )}
                        <div className="mb-3">
                          <small className="text-muted">
                            {template.width} × {template.height}px
                          </small>
                          <br />
                          <small className="text-muted">
                            {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                          </small>
                        </div>
                        <div className="d-grid gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onTemplateSelect?.(template)}
                          >
                            <i className="fas fa-magic me-1"></i>
                            Use Template
                          </Button>
                          <div className="btn-group">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handlePreview(template)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            {!template.isDefault && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Template Editor Modal */}
      {showCreateModal && editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
          onFieldSelect={handleFieldSelect}
        />
      )}

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
            onDelete={() => handleFieldDelete(selectedField.id)}
          />
        </Modal>
      )}

      {/* Template Preview Modal */}
      {showPreview && editingTemplate && (
        <Modal 
          show={true} 
          onHide={() => setShowPreview(false)} 
          size="lg"
          title={`Template Preview: ${editingTemplate.name}`}
        >
          <TemplatePreview
            template={editingTemplate}
            onEdit={() => {
              setShowPreview(false);
              handleEditTemplate(editingTemplate);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

// Template Editor Component
interface TemplateEditorProps {
  template: FlyerTemplate;
  onSave: (template: FlyerTemplate) => void;
  onCancel: () => void;
  onFieldSelect: (field: TemplateField) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onCancel, onFieldSelect }) => {
  const [editedTemplate, setEditedTemplate] = useState<FlyerTemplate>(template);
  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);

  const handleTemplateChange = (updates: Partial<FlyerTemplate>) => {
    setEditedTemplate(prev => ({ ...prev, ...updates }));
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

    setEditedTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleFieldChange = (fieldId: string, updates: Partial<TemplateField>) => {
    setEditedTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const handleFieldDelete = (fieldId: string) => {
    setEditedTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleFieldSelect = (field: TemplateField) => {
    onFieldSelect(field);
  };

  const handleFieldSave = (updatedField: TemplateField) => {
    setEditedTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === updatedField.id ? updatedField : field
      )
    }));
    setShowFieldEditor(false);
    setSelectedField(null);
  };

  return (
    <Modal 
      show={true} 
      onHide={onCancel} 
      size="xl"
      title={`${template.id ? 'Edit Template' : 'Create Template'}`}
    >
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
                    value={editedTemplate.name}
                    onChange={(e) => handleTemplateChange({ name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editedTemplate.description || ''}
                    onChange={(e) => handleTemplateChange({ description: e.target.value })}
                  />
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="form-label">Width (px)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editedTemplate.width}
                      onChange={(e) => handleTemplateChange({ width: parseInt(e.target.value) || 800 })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Height (px)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editedTemplate.height}
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
            <Card>
              <div className="card-header">
                <h6 className="card-title mb-0">Template Preview</h6>
              </div>
              <div className="card-body">
                <div
                  className="border position-relative"
                  style={{
                    width: Math.min(editedTemplate.width, 400),
                    height: Math.min(editedTemplate.height, 300),
                    backgroundColor: '#f8f9fa',
                    margin: '0 auto'
                  }}
                >
                  {editedTemplate.fields.map((field) => (
                    <div
                      key={field.id}
                      className="position-absolute border border-primary"
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
                        borderColor: field.borderColor || '#007bff',
                        borderWidth: field.borderWidth || 1,
                        borderRadius: field.borderRadius || 0,
                        padding: field.padding || 5,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: field.textAlign === 'center' ? 'center' : field.textAlign === 'right' ? 'flex-end' : 'flex-start'
                      }}
                      onClick={() => handleFieldSelect(field)}
                    >
                      {field.placeholder || field.label}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Click on fields to edit them
                  </small>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSave(editedTemplate)}>
            <i className="fas fa-save me-2"></i>
            Save Template
          </Button>
        </div>
    </Modal>
  );
};

export default TemplateManager;
