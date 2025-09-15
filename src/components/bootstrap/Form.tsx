import React from 'react';

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = '',
  label,
  htmlFor,
  error,
  required = false
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  error = false,
  label,
  helperText,
  className = '',
  ...props
}) => {
  const inputClasses = `form-control ${error ? 'is-invalid' : ''} ${className}`;
  
  return (
    <>
      {label && <label className="form-label">{label}</label>}
      <input
        className={inputClasses}
        {...props}
      />
      {helperText && !error && (
        <div className="form-text">{helperText}</div>
      )}
    </>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  error = false,
  label,
  helperText,
  className = '',
  ...props
}) => {
  const textareaClasses = `form-control ${error ? 'is-invalid' : ''} ${className}`;
  
  return (
    <>
      {label && <label className="form-label">{label}</label>}
      <textarea
        className={textareaClasses}
        {...props}
      />
      {helperText && !error && (
        <div className="form-text">{helperText}</div>
      )}
    </>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  error = false,
  label,
  helperText,
  options,
  className = '',
  ...props
}) => {
  const selectClasses = `form-select ${error ? 'is-invalid' : ''} ${className}`;
  
  return (
    <>
      {label && <label className="form-label">{label}</label>}
      <select className={selectClasses} {...props}>
        <option value="">Choose...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <div className="form-text">{helperText}</div>
      )}
    </>
  );
};

export default { FormGroup, Input, Textarea, Select };
