import React from 'react';
import PropTypes from 'prop-types';
import './Loader.css';

const Loader = ({ 
  size = 'medium', 
  variant = 'primary',
  fullPage = false,
  text = 'Loading...',
  showText = true,
  className = ''
}) => {
  const loaderClasses = `
    loader-container 
    loader-${size} 
    loader-${variant}
    ${fullPage ? 'loader-fullpage' : ''}
    ${className}
  `.trim();

  return (
    <div className={loaderClasses}>
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {showText && <p className="loader-text">{text}</p>}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'light']),
  fullPage: PropTypes.bool,
  text: PropTypes.string,
  showText: PropTypes.bool,
  className: PropTypes.string
};

export default Loader;
