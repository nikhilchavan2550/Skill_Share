import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  fullWidth = false, 
  icon,
  iconPosition = 'right',
  onClick,
  href,
  type = 'button',
  className,
  ...rest
}) => {
  const buttonClasses = `
    btn 
    btn-${variant} 
    btn-${size} 
    ${fullWidth ? 'btn-full' : ''} 
    ${icon ? `btn-with-icon icon-${iconPosition}` : ''} 
    ${className || ''}
  `.trim();

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </>
  );

  if (href) {
    // If an href is provided, render as Link component from react-router-dom
    return (
      <Link 
        to={href} 
        className={buttonClasses}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  // Otherwise render as a button element
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  href: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;
