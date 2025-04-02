import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaGithub
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>SKILLCRAFTER</h3>
            <p>Connecting skilled professionals with learners worldwide. Share your expertise and grow your skills with our global community.</p>
            <div className="social-icons">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/help-center">Help Center</Link></li>
                <li><Link to="/tutorials">Tutorials</Link></li>
                <li><Link to="/webinars">Webinars</Link></li>
                <li><Link to="/community">Community</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
                <li><Link to="/security">Security</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-copyright">
          <p>&copy; {new Date().getFullYear()} SkillCrafter. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
