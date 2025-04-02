import React from 'react';
import PropTypes from 'prop-types';
import './FormElements.css';

const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...rest
}) => {
  const inputClasses = `
    checkbox-input
    ${error ? 'input-error' : ''} 
    ${success ? 'input-success' : ''} 
    ${disabled ? 'input-disabled' : ''} 
    ${className}
  `.trim();
  
  return (
    <div className="form-field">
      <label className="checkbox-field">
        <input
          id={id}
          type="checkbox"
          className={inputClasses}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...rest}
        />
        <span className="checkbox-control"></span>
        <span className="checkbox-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </span>
      </label>
      
      {helperText && (
        <span className={`input-helper-text ${error ? 'error-text' : ''} ${success ? 'success-text' : ''}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Checkbox;
