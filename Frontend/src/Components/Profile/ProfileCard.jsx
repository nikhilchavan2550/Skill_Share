import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ProfileCard.css';

const ProfileCard = ({
  username,
  fullName,
  avatarUrl,
  expertise,
  bio,
  rating,
  stats,
  badges,
  isVerified,
  isOnline,
  isDetailed = false,
  className = '',
}) => {
  return (
    <div className={`profile-card ${isDetailed ? 'profile-detailed' : ''} ${className}`}>
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img src={avatarUrl} alt={`${fullName}'s avatar`} className="profile-avatar" />
          {isOnline && <span className="online-indicator" title="Online"></span>}
          {isVerified && (
            <span className="verified-badge" title="Verified User">
              <i className="fas fa-check"></i>
            </span>
          )}
        </div>

        <div className="profile-info">
          <h3 className="profile-name">
            {fullName}
            {isVerified && <i className="fas fa-badge-check verified-icon"></i>}
          </h3>
          <p className="profile-username">@{username}</p>
          <p className="profile-expertise">{expertise}</p>
          
          {rating > 0 && (
            <div className="profile-rating">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star}
                    className={`${star <= Math.round(rating) ? 'fas' : 'far'} fa-star`}
                  ></i>
                ))}
              </div>
              <span className="rating-value">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {isDetailed && (
        <>
          <div className="profile-bio">
            <p>{bio}</p>
          </div>

          <div className="profile-stats">
            {stats && stats.map((stat) => (
              <div key={stat.label} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {badges && badges.length > 0 && (
            <div className="profile-badges">
              <h4>Achievements</h4>
              <div className="badges-container">
                {badges.map((badge) => (
                  <div key={badge.id} className="badge-item" title={badge.description}>
                    <div className="badge-icon">
                      <i className={`fas ${badge.icon}`}></i>
                    </div>
                    <span className="badge-name">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-actions">
            <Link to={`/profile/${username}`} className="view-profile-link">
              <i className="fas fa-user"></i> View Full Profile
            </Link>
            <Link to={`/chats?user=${username}`} className="message-link">
              <i className="fas fa-comment-alt"></i> Message
            </Link>
          </div>
        </>
      )}

      {!isDetailed && (
        <div className="profile-actions">
          <Link to={`/profile/${username}`} className="view-profile-btn">
            View Profile
          </Link>
        </div>
      )}
    </div>
  );
};

ProfileCard.propTypes = {
  username: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string.isRequired,
  expertise: PropTypes.string.isRequired,
  bio: PropTypes.string,
  rating: PropTypes.number,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  isVerified: PropTypes.bool,
  isOnline: PropTypes.bool,
  isDetailed: PropTypes.bool,
  className: PropTypes.string,
};

export default ProfileCard;
