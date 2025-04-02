import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FormElements.css';

const Input = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  helperText,
  icon,
  disabled = false,
  required = false,
  className = '',
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);
  
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  
  const getInputType = () => {
    if (type === 'password') {
      return passwordVisible ? 'text' : 'password';
    }
    return type;
  };
  
  const inputClasses = `
    form-input 
    ${focused ? 'input-focused' : ''} 
    ${error ? 'input-error' : ''} 
    ${success ? 'input-success' : ''} 
    ${disabled ? 'input-disabled' : ''} 
    ${className}
  `.trim();
  
  const renderPasswordToggle = () => {
    if (type === 'password') {
      return (
        <button 
          type="button" 
          className="password-toggle" 
          onClick={togglePasswordVisibility}
          aria-label={passwordVisible ? 'Hide password' : 'Show password'}
        >
          <i className={`fas ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      );
    }
    return null;
  };
  
  return (
    <div className="form-field">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className={`input-container ${icon ? 'with-icon' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        
        <input
          id={id}
          type={getInputType()}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          {...rest}
        />
        
        {renderPasswordToggle()}
        
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

Input.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
