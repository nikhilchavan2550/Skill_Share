import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FormElements.css';

const TextArea = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  success,
  helperText,
  rows = 4,
  maxLength,
  disabled = false,
  required = false,
  className = '',
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(value?.length || 0);
  
  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);
  
  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    onChange(e);
  };
  
  const textareaClasses = `
    form-input form-textarea
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
      
      <div className="input-container">
        <textarea
          id={id}
          className={textareaClasses}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          {...rest}
        />
        
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
      
      <div className="textarea-footer">
        {helperText && (
          <span className={`input-helper-text ${error ? 'error-text' : ''} ${success ? 'success-text' : ''}`}>
            {helperText}
          </span>
        )}
        
        {maxLength && (
          <span className="char-counter">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

TextArea.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default TextArea;
