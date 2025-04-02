import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Features from '../../Components/Features/Features';
import Card from '../../Components/Card/Card';
import Button from '../../Components/Button/Button';
import SkillDetail from '../../Components/SkillDetail/SkillDetail';
import './Home.css';

// Mock data for featured skills
const featuredSkills = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    category: 'Programming',
    image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    author: { name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
    rating: 4.8,
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build responsive websites from scratch.'
  },
  {
    id: 2,
    title: 'Digital Marketing Fundamentals',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    author: { name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/54.jpg' },
    rating: 4.7,
    description: 'Master SEO, social media marketing, email campaigns, and content marketing strategies.'
  },
  {
    id: 3,
    title: 'UI/UX Design Principles',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    author: { name: 'Elena Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/63.jpg' },
    rating: 4.9,
    description: 'Discover user-centered design principles to create intuitive and visually appealing interfaces.'
  }
];

// Mock data for top mentors
const topMentors = [
  {
    id: 1,
    name: 'David Park',
    expertise: 'Full Stack Development',
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
    rating: 4.9,
    students: 856
  },
  {
    id: 2,
    name: 'Priya Sharma',
    expertise: 'Data Science & AI',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    rating: 4.8,
    students: 723
  },
  {
    id: 3,
    name: 'James Wilson',
    expertise: 'Product Management',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    rating: 4.7,
    students: 512
  }
];

const Home = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const handleShowDetails = (skill) => {
    setSelectedSkill(skill);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  return (
    <div className="home-page">      
      {/* Why Choose SkillCrafter Section */}
      <Features />
      
      {/* Featured Skills Section */}
      <section className="featured-skills-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Featured <span className="accent-text">Skills</span></h2>
            <p className="section-subtitle">Discover our most popular skills and start learning today</p>
          </div>
          
          <Row className="card-grid">
            {featuredSkills.map(skill => (
              <Col lg={4} md={6} key={skill.id} className="mb-4">
                <Card 
                  image={skill.image}
                  title={skill.title}
                  category={skill.category}
                  author={skill.author}
                  rating={skill.rating}
                  description={skill.description}
                  onViewDetails={() => handleShowDetails(skill)}
                />
              </Col>
            ))}
          </Row>
          
          <div className="text-center mt-4">
            <Button 
              variant="primary" 
              href="/discover" 
              icon={<i className="fas fa-arrow-right"></i>}
              className="purple-btn"
              style={{ color: 'white', fontWeight: '600' }}
            >
              View All Skills
            </Button>
          </div>
        </Container>
      </section>
      
      {/* Top Mentors Section */}
      <section className="top-mentors-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Learn from the <span className="accent-text">Best</span></h2>
            <p className="section-subtitle">Connect with our top-rated mentors from around the world</p>
          </div>
          
          <Row className="mentor-grid">
            {topMentors.map(mentor => (
              <Col md={4} key={mentor.id}>
                <div className="mentor-card">
                  <div className="mentor-avatar-container">
                    <img src={mentor.avatar} alt={mentor.name} className="mentor-avatar" />
                    <div className="mentor-rating">
                      <i className="fas fa-star"></i>
                      <span>{mentor.rating}</span>
                    </div>
                  </div>
                  <h3 className="mentor-name">{mentor.name}</h3>
                  <p className="mentor-expertise">{mentor.expertise}</p>
                  <div className="mentor-stats">
                    <div className="mentor-stat">
                      <i className="fas fa-user-graduate"></i>
                      <span>{mentor.students} students</span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      
      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">What Our Users <span className="accent-text">Say</span></h2>
            <p className="section-subtitle">Read success stories from our community members</p>
          </div>
          
          <div className="testimonials-container">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                <i className="fas fa-quote-left"></i>
              </div>
              <p className="testimonial-text">
                SkillCrafter completely transformed my learning experience. The personalized approach and amazing mentors helped me master web development in just three months. I've now landed my dream job as a front-end developer!
              </p>
              <div className="testimonial-author">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Alex Thompson" 
                  className="testimonial-avatar" 
                />
                <div className="testimonial-info">
                  <h4>Alex Thompson</h4>
                  <p>Front-end Developer</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-quote">
                <i className="fas fa-quote-left"></i>
              </div>
              <p className="testimonial-text">
                As someone who struggled to find a mentor in data science, SkillCrafter was a game-changer. The community here is supportive and the guidance I received helped me advance my career to the next level.
              </p>
              <div className="testimonial-author">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="Sophia Martinez" 
                  className="testimonial-avatar" 
                />
                <div className="testimonial-info">
                  <h4>Sophia Martinez</h4>
                  <p>Data Scientist</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-quote">
                <i className="fas fa-quote-left"></i>
              </div>
              <p className="testimonial-text">
                The skill exchange model of SkillCrafter is brilliant. I taught digital marketing while learning coding. This two-way learning experience was incredibly rewarding and cost-effective!
              </p>
              <div className="testimonial-author">
                <img 
                  src="https://randomuser.me/api/portraits/men/65.jpg" 
                  alt="Marcus Johnson" 
                  className="testimonial-avatar" 
                />
                <div className="testimonial-info">
                  <h4>Marcus Johnson</h4>
                  <p>Marketing Specialist</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Join Community Section */}
      <section className="join-section">
        <Container>
          <div className="join-container">
            <div className="join-content">
              <h2>Ready to start your <span className="accent-text">skill-sharing</span> journey?</h2>
              <p>Join our community of learners and mentors today and unlock your full potential through skill exchange.</p>
              <div className="join-actions">
                <Button 
                  variant="primary" 
                  size="lg" 
                  href="/register"
                  icon={<i className="fas fa-user-plus"></i>}
                  iconPosition="left"
                  className="purple-btn"
                  style={{ color: 'white' }}
                >
                  Sign Up Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  href="/discord"
                  className="discord-btn"
                >
                  Join Discord
                </Button>
              </div>
            </div>
            <div className="join-visual">
              <div className="join-shape-1"></div>
              <div className="join-shape-2"></div>
              <div className="join-shape-3"></div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Skill Detail Modal */}
      <SkillDetail 
        show={showModal}
        onHide={handleCloseModal}
        skill={selectedSkill}
      />
    </div>
  );
};

export default Home;
