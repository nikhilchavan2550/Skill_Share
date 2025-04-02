import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FormElements.css';

const Select = ({
  id,
  label,
  options,
  value,
  onChange,
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  className = '',
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  
  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);
  
  const selectClasses = `
    form-input form-select
    ${focused ? 'input-focused' : ''} 
    ${error ? 'input-error' : ''} 
    ${success ? 'input-success' : ''} 
    ${disabled ? 'input-disabled' : ''} 
    ${className}
  `.trim();
  
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className={`select-container ${focused ? 'focused' : ''}`}>
        <select
          id={id}
          className={selectClasses}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {success && (
          <span className="input-feedback success">
            <i className="fas fa-check-circle"></i>
          </span>
        )}
        
        {error && (
          <span className="input-feedback error">
            <i className="fas fa-exclamation-circle"></i>
          </span>
        )}
      </div>
      
      {helperText && (
        <span className={`input-helper-text ${error ? 'error-text' : ''} ${success ? 'success-text' : ''}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};

Select.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default Select;
