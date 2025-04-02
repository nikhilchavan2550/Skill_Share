import React, { useState, useLocation } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { Container, Nav, Navbar, Button, NavDropdown, Image } from "react-bootstrap";
import { 
  FaUserCircle, 
  FaEdit, 
  FaComments, 
  FaCog, 
  FaSignOutAlt, 
  FaHome,
  FaUsers,
  FaInfoCircle,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';
import './Navbar.css';
import { toast } from "react-toastify";

// Default avatar import - create this file in your assets
const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=9C27B0&color=fff";

// Add Discord to the navigation items
const navItems = [
  { label: "Home", path: "/" },
  { label: "Discover", path: "/discover" },
  { label: "About Us", path: "/about" },
  { label: "Discord", path: "/discord" },
];

const Header = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser();
  
  const handleLogout = (e) => {
    try {
      // Prevent default behavior
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Close navbar
      closeNavbar();
      
      // 1. Make a logout request
      fetch('/auth/logout', { credentials: 'include', cache: 'no-store' })
        .then(() => {
          // 2. Clear user data
          localStorage.removeItem("userInfo");
          localStorage.removeItem("token");
          
          // 3. Force navigation to login page
          window.location.replace('/login');
        })
        .catch(err => {
          console.error("Logout API error:", err);
          // Still proceed with logout even if API fails
          localStorage.removeItem("userInfo");
          localStorage.removeItem("token");
          window.location.replace('/login');
        });
    } catch (error) {
      console.error("Logout error:", error);
      // Emergency fallback
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      window.location.href = '/login';
    }
    
    return false; // Extra measure to prevent event propagation
  };

  const closeNavbar = () => {
    setExpanded(false);
  };

  return (
    <Navbar expanded={expanded} expand="lg" className="navbar-dark" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-text" onClick={closeNavbar}>
          SKILL<span className="brand-highlight">CRAFTER</span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : "expanded")}
        />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={closeNavbar} className="nav-link-custom">
              <FaHome className="nav-icon" /> <span className="nav-text">Home</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/discover" onClick={closeNavbar} className="nav-link-custom">
              <FaUsers className="nav-icon" /> <span className="nav-text">Discover</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/about" onClick={closeNavbar} className="nav-link-custom">
              <FaInfoCircle className="nav-icon" /> <span className="nav-text">About Us</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/discord" onClick={closeNavbar} className="nav-link-custom">
              <FaComments className="nav-icon" /> <span className="nav-text">Discord</span>
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/chat" onClick={closeNavbar} className="nav-link-custom">
                <FaComments className="nav-icon" /> <span className="nav-text">Messages</span>
              </Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <NavDropdown
                title={
                  <span className="user-dropdown-toggle">
                    {user.picture ? (
                      <Image 
                        src={user.picture} 
                        alt={user.username} 
                        className="user-avatar" 
                        roundedCircle
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultAvatar;
                        }}
                      />
                    ) : (
                      <FaUserCircle className="user-icon" />
                    )}
                    <span className="username">{user.username}</span>
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to={`/profile/${user.username}`} onClick={closeNavbar}>
                  <FaUserCircle className="dropdown-icon" /> Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/edit-profile" onClick={closeNavbar}>
                  <FaEdit className="dropdown-icon" /> Edit Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/chat" onClick={closeNavbar}>
                  <FaComments className="dropdown-icon" /> Messages
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings" onClick={closeNavbar}>
                  <FaCog className="dropdown-icon" /> Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <button 
                  className="dropdown-item logout-button"
                  type="button" 
                  onClick={() => {
                    // Create blocking overlay
                    const overlay = document.createElement('div');
                    overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999;color:white;text-align:center;padding-top:25%;font-size:24px;';
                    overlay.textContent = 'Logging out...';
                    document.body.appendChild(overlay);
                    
                    // CRITICAL FIX: Wait for server-side logout to complete FIRST
                    // This ensures HTTP-only cookies are cleared by the server
                    fetch('/auth/logout', { 
                      method: 'GET',
                      credentials: 'include',
                      headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                      }
                    })
                    .then(response => {
                      console.log("Logout API response:", response.status);
                      
                      // Now clear client-side data AFTER server-side logout
                      localStorage.clear();
                      sessionStorage.clear();
                      
                      // Set these flags to prevent auto-login
                      localStorage.setItem('force_logout', 'true');
                      localStorage.setItem('manual_logout', 'true');
                      
                      // Use the most direct navigation method
                      const baseUrl = window.location.origin;
                      // Use window.location.replace to force a fresh page load
                      window.top.location.replace(`${baseUrl}/login?forcedLogout=${Date.now()}`);
                    })
                    .catch(error => {
                      console.error("Error during logout:", error);
                      
                      // Still clear client data even if API fails
                      localStorage.clear();
                      sessionStorage.clear();
                      localStorage.setItem('force_logout', 'true');
                      
                      // Navigate anyway
                      window.top.location.replace(`${window.location.origin}/login?forcedLogout=${Date.now()}`);
                    });
                  }}
                >
                  <FaSignOutAlt className="dropdown-icon" /> Logout
                </button>
              </NavDropdown>
            ) : (
              <div className="auth-buttons">
                <Button 
                  as={Link} 
                  variant="outline-light" 
                  className="login-btn" 
                  to="/login"
                  onClick={closeNavbar}
                >
                  <FaSignInAlt className="nav-icon" /> <span className="nav-text">Login</span>
                </Button>
                <Button 
                  as={Link} 
                  variant="primary" 
                  className="register-btn" 
                  to="/register"
                  onClick={closeNavbar}
                >
                  <FaUserPlus className="nav-icon" /> <span className="nav-text">Register</span>
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
