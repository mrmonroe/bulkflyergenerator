import React from 'react';
import { ExportOptions } from '../types';
import './ExportButton.css';

interface ExportButtonProps {
  platform: 'instagram' | 'facebook' | 'custom';
  onExport: (options: ExportOptions) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  platform, 
  onExport, 
  disabled = false, 
  children 
}) => {
  const getExportOptions = (): ExportOptions => {
    switch (platform) {
      case 'instagram':
        return { width: 1080, height: 1080, platform: 'instagram' };
      case 'facebook':
        return { width: 1200, height: 630, platform: 'facebook' };
      case 'custom':
        return { width: 1080, height: 1080, platform: 'custom' };
      default:
        return { width: 1080, height: 1080, platform: 'instagram' };
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onExport(getExportOptions());
    }
  };

  return (
    <button 
      className={`export-btn ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ExportButton;
