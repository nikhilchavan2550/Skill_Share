import React, { useEffect, useRef } from "react";
import "./AboutUs.css";
import { FaUsers, FaGraduationCap, FaHandshake, FaRocket } from "react-icons/fa";

// Use dynamic import with try-catch for better error handling
let missionImage;
let storyImage;

try {
  missionImage = require("../../assets/images/mission.jpg");
} catch (e) {
  console.warn("Mission image not found, using fallback");
  missionImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";
}

try {
  storyImage = require("../../assets/images/story.jpg");
} catch (e) {
  console.warn("Story image not found, using fallback");
  storyImage = "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80";
}

const AboutUs = () => {
  const observerRef = useRef(null);

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="about-us-container">
      <header className="about-us-header">
        <div className="header-content">
          <h1 className="animate-on-scroll">About SKILLCRAFTER</h1>
          <p className="animate-on-scroll">Empowering the next generation of skilled professionals through collaborative learning</p>
        </div>
      </header>

      <section className="about-us-mission">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text animate-on-scroll">
              <h2>Our Mission</h2>
              <p>
                At SKILLCRAFTER, we believe in the power of learning through collaboration and meaningful connections.
                Our platform is designed to help people discover, exchange, and master skills that matter in today's
                evolving professional landscape.
              </p>
              <p>
                Whether you're looking to advance your career, explore new passions, or connect with like-minded
                individuals, SKILLCRAFTER provides the environment where skills flourish and relationships grow.
              </p>
            </div>
            <div className="mission-image animate-on-scroll">
              <img 
                src={missionImage} 
                alt="Our Mission" 
                className="rounded-image" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="core-values">
        <div className="container">
          <h2 className="text-center animate-on-scroll">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card animate-on-scroll">
              <div className="value-icon">
                <FaUsers />
              </div>
              <h3>Community First</h3>
              <p>We foster a supportive environment where everyone feels welcome to share knowledge and grow together.</p>
            </div>

            <div className="value-card animate-on-scroll">
              <div className="value-icon">
                <FaGraduationCap />
              </div>
              <h3>Continuous Learning</h3>
              <p>We believe in the power of lifelong learning and the constant pursuit of knowledge and growth.</p>
            </div>

            <div className="value-card animate-on-scroll">
              <div className="value-icon">
                <FaHandshake />
              </div>
              <h3>Meaningful Connections</h3>
              <p>We create opportunities for genuine relationships that go beyond superficial networking.</p>
            </div>

            <div className="value-card animate-on-scroll">
              <div className="value-icon">
                <FaRocket />
              </div>
              <h3>Innovation</h3>
              <p>We constantly evolve our platform to provide cutting-edge tools for skill development and exchange.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-us-story">
        <div className="container">
          <div className="story-content">
            <div className="story-image animate-on-scroll">
              <img 
                src={storyImage} 
                alt="Our Story" 
                className="rounded-image" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80";
                }}
              />
            </div>
            <div className="story-text animate-on-scroll">
              <h2>Our Story</h2>
              <p>
                SKILLCRAFTER was born from a simple observation: in today's rapidly changing world, the most valuable
                currency is knowledge, and the most effective way to acquire it is through direct exchange with others.
              </p>
              <p>
                Founded in 2023, our platform has quickly grown into a vibrant community of learners and teachers,
                all united by the desire to share what they know and learn what they don't.
              </p>
              <p>
                What started as a small network of tech professionals has expanded into a diverse ecosystem of skills
                spanning creative arts, business, technology, and personal development.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="join-us">
        <div className="container">
          <div className="join-content animate-on-scroll">
            <h2>Join the SKILLCRAFTER Community</h2>
            <p>
              Ready to start your journey with us? Sign up today and become part of a growing community
              dedicated to skill development and meaningful connections.
            </p>
            <a href="/register" className="btn-primary">Get Started</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
