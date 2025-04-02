import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDiscord, FaUsers, FaComments, FaCode, FaExclamationCircle, FaSignInAlt } from 'react-icons/fa';
import { IoRocketSharp } from 'react-icons/io5';
import { useUser } from '../../util/UserContext';
import './Discord.css';

const Discord = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Discord server invite link - would be replaced with your actual Discord server invite
  const discordInviteLink = "https://discord.gg/skillswap";

  // Stats for display
  const stats = [
    { value: "500+", label: "Members" },
    { value: "24/7", label: "Active Support" },
    { value: "10+", label: "Skill Channels" }
  ];

  // Features of the Discord server
  const features = [
    {
      icon: <FaUsers />,
      title: "Community",
      description: "Connect with like-minded individuals who share your passion for skill development and exchange."
    },
    {
      icon: <FaComments />,
      title: "Discussions",
      description: "Engage in meaningful conversations about various skills, techniques, and learning resources."
    },
    {
      icon: <FaCode />,
      title: "Skill Showcase",
      description: "Share your projects, get feedback, and showcase your growing expertise with our supportive community."
    },
    {
      icon: <IoRocketSharp />,
      title: "Growth Opportunities",
      description: "Discover collaboration opportunities, mentorship connections, and skill-building challenges."
    }
  ];

  const handleJoinDiscord = (e) => {
    if (!user) {
      e.preventDefault();
      // If user is not logged in, prevent default action and show login message
      const loginSection = document.getElementById('login-message');
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="discord-page">
      <div className="discord-container">
        <div className="discord-hero">
          <div className="discord-hero-bg"></div>
          <div className="discord-hero-content">
            <h1 className="discord-title">Join Our SkillSwap Discord</h1>
            <p className="discord-subtitle">Connect with our community of skill enthusiasts, share your journey, and find inspiration for your next skill exchange.</p>
            
            {user ? (
              <a 
                href={discordInviteLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="discord-button"
              >
                <FaDiscord size={24} /> Join Our Server
              </a>
            ) : (
              <button 
                className="discord-button"
                onClick={handleJoinDiscord}
              >
                <FaDiscord size={24} /> Join Our Server
              </button>
            )}
          </div>
        </div>

        <div className="discord-features">
          {features.map((feature, index) => (
            <div className="discord-feature" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="discord-community">
          <h2 className="community-title">A Thriving Community</h2>
          <p className="community-description">
            Our Discord server is more than just a chat platform—it's a vibrant community of learners and teachers coming together to exchange knowledge and skills.
          </p>
          
          <div className="discord-stats">
            {stats.map((stat, index) => (
              <div className="stat-item" key={index}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="discord-cta">
          <h2 className="cta-title">Ready to Connect?</h2>
          <p className="cta-description">
            Join our Discord server today and start connecting with fellow skill enthusiasts, 
            participate in discussions, and find your next skill exchange partner.
          </p>
          
          {user ? (
            <a 
              href={discordInviteLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="discord-button"
            >
              <FaDiscord size={24} /> Join Discord
            </a>
          ) : (
            <div id="login-message" className="login-message">
              <FaExclamationCircle size={20} />
              <span>You need to be logged in to join our Discord server.</span>
              <Link to="/login" className="login-link">
                <FaSignInAlt size={14} /> Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discord; 