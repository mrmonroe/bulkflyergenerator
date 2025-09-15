import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  title,
  subtitle,
  bodyClassName = ''
}) => {
  return (
    <div className={`card ${className}`}>
      {header && (
        <div className="card-header">
          {header}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {title && <h5 className="card-title">{title}</h5>}
        {subtitle && <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>}
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
