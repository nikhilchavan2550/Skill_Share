import React, { Component } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You could log the error to an error reporting service here
    // logErrorToMyService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="error-boundary-container">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <div className="error-boundary-card">
                  <div className="error-icon-container">
                    <div className="error-icon">!</div>
                  </div>
                  <h1>Something went wrong</h1>
                  <p>We apologize for the inconvenience. An unexpected error has occurred.</p>
                  
                  <div className="error-actions">
                    <Button 
                      variant="outline-light" 
                      className="error-button" 
                      onClick={() => window.location.href = '/'}
                    >
                      Go to Home
                    </Button>
                    <Button 
                      variant="primary" 
                      className="error-button purple-btn"
                      onClick={this.handleReset}
                    >
                      Try Again
                    </Button>
                  </div>
                  
                  {this.props.showDetails && this.state.error && (
                    <div className="error-details">
                      <h5>Error Details (for developers):</h5>
                      <details>
                        <summary>Show technical details</summary>
                        <p>{this.state.error.toString()}</p>
                        <p className="stack-trace">
                          {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </p>
                      </details>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 