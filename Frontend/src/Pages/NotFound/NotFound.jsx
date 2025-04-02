import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaQuestionCircle } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="not-found-content">
              <div className="error-code">404</div>
              <h1>Page Not Found</h1>
              <p>
                The page you are looking for might have been removed, 
                had its name changed, or is temporarily unavailable.
              </p>
              
              <div className="action-buttons">
                <Button 
                  as={Link} 
                  to="/" 
                  variant="primary" 
                  className="action-button home-btn"
                >
                  <FaHome className="btn-icon" /> Go Home
                </Button>
                <Button 
                  as={Link} 
                  to="/discover" 
                  variant="outline-light" 
                  className="action-button discover-btn"
                >
                  <FaSearch className="btn-icon" /> Discover Skills
                </Button>
                <Button 
                  as={Link} 
                  to="/about" 
                  variant="outline-light" 
                  className="action-button about-btn"
                >
                  <FaQuestionCircle className="btn-icon" /> About Us
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound;
