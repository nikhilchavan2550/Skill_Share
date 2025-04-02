import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css';

const Badge = ({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  rounded = false,
  outlined = false,
  pulse = false,
  className = '',
  onClick,
  ...rest
}) => {
  const badgeClasses = `
    badge 
    badge-${variant} 
    badge-${size}
    ${rounded ? 'badge-rounded' : ''}
    ${outlined ? 'badge-outlined' : ''}
    ${pulse ? 'badge-pulse' : ''}
    ${onClick ? 'badge-clickable' : ''}
    ${className}
  `.trim();

  const renderContent = () => (
    <>
      {icon && <span className="badge-icon">{icon}</span>}
      {label && <span className="badge-label">{label}</span>}
    </>
  );

  if (onClick) {
    return (
      <button 
        type="button" 
        className={badgeClasses} 
        onClick={onClick}
        {...rest}
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <span className={badgeClasses} {...rest}>
      {renderContent()}
    </span>
  );
};

Badge.propTypes = {
  label: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary', 
    'secondary', 
    'success', 
    'error', 
    'warning', 
    'info', 
    'light', 
    'dark'
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.node,
  rounded: PropTypes.bool,
  outlined: PropTypes.bool,
  pulse: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Badge;
