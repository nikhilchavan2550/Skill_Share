import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserGraduate, FaClock, FaCheckCircle } from 'react-icons/fa';
import './SkillDetail.css';

const SkillDetail = ({ show, onHide, skill }) => {
  if (!skill) return null;
  
  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={`star-${i}`} className="star-icon filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={`star-${i}`} className="star-icon filled" />);
      } else {
        stars.push(<FaRegStar key={`star-${i}`} className="star-icon" />);
      }
    }
    
    return stars;
  };
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="skill-detail-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{skill.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="skill-detail-content">
          <Row>
            <Col md={6}>
              <div className="skill-detail-image">
                <img src={skill.image} alt={skill.title} />
                <Badge className={`category-badge ${skill.category.toLowerCase()}`}>
                  {skill.category}
                </Badge>
              </div>
            </Col>
            <Col md={6}>
              <div className="skill-detail-info">
                <div className="instructor-info">
                  <img 
                    src={skill.author.avatar} 
                    alt={skill.author.name} 
                    className="instructor-avatar" 
                  />
                  <div>
                    <h5>{skill.author.name}</h5>
                    <div className="rating-container">
                      {renderStars(skill.rating)}
                      <span className="rating-value">{skill.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="skill-stats">
                  <div className="stat-item">
                    <FaUserGraduate className="stat-icon" />
                    <span>524 Students</span>
                  </div>
                  <div className="stat-item">
                    <FaClock className="stat-icon" />
                    <span>12 Hours</span>
                  </div>
                  <div className="stat-item">
                    <FaCheckCircle className="stat-icon" />
                    <span>Certificate</span>
                  </div>
                </div>
                
                <div className="skill-description">
                  <h5>Description</h5>
                  <p>{skill.description}</p>
                  <p>This course provides comprehensive training on {skill.title.toLowerCase()}. You'll learn practical skills through hands-on projects and receive personalized feedback from your instructor.</p>
                </div>
                
                <div className="skill-topics">
                  <h5>What you'll learn</h5>
                  <ul>
                    <li>Fundamental concepts and best practices</li>
                    <li>Real-world applications and case studies</li>
                    <li>Industry-standard tools and technologies</li>
                    <li>Problem-solving techniques and methodologies</li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="skill-curriculum">
            <h5>Curriculum</h5>
            <div className="curriculum-sections">
              <div className="curriculum-section">
                <div className="section-header">
                  <h6>Section 1: Getting Started</h6>
                  <span>3 lectures • 45 min</span>
                </div>
                <div className="section-content">
                  <div className="lecture-item">
                    <span className="lecture-title">Introduction</span>
                    <span className="lecture-duration">15:00</span>
                  </div>
                  <div className="lecture-item">
                    <span className="lecture-title">Setting Up Your Environment</span>
                    <span className="lecture-duration">20:00</span>
                  </div>
                  <div className="lecture-item">
                    <span className="lecture-title">Overview of Key Concepts</span>
                    <span className="lecture-duration">10:00</span>
                  </div>
                </div>
              </div>
              
              <div className="curriculum-section">
                <div className="section-header">
                  <h6>Section 2: Core Principles</h6>
                  <span>4 lectures • 1h 20min</span>
                </div>
                <div className="section-content">
                  <div className="lecture-item">
                    <span className="lecture-title">Fundamental Principles</span>
                    <span className="lecture-duration">25:00</span>
                  </div>
                  <div className="lecture-item">
                    <span className="lecture-title">Advanced Techniques</span>
                    <span className="lecture-duration">30:00</span>
                  </div>
                  <div className="lecture-item">
                    <span className="lecture-title">Practical Application</span>
                    <span className="lecture-duration">25:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary">
          Enroll Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SkillDetail;
