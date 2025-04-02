import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import "./Card.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../util/UserContext";

const ProfileCard = ({ profileImageUrl, bio, name, skills, rating, username, _id }) => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const { user } = useUser();

  // Fetch the user's full data to get the _id
  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      
      try {
        const { data } = await axios.get(`/user/registered/getDetails/${username}`);
        if (data.success && data.data) {
          setUserData(data.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    if (!_id) {
      fetchUserData();
    }
  }, [username, _id]);

  // Generate consistent random avatar based on username
  const getRandomAvatar = () => {
    // Use username to determine gender and id
    const gender = username?.length % 2 === 0 ? 'women' : 'men';
    const id = Math.abs(username?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 99) || 50;
    return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
  };

  const handleConnect = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    // Use the passed _id or the fetched userData._id
    const receiverId = _id || (userData?._id);
    
    if (!receiverId) {
      toast.error("Cannot connect at this time. Please try again later.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/request/create", {
        receiverID: receiverId,
        message: message
      });
      toast.success(data.message || "Connection request sent successfully!");
      setShowModal(false);
      setMessage("");
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to send request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card-container">
        <div className="card-content">
          <div className="profile-header">
            <div className="avatar-container">
              <img 
                className="profile-avatar" 
                src={profileImageUrl || getRandomAvatar()} 
                alt={name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getRandomAvatar();
                }}
              />
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{name}</h3>
              <div className="profile-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(rating) ? "star filled" : "star"}>★</span>
                ))}
              </div>
            </div>
          </div>
          
          <p className="profile-bio">{bio || "No bio available"}</p>
          
          <div className="profskills">
            <h6>Skills</h6>
            <div className="profskill-boxes">
              {skills?.length > 0 ? (
                skills.slice(0, 3).map((skill, index) => (
                  <div key={index} className="profskill-box">
                    <span className="skill">{skill}</span>
                  </div>
                ))
              ) : (
                <p className="no-skills">No skills listed</p>
              )}
              {skills?.length > 3 && (
                <div className="profskill-box more">
                  <span className="skill">+{skills.length - 3}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-actions">
            {user && user.username !== username && (
              <button 
                className="connect-btn" 
                onClick={() => setShowModal(true)}
              >
                Connect
              </button>
            )}
            <Link to={`/profile/${username}`} className="view-profile-link">
              <button className="view-profile-btn">View Profile</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="connect-modal">
        <Modal.Header closeButton>
          <Modal.Title>Connect with {name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder={`Tell ${name} why you want to connect...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline" 
            onClick={() => setShowModal(false)}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConnect}
            disabled={loading}
            className="send-btn"
          >
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileCard;
