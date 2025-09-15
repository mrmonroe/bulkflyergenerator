import React from 'react';
import { ExportOptions } from '../types';
import { Button } from './bootstrap';

interface ExportButtonProps {
  platform: 'instagram' | 'facebook' | 'custom';
  onExport: (options: ExportOptions) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'lg';
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  platform, 
  onExport, 
  disabled = false, 
  children,
  className = '',
  size
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

  const getVariant = (): 'primary' | 'info' | 'secondary' => {
    switch (platform) {
      case 'instagram':
        return 'primary';
      case 'facebook':
        return 'info';
      case 'custom':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onExport(getExportOptions());
    }
  };

  return (
    <Button 
      variant={getVariant()}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      size={size}
    >
      {children}
    </Button>
  );
};

export default ExportButton;

