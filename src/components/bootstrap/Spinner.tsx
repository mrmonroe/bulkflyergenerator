import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size,
  variant = 'primary',
  className = ''
}) => {
  const sizeClass = size ? `spinner-border-${size}` : '';
  const variantClass = `text-${variant}`;
  
  return (
    <div className={`spinner-border ${sizeClass} ${variantClass} ${className}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

export const SpinnerButton: React.FC<SpinnerProps & { children: React.ReactNode }> = ({
  children,
  size = 'sm',
  variant = 'primary',
  className = ''
}) => {
  return (
    <div className={`d-flex align-items-center ${className}`}>
      <Spinner size={size} variant={variant} className="me-2" />
      {children}
    </div>
  );
};

export default Spinner;
