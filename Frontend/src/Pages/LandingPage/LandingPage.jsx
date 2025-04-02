import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const featuresRef = useRef(null);
  const whyPointsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
      animateOnScroll();
    };

    window.addEventListener("scroll", handleScroll);

    // Initial animation check
    animateOnScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const animateOnScroll = () => {
    // Animate why points
    const whyPoints = document.querySelectorAll('.feature-point');
    whyPoints.forEach(point => {
      const top = point.getBoundingClientRect().top;
      if (top < window.innerHeight - 100) {
        point.classList.add('animate');
      }
    });

    // Animate feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      const top = card.getBoundingClientRect().top;
      if (top < window.innerHeight - 100) {
        card.classList.add('animate');
      }
    });
  };

  // Parallax effect for images
  const getTransformStyle = (direction) => {
    const parallaxFactor = direction === 'left' ? 0.2 : -0.2;
    const translateX = scrollPosition * parallaxFactor;
    return { transform: `translateX(${translateX}px)` };
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="particles"></div>
        <div className="hero-content">
          <div className="hero-images">
            <img 
              src="/assets/images/1.png" 
              alt="Decorative graphic" 
              style={getTransformStyle('left')} 
            />
            <img 
              src="/assets/images/2.png" 
              alt="Decorative graphic" 
              style={getTransformStyle('right')} 
            />
          </div>
          <div className="title-container">
            <div className="title-box">
              <h1 className="hero-title">SKILL SWAP</h1>
            </div>
            <p className="hero-subtitle">
              A platform for collaborative learning and skill exchange
            </p>
            <div className="hero-cta">
              <Link to="/discover" className="hero-btn primary-btn">
                Explore Skills
              </Link>
              <a href="#why-skill-swap" className="hero-btn secondary-btn">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Skill Swap Section */}
      <section id="why-skill-swap" className="why-section">
        <div className="why-title-container">
          <h2 className="why-title">WHY SKILL SWAP?</h2>
        </div>
        <div className="why-content">
          <div className="why-description">
            At Skill Swap, we believe in the power of mutual learning and collaboration. Here's why Skill Swap is the
            ultimate platform for skill acquisition and knowledge exchange:
          </div>
          
          <div className="feature-point" ref={el => whyPointsRef.current[0] = el}>
            <span className="feature-number">➊</span>
            <h3 className="feature-title">Learn From Experts</h3>
            <p>
              Gain insights and practical knowledge directly from experienced mentors who excel in their respective fields. 
              Whether it's mastering a new programming language, honing your culinary skills, or delving into the world of 
              digital marketing, our mentors are here to guide you every step of the way.
            </p>
          </div>
          
          <div className="feature-point" ref={el => whyPointsRef.current[1] = el}>
            <span className="feature-number">➋</span>
            <h3 className="feature-title">Share Your Expertise</h3>
            <p>
              Have a skill or passion you're eager to share? Skill Swap provides a platform for you to become a mentor yourself. 
              Share your expertise with others, foster a sense of community, and contribute to the growth of aspiring learners.
            </p>
          </div>
          
          <div className="feature-point" ref={el => whyPointsRef.current[2] = el}>
            <span className="feature-number">➌</span>
            <h3 className="feature-title">Collaborative Environment</h3>
            <p>
              Our community thrives on collaboration. Connect with like-minded individuals, participate in group projects, 
              and engage in discussions that fuel creativity and innovation. Skill Swap isn't just about individual growth—it's 
              about collective advancement.
            </p>
          </div>
          
          <div className="feature-point" ref={el => whyPointsRef.current[3] = el}>
            <span className="feature-number">➍</span>
            <h3 className="feature-title">Diverse Learning Opportunities</h3>
            <p>
              With Skill Swap, the possibilities are endless and <strong>free of cost</strong>. Explore a wide range of topics and disciplines, 
              from traditional crafts to cutting-edge technologies. Our diverse library of skills ensures there's something for everyone, 
              regardless of your interests or background.
            </p>
          </div>
          
          <div className="feature-point" ref={el => whyPointsRef.current[4] = el}>
            <span className="feature-number">➎</span>
            <h3 className="feature-title">Continuous Growth</h3>
            <p>
              Learning is a lifelong journey, and Skill Swap is here to support you every step of the way. Whether you're a novice 
              or a seasoned professional, our platform empowers you to continuously expand your knowledge, challenge yourself, 
              and embrace new opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="why-title-container">
          <h2 className="why-title">OUR FEATURES</h2>
        </div>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Discover Skills</h3>
            <p>Browse through a wide range of skills offered by mentors from around the world, filtering by categories, ratings, and more.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Real-time Chat</h3>
            <p>Connect directly with mentors and peers through our intuitive chat interface for seamless communication.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rating System</h3>
            <p>Provide and receive feedback through our comprehensive rating system to ensure quality interactions.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Personalized Profiles</h3>
            <p>Create detailed profiles showcasing your skills, interests, and learning goals to find the perfect match.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure Platform</h3>
            <p>Enjoy a safe environment with user verification and reporting systems to maintain community standards.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Global Community</h3>
            <p>Join a diverse global network of learners and mentors, breaking geographical barriers in skill acquisition.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Start Your Learning Journey?</h2>
          <p className="cta-text">
            Join thousands of users already exchanging skills and knowledge on our platform.
            Create your free account today and become part of our growing community.
          </p>
          <Link to="/register" className="cta-btn">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
