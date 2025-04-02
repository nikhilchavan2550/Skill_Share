import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  FaTwitter, 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaYoutube, 
  FaDiscord,
  FaTiktok
} from 'react-icons/fa';
import './Features.css';

const Features = () => {
  const featuresList = [
    {
      emoji: '🌎',
      title: 'Global Community',
      description: 'Connect with skilled professionals and learners from around the world to share knowledge and expertise.'
    },
    {
      emoji: '🎥',
      title: 'Live Sessions',
      description: 'Participate in real-time learning sessions with screen sharing, video calls, and interactive collaboration tools.'
    },
    {
      emoji: '🏆',
      title: 'Skill Certification',
      description: 'Earn verified certificates to showcase your newly acquired skills and boost your professional profile.'
    },
    {
      emoji: '🧠',
      title: 'Personalized Learning',
      description: 'Get customized learning recommendations based on your interests, goals, and skill level.'
    },
    {
      emoji: '🔄',
      title: 'Skill Exchange',
      description: 'Trade your expertise with others in our innovative skill exchange system, where knowledge is the currency.'
    },
    {
      emoji: '💬',
      title: 'Mentor Feedback',
      description: 'Receive detailed feedback and guidance from experienced mentors to accelerate your learning progress.'
    }
  ];
  
  const socialMediaLinks = [
    { icon: <FaTwitter />, url: '#', name: 'Twitter', color: '#1DA1F2' },
    { icon: <FaFacebookF />, url: '#', name: 'Facebook', color: '#1877F2' },
    { icon: <FaInstagram />, url: '#', name: 'Instagram', color: '#E4405F' },
    { icon: <FaLinkedinIn />, url: '#', name: 'LinkedIn', color: '#0A66C2' },
    { icon: <FaYoutube />, url: '#', name: 'YouTube', color: '#FF0000' },
    { icon: <FaDiscord />, url: '#', name: 'Discord', color: '#5865F2' },
    { icon: <FaTiktok />, url: '#', name: 'TikTok', color: '#000000' }
  ];
  
  return (
    <section className="features-section">
      <Container>
        <div className="section-header">
          <h2 className="section-title">Why Choose <span className="accent-text">SkillCrafter</span></h2>
          <p className="section-subtitle">Discover the powerful features that make our platform the perfect place to learn and share knowledge</p>
        </div>
        
        <Row className="features-grid">
          {featuresList.map((feature, index) => (
            <Col lg={4} md={6} key={index}>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-emoji">{feature.emoji}</span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
        
        <div className="community-section">
          <Row className="align-items-center">
            <Col lg={6} md={12}>
              <div className="community-image-container">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Our Community" className="community-image" />
              </div>
            </Col>
            <Col lg={6} md={12}>
              <div className="social-media-section">
                <h3 className="social-title">Connect With Our Community</h3>
                <p className="social-description">Join thousands of learners and mentors in our thriving community. Follow us on social media to stay updated on the latest courses, events, and success stories.</p>
                <div className="social-icons">
                  {socialMediaLinks.map((social, index) => (
                    <a 
                      href={social.url} 
                      key={index} 
                      className="social-icon" 
                      aria-label={social.name}
                      style={{ color: social.color }}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
        
        <div className="features-cta">
          <div className="cta-content">
            <h3>Ready to start your learning journey?</h3>
            <p>Join thousands of learners and mentors on SkillCrafter today.</p>
          </div>
          <a href="/register" className="cta-button purple-btn" style={{ color: 'white' }}>
            Get Started
            <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </Container>
    </section>
  );
};

export default Features;
