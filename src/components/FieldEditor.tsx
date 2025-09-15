import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert } from './bootstrap';
import { TemplateField, FONT_FAMILIES, FONT_WEIGHTS } from '../types';

interface FieldEditorProps {
  field: TemplateField;
  onSave: (field: TemplateField) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel, onDelete }) => {
  const [editedField, setEditedField] = useState<TemplateField>(field);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditedField(field);
  }, [field]);

  const handleFieldChange = (updates: Partial<TemplateField>) => {
    setEditedField(prev => ({ ...prev, ...updates }));
    // Clear errors when user makes changes
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const validateField = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedField.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (editedField.width <= 0) {
      newErrors.width = 'Width must be greater than 0';
    }

    if (editedField.height <= 0) {
      newErrors.height = 'Height must be greater than 0';
    }

    if (editedField.fontSize <= 0) {
      newErrors.fontSize = 'Font size must be greater than 0';
    }

    if (editedField.x < 0) {
      newErrors.x = 'X position cannot be negative';
    }

    if (editedField.y < 0) {
      newErrors.y = 'Y position cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateField()) {
      onSave(editedField);
    }
  };

  const handleColorChange = (colorType: 'color' | 'backgroundColor' | 'borderColor') => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange({ [colorType]: e.target.value });
  };

  return (
    <Card>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">
          <i className="fas fa-edit me-2"></i>
          Edit Field: {field.label}
        </h6>
        <Button variant="outline-danger" size="sm" onClick={onDelete}>
          <i className="fas fa-trash"></i>
        </Button>
      </div>
      <div className="card-body">
        {Object.keys(errors).length > 0 && (
          <Alert variant="danger" className="mb-3">
            <ul className="mb-0">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="row">
          {/* Basic Properties */}
          <div className="col-md-6">
            <h6 className="mb-3">Basic Properties</h6>
            
            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldLabel">Label *</label>
              <Form.Input
                type="text"
                id="fieldLabel"
                value={editedField.label}
                onChange={(e) => handleFieldChange({ label: e.target.value })}
                isInvalid={!!errors.label}
              />
            </Form.FormGroup>

            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldPlaceholder">Placeholder</label>
              <Form.Input
                type="text"
                id="fieldPlaceholder"
                value={editedField.placeholder || ''}
                onChange={(e) => handleFieldChange({ placeholder: e.target.value })}
              />
            </Form.FormGroup>

            <div className="row">
              <div className="col-6">
                <Form.FormGroup className="mb-3">
                  <label htmlFor="fieldX">X Position *</label>
                  <Form.Input
                    type="number"
                    id="fieldX"
                    value={editedField.x}
                    onChange={(e) => handleFieldChange({ x: parseInt(e.target.value) || 0 })}
                    isInvalid={!!errors.x}
                  />
                </Form.FormGroup>
              </div>
              <div className="col-6">
                <Form.FormGroup className="mb-3">
                  <label htmlFor="fieldY">Y Position *</label>
                  <Form.Input
                    type="number"
                    id="fieldY"
                    value={editedField.y}
                    onChange={(e) => handleFieldChange({ y: parseInt(e.target.value) || 0 })}
                    isInvalid={!!errors.y}
                  />
                </Form.FormGroup>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <Form.FormGroup className="mb-3">
                  <label htmlFor="fieldWidth">Width *</label>
                  <Form.Input
                    type="number"
                    id="fieldWidth"
                    value={editedField.width}
                    onChange={(e) => handleFieldChange({ width: parseInt(e.target.value) || 0 })}
                    isInvalid={!!errors.width}
                  />
                </Form.FormGroup>
              </div>
              <div className="col-6">
                <Form.FormGroup className="mb-3">
                  <label htmlFor="fieldHeight">Height *</label>
                  <Form.Input
                    type="number"
                    id="fieldHeight"
                    value={editedField.height}
                    onChange={(e) => handleFieldChange({ height: parseInt(e.target.value) || 0 })}
                    isInvalid={!!errors.height}
                  />
                </Form.FormGroup>
              </div>
            </div>

            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldTextAlign">Text Alignment</label>
              <Form.Select
                id="fieldTextAlign"
                value={editedField.textAlign}
                onChange={(e) => handleFieldChange({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Form.Select>
            </Form.FormGroup>
          </div>

          {/* Typography */}
          <div className="col-md-6">
            <h6 className="mb-3">Typography</h6>

            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldFontFamily">Font Family</label>
              <Form.Select
                id="fieldFontFamily"
                value={editedField.fontFamily}
                onChange={(e) => handleFieldChange({ fontFamily: e.target.value })}
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Form.Select>
            </Form.FormGroup>

            <div className="row">
              <div className="col-6">
                <Form.FormGroup className="mb-3">
                  <label htmlFor="fieldFontSize">Font Size *</label>
                  <Form.Input
                    type="number"
                    id="fieldFontSize"
                    value={editedField.fontSize}
                    onChange={(e) => handleFieldChange({ fontSize: parseInt(e.target.value) || 0 })}
                    isInvalid={!!errors.fontSize}
                  />
                </Form.FormGroup>
              </div>
              <div className="col-6">
                <Form.FormGroup className="mb-3">
                  <label htmlFor="fieldFontWeight">Font Weight</label>
                  <Form.Select
                    id="fieldFontWeight"
                    value={editedField.fontWeight}
                    onChange={(e) => handleFieldChange({ fontWeight: e.target.value as TemplateField['fontWeight'] })}
                  >
                    {FONT_WEIGHTS.map((weight) => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))}
                  </Form.Select>
                </Form.FormGroup>
              </div>
            </div>

            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldColor">Text Color</label>
              <div className="input-group">
                <Form.Input
                  type="color"
                  id="fieldColor"
                  value={editedField.color}
                  onChange={handleColorChange('color')}
                  className="form-control-color"
                />
                <Form.Input
                  type="text"
                  value={editedField.color}
                  onChange={(e) => handleFieldChange({ color: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </Form.FormGroup>

            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldBackgroundColor">Background Color</label>
              <div className="input-group">
                <Form.Input
                  type="color"
                  id="fieldBackgroundColor"
                  value={editedField.backgroundColor || '#00000000'}
                  onChange={handleColorChange('backgroundColor')}
                  className="form-control-color"
                />
                <Form.Input
                  type="text"
                  value={editedField.backgroundColor || ''}
                  onChange={(e) => handleFieldChange({ backgroundColor: e.target.value || undefined })}
                  placeholder="transparent"
                />
              </div>
            </Form.FormGroup>

            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldBorderColor">Border Color</label>
              <div className="input-group">
                <Form.Input
                  type="color"
                  id="fieldBorderColor"
                  value={editedField.borderColor || '#00000000'}
                  onChange={handleColorChange('borderColor')}
                  className="form-control-color"
                />
                <Form.Input
                  type="text"
                  value={editedField.borderColor || ''}
                  onChange={(e) => handleFieldChange({ borderColor: e.target.value || undefined })}
                  placeholder="transparent"
                />
              </div>
            </Form.FormGroup>
          </div>
        </div>

        {/* Advanced Properties */}
        <div className="row mt-4">
          <div className="col-12">
            <h6 className="mb-3">Advanced Properties</h6>
          </div>
          <div className="col-md-4">
            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldBorderWidth">Border Width</label>
              <Form.Input
                type="number"
                id="fieldBorderWidth"
                value={editedField.borderWidth || 0}
                onChange={(e) => handleFieldChange({ borderWidth: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </Form.FormGroup>
          </div>
          <div className="col-md-4">
            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldBorderRadius">Border Radius</label>
              <Form.Input
                type="number"
                id="fieldBorderRadius"
                value={editedField.borderRadius || 0}
                onChange={(e) => handleFieldChange({ borderRadius: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </Form.FormGroup>
          </div>
          <div className="col-md-4">
            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldPadding">Padding</label>
              <Form.Input
                type="number"
                id="fieldPadding"
                value={editedField.padding || 0}
                onChange={(e) => handleFieldChange({ padding: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </Form.FormGroup>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.FormGroup className="mb-3">
              <label htmlFor="fieldMaxLength">Max Length</label>
              <Form.Input
                type="number"
                id="fieldMaxLength"
                value={editedField.maxLength || ''}
                onChange={(e) => handleFieldChange({ maxLength: parseInt(e.target.value) || undefined })}
                min="1"
              />
            </Form.FormGroup>
          </div>
          <div className="col-md-6">
            <div className="form-check mt-4">
              <Form.Input
                type="checkbox"
                id="fieldShowLabel"
                className="form-check-input"
                checked={editedField.showLabel || false}
                onChange={(e) => handleFieldChange({ showLabel: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="fieldShowLabel">
                Show Label
              </label>
            </div>
            <div className="form-check">
              <Form.Input
                type="checkbox"
                id="fieldIsRequired"
                className="form-check-input"
                checked={editedField.isRequired || false}
                onChange={(e) => handleFieldChange({ isRequired: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="fieldIsRequired">
                Required Field
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <i className="fas fa-save me-2"></i>
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

export default FieldEditor;
