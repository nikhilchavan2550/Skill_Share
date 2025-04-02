import React from 'react';
import './Loading.css';

const Loading = ({ fullScreen, size = 'medium', message = 'Loading...' }) => {
  const loadingClass = `loading ${size} ${fullScreen ? 'fullscreen' : ''}`;
  
  return (
    <div className={loadingClass}>
      <div className="spinner-container">
        <div className="spinner"></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default Loading; 