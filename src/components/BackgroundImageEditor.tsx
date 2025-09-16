import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Modal } from './bootstrap';
import { BackgroundImage } from '../types';

interface BackgroundImageEditorProps {
  background: BackgroundImage | null;
  templateWidth: number;
  templateHeight: number;
  onSave: (background: BackgroundImage) => void;
  onCancel: () => void;
  onRemove: () => void;
}

const BackgroundImageEditor: React.FC<BackgroundImageEditorProps> = ({
  background,
  templateWidth,
  templateHeight,
  onSave,
  onCancel,
  onRemove
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);

  const [currentBackground, setCurrentBackground] = useState<BackgroundImage>(
    background || {
      url: '',
      x: 0,
      y: 0,
      width: templateWidth,
      height: templateHeight,
      scale: 1,
      rotation: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 100,
      cropHeight: 100,
      opacity: 1,
      blendMode: 'normal'
    }
  );

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Convert CSS blend mode to Canvas composite operation
  const getCanvasCompositeOperation = (blendMode: BackgroundImage['blendMode']): GlobalCompositeOperation => {
    switch (blendMode) {
      case 'normal': return 'source-over';
      case 'multiply': return 'multiply';
      case 'overlay': return 'overlay';
      case 'screen': return 'screen';
      case 'soft-light': return 'soft-light';
      case 'hard-light': return 'hard-light';
      default: return 'source-over';
    }
  };

  // Load image when URL changes
  useEffect(() => {
    if (currentBackground.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setOriginalImage(img);
        // Initialize crop dimensions to full image
        if (!background) {
          setCurrentBackground(prev => ({
            ...prev,
            cropWidth: img.width,
            cropHeight: img.height
          }));
        }
      };
      img.src = currentBackground.url;
    }
  }, [currentBackground.url, background]);

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scale to fit image in canvas while maintaining aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = originalImage.width / originalImage.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      // Image is wider than canvas
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      // Image is taller than canvas
      drawHeight = canvas.height;
      drawWidth = canvas.height * imageAspect;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw full background image scaled to fit canvas
    ctx.drawImage(originalImage, drawX, drawY, drawWidth, drawHeight);

    // Calculate template overlay position and size
    const templateScaleX = drawWidth / originalImage.width;
    const templateScaleY = drawHeight / originalImage.height;
    const templateOverlayX = drawX + (currentBackground.x * templateScaleX);
    const templateOverlayY = drawY + (currentBackground.y * templateScaleY);
    const templateOverlayWidth = currentBackground.width * templateScaleX;
    const templateOverlayHeight = currentBackground.height * templateScaleY;

    // Draw template overlay (semi-transparent rectangle)
    ctx.fillStyle = 'rgba(0, 123, 255, 0.2)';
    ctx.fillRect(templateOverlayX, templateOverlayY, templateOverlayWidth, templateOverlayHeight);

    // Draw template border
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.strokeRect(templateOverlayX, templateOverlayY, templateOverlayWidth, templateOverlayHeight);

    // Draw template dimensions text
    ctx.fillStyle = '#007bff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${templateWidth} × ${templateHeight}px`,
      templateOverlayX + templateOverlayWidth / 2,
      templateOverlayY - 10
    );

    // Draw crop overlay if in crop mode
    if (cropMode && isCropping) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        Math.min(cropStart.x, cropEnd.x),
        Math.min(cropStart.y, cropEnd.y),
        Math.abs(cropEnd.x - cropStart.x),
        Math.abs(cropEnd.y - cropStart.y)
      );
      ctx.setLineDash([]);
    }
  }, [currentBackground, originalImage, cropMode, isCropping, cropStart, cropEnd, templateWidth, templateHeight]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Initialize background to cover the template area
        const imageAspect = img.width / img.height;
        const templateAspect = templateWidth / templateHeight;
        
        let bgWidth: number, bgHeight: number, bgX: number, bgY: number;
        
        if (imageAspect > templateAspect) {
          // Image is wider - fit height
          bgHeight = img.height;
          bgWidth = img.height * templateAspect;
          bgX = (img.width - bgWidth) / 2;
          bgY = 0;
        } else {
          // Image is taller - fit width
          bgWidth = img.width;
          bgHeight = img.width / templateAspect;
          bgX = 0;
          bgY = (img.height - bgHeight) / 2;
        }
        
        setCurrentBackground(prev => ({
          ...prev,
          url,
          file,
          x: bgX,
          y: bgY,
          width: bgWidth,
          height: bgHeight,
          scale: 1,
          rotation: 0,
          cropX: (bgX / img.width) * 100,
          cropY: (bgY / img.height) * 100,
          cropWidth: (bgWidth / img.width) * 100,
          cropHeight: (bgHeight / img.height) * 100,
          opacity: 1
        }));
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Convert mouse position to image coordinates
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = originalImage.width / originalImage.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imageAspect;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    // Convert to image coordinates
    const imageX = ((mouseX - drawX) / drawWidth) * originalImage.width;
    const imageY = ((mouseY - drawY) / drawHeight) * originalImage.height;

    return { x: imageX, y: imageY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!originalImage) return;

    const mousePos = getMousePos(e);
    const { x, y } = mousePos;

    if (cropMode) {
      setIsCropping(true);
      setCropStart({ x, y });
      setCropEnd({ x, y });
      return;
    }

    // Check if clicking on template overlay area
    if (x >= currentBackground.x && x <= currentBackground.x + currentBackground.width &&
        y >= currentBackground.y && y <= currentBackground.y + currentBackground.height) {
      
      // Check if clicking on resize handles
      const handleSize = 20; // Larger handle for easier clicking
      const right = currentBackground.x + currentBackground.width;
      const bottom = currentBackground.y + currentBackground.height;

      if (x >= right - handleSize && y >= bottom - handleSize) {
        setIsResizing(true);
        setResizeHandle('se'); // southeast
      } else {
        setIsDragging(true);
        setDragStart({
          x: x - currentBackground.x,
          y: y - currentBackground.y
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!originalImage) return;

    const mousePos = getMousePos(e);
    const { x, y } = mousePos;

    if (cropMode && isCropping) {
      setCropEnd({ x, y });
    } else if (isDragging) {
      setCurrentBackground(prev => ({
        ...prev,
        x: Math.max(0, Math.min(originalImage.width - prev.width, x - dragStart.x)),
        y: Math.max(0, Math.min(originalImage.height - prev.height, y - dragStart.y))
      }));
    } else if (isResizing && resizeHandle === 'se') {
      const newWidth = Math.max(50, Math.min(originalImage.width - currentBackground.x, x - currentBackground.x));
      const newHeight = Math.max(50, Math.min(originalImage.height - currentBackground.y, y - currentBackground.y));
      
      setCurrentBackground(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }));
    }
  };

  const handleMouseUp = () => {
    if (cropMode && isCropping) {
      // Apply crop
      const cropX = Math.min(cropStart.x, cropEnd.x);
      const cropY = Math.min(cropStart.y, cropEnd.y);
      const cropWidth = Math.abs(cropEnd.x - cropStart.x);
      const cropHeight = Math.abs(cropEnd.y - cropStart.y);

      if (cropWidth > 10 && cropHeight > 10 && originalImage) {
        setCurrentBackground(prev => ({
          ...prev,
          cropX: (cropX / originalImage.width) * 100,
          cropY: (cropY / originalImage.height) * 100,
          cropWidth: (cropWidth / originalImage.width) * 100,
          cropHeight: (cropHeight / originalImage.height) * 100
        }));
      }
    }

    setIsDragging(false);
    setIsResizing(false);
    setIsCropping(false);
    setResizeHandle(null);
  };

  const handleSave = () => {
    onSave(currentBackground);
  };

  return (
    <Modal show={true} onHide={onCancel} size="xl" title="Background Image Editor">
      <div className="row">
        <div className="col-md-8">
          <Card>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Image Preview</h6>
              <div className="btn-group" role="group">
                <Button
                  variant={cropMode ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setCropMode(!cropMode)}
                >
                  <i className="fas fa-crop me-1"></i>
                  Crop
                </Button>
              </div>
            </div>
            <div className="card-body p-2">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  height: 'auto',
                  border: '1px solid #dee2e6',
                  cursor: cropMode ? 'crosshair' : (isDragging ? 'grabbing' : 'grab')
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="mt-2 text-center">
                <small className="text-muted">
                  {cropMode ? 'Click and drag to select crop area' : 'Click and drag to move, drag corner to resize'}
                </small>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-md-4">
          <Card>
            <div className="card-header">
              <h6 className="mb-0">Image Settings</h6>
            </div>
            <div className="card-body">
              {/* File Upload */}
              <div className="mb-3">
                <label className="form-label">Background Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Position */}
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">X Position</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Math.round(currentBackground.x)}
                    onChange={(e) => setCurrentBackground(prev => ({
                      ...prev,
                      x: Math.max(0, Math.min(templateWidth - prev.width, parseInt(e.target.value) || 0))
                    }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Y Position</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Math.round(currentBackground.y)}
                    onChange={(e) => setCurrentBackground(prev => ({
                      ...prev,
                      y: Math.max(0, Math.min(templateHeight - prev.height, parseInt(e.target.value) || 0))
                    }))}
                  />
                </div>
              </div>

              {/* Size */}
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">Width</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Math.round(currentBackground.width)}
                    onChange={(e) => setCurrentBackground(prev => ({
                      ...prev,
                      width: Math.max(50, Math.min(templateWidth - prev.x, parseInt(e.target.value) || 50))
                    }))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Height</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Math.round(currentBackground.height)}
                    onChange={(e) => setCurrentBackground(prev => ({
                      ...prev,
                      height: Math.max(50, Math.min(templateHeight - prev.y, parseInt(e.target.value) || 50))
                    }))}
                  />
                </div>
              </div>

              {/* Opacity */}
              <div className="mb-3">
                <label className="form-label">Opacity: {Math.round(currentBackground.opacity * 100)}%</label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={currentBackground.opacity}
                  onChange={(e) => setCurrentBackground(prev => ({
                    ...prev,
                    opacity: parseFloat(e.target.value)
                  }))}
                />
              </div>

              {/* Rotation */}
              <div className="mb-3">
                <label className="form-label">Rotation: {currentBackground.rotation}°</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="range"
                    className="form-range flex-grow-1"
                    min="-180"
                    max="180"
                    step="1"
                    value={currentBackground.rotation}
                    onChange={(e) => setCurrentBackground(prev => ({
                      ...prev,
                      rotation: parseInt(e.target.value)
                    }))}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setCurrentBackground(prev => ({
                      ...prev,
                      rotation: 0
                    }))}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Blend Mode */}
              <div className="mb-3">
                <label className="form-label">Blend Mode</label>
                <select
                  className="form-select form-select-sm"
                  value={currentBackground.blendMode}
                  onChange={(e) => setCurrentBackground(prev => ({
                    ...prev,
                    blendMode: e.target.value as BackgroundImage['blendMode']
                  }))}
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="overlay">Overlay</option>
                  <option value="screen">Screen</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="hard-light">Hard Light</option>
                </select>
              </div>

              {/* Crop Settings */}
              {cropMode && (
                <div className="mb-3">
                  <h6 className="small">Crop Settings</h6>
                  <div className="row">
                    <div className="col-6">
                      <label className="form-label small">Crop X: {Math.round(currentBackground.cropX)}%</label>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        value={currentBackground.cropX}
                        onChange={(e) => setCurrentBackground(prev => ({
                          ...prev,
                          cropX: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Crop Y: {Math.round(currentBackground.cropY)}%</label>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        value={currentBackground.cropY}
                        onChange={(e) => setCurrentBackground(prev => ({
                          ...prev,
                          cropY: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <label className="form-label small">Crop Width: {Math.round(currentBackground.cropWidth)}%</label>
                      <input
                        type="range"
                        className="form-range"
                        min="1"
                        max="100"
                        value={currentBackground.cropWidth}
                        onChange={(e) => setCurrentBackground(prev => ({
                          ...prev,
                          cropWidth: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Crop Height: {Math.round(currentBackground.cropHeight)}%</label>
                      <input
                        type="range"
                        className="form-range"
                        min="1"
                        max="100"
                        value={currentBackground.cropHeight}
                        onChange={(e) => setCurrentBackground(prev => ({
                          ...prev,
                          cropHeight: parseInt(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="modal-footer">
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        {background && (
          <Button variant="outline-danger" onClick={onRemove}>
            <i className="fas fa-trash me-1"></i>
            Remove Background
          </Button>
        )}
        <Button variant="primary" onClick={handleSave}>
          <i className="fas fa-save me-1"></i>
          Save Background
        </Button>
      </div>
    </Modal>
  );
};

export default BackgroundImageEditor;
