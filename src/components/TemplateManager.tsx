import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner, Modal } from './bootstrap';
import TemplatePreview from './TemplatePreview';
import { FlyerTemplate } from '../types';

interface TemplateManagerProps {
  onTemplateSelect?: (template: FlyerTemplate) => void;
  onTemplateSave?: (template: FlyerTemplate) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onTemplateSelect, onTemplateSave }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<FlyerTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<FlyerTemplate | null>(null);

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
    navigate('/templates/new');
  };

  const handleEditTemplate = (template: FlyerTemplate) => {
    navigate(`/templates/${template.id}/edit`);
  };


  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handlePreview = (template: FlyerTemplate) => {
    setPreviewTemplate(template);
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

      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <Modal 
          show={true} 
          onHide={() => setShowPreview(false)} 
          size="lg"
          title={`Template Preview: ${previewTemplate.name}`}
        >
          <TemplatePreview
            template={previewTemplate}
            onEdit={() => {
              setShowPreview(false);
              handleEditTemplate(previewTemplate);
            }}
          />
        </Modal>
      )}
    </div>
  );
};


export default TemplateManager;
