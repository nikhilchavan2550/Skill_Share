import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Button from '../Button/Button';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="hero-content-wrapper">
            <div className="hero-content">
              <h1 className="hero-title">
                Discover & Share <span className="accent-text">Skills</span> That Shape Tomorrow
              </h1>
              <p className="hero-subtitle">
                Connect with experts worldwide, learn new skills, and share your knowledge in a vibrant community of lifelong learners.
              </p>
              <div className="hero-actions">
                <Button 
                  variant="primary" 
                  size="lg" 
                  href="/discover"
                  icon={<i className="fas fa-arrow-right"></i>}
                >
                  Explore Skills
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  href="/teach"
                >
                  Share Your Expertise
                </Button>
              </div>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Skills Available</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">10k+</span>
                  <span className="stat-label">Active Learners</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2k+</span>
                  <span className="stat-label">Expert Mentors</span>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={6} className="hero-image-wrapper">
            <div className="hero-image-container">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="People learning and sharing skills" 
                className="hero-image"
              />
              <div className="floating-card card-1">
                <div className="card-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="card-content">
                  <h4>Learn at Your Pace</h4>
                  <p>Flexible schedules for everyone</p>
                </div>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="card-content">
                  <h4>Expert Community</h4>
                  <p>Connect with skilled mentors</p>
                </div>
              </div>
              <div className="pulse-circle"></div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
