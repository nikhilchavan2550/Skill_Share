import React from 'react';
import './Card.css';

const Card = ({ image, title, category, author, rating, description, onViewDetails }) => {
  return (
    <div className="skill-card">
      <div className="card-image-container">
        <img src={image} alt={title} className="card-image" />
        <div className="card-category">{category}</div>
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <div className="card-author">
          <span className="author-name">{author.name}</span>
          {rating && (
            <div className="card-rating">
              <i className="fas fa-star"></i>
              <span>{rating}</span>
            </div>
          )}
        </div>
        <p className="card-description">{description}</p>
        <button 
          className="card-button" 
          onClick={onViewDetails} 
          style={{ color: 'white', margin: '0 auto', justifyContent: 'center' }}
        >
          View Details
          <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
        </button>
      </div>
    </div>
  );
};

export default Card;
