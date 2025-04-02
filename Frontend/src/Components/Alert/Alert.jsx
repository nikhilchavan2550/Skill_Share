import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Alert.css';

const Alert = ({
  title,
  message,
  variant = 'info',
  icon,
  dismissible = true,
  autoClose = false,
  autoCloseTime = 5000,
  onClose,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  
  // Auto close timer
  useEffect(() => {
    let timer;
    
    if (autoClose && isVisible) {
      timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [autoClose, autoCloseTime, isVisible]);
  
  const handleClose = () => {
    setIsClosing(true);
    
    // Wait for animation to finish before removing from DOM
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  };
  
  if (!isVisible) {
    return null;
  }
  
  const defaultIcons = {
    success: <i className="fas fa-check-circle"></i>,
    error: <i className="fas fa-exclamation-circle"></i>,
    warning: <i className="fas fa-exclamation-triangle"></i>,
    info: <i className="fas fa-info-circle"></i>,
  };
  
  const alertClasses = `
    alert 
    alert-${variant} 
    ${isClosing ? 'alert-closing' : ''}
    ${className}
  `.trim();
  
  const alertIcon = icon || defaultIcons[variant];
  
  return (
    <div className={alertClasses} role="alert">
      <div className="alert-icon">
        {alertIcon}
      </div>
      
      <div className="alert-content">
        {title && <h4 className="alert-title">{title}</h4>}
        {message && <p className="alert-message">{message}</p>}
      </div>
      
      {dismissible && (
        <button 
          type="button" 
          className="alert-close-btn" 
          onClick={handleClose}
          aria-label="Close alert"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  title: PropTypes.string,
  message: PropTypes.node,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  icon: PropTypes.node,
  dismissible: PropTypes.bool,
  autoClose: PropTypes.bool,
  autoCloseTime: PropTypes.number,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default Alert;
