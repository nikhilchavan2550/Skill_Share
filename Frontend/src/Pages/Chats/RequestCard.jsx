import React from "react";
import Button from "react-bootstrap/Button";
import "./Chats.css";

const RequestCard = ({ 
  request, 
  onAccept, 
  onReject, 
  onDetailClick 
}) => {
  // Handle cases where request structure might be malformed
  if (!request) {
    console.log("Received null request");
    return null;
  }

  console.log("Request structure in RequestCard:", JSON.stringify(request, null, 2));

  // Handle different request structures gracefully
  const sender = request.sender || request.from || request;
  const name = sender.name || sender.fullName || "Unknown User";
  const username = sender.username || "unknown";
  const picture = sender.picture || null;
  const skills = sender.skillsProficientAt || [];
  
  // Make sure we have the sender ID available
  const senderId = sender._id || sender.id || request.sender || request._id;
  console.log("Extracted sender ID:", senderId);
  
  const handleAcceptClick = (e) => {
    e.stopPropagation();
    // Ensure we are passing the full request with sender information
    const enhancedRequest = {
      ...request,
      sender: {
        ...sender,
        _id: senderId
      }
    };
    console.log("Accepting request with enhanced data:", enhancedRequest);
    onAccept(enhancedRequest);
  };

  const handleRejectClick = (e) => {
    e.stopPropagation();
    onReject(request);
  };

  // Default message if not provided
  const message = request.message || "Would like to connect with you!";
  
  return (
    <div className="request-card" onClick={() => onDetailClick(request)}>
      <div className="request-header">
        <img 
          src={picture || `https://ui-avatars.com/api/?name=${name}&background=9C27B0&color=fff`} 
          alt={name} 
          className="request-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${name}&background=9C27B0&color=fff`;
          }}
        />
        <div className="request-details">
          <div className="request-name">{name}</div>
          <div className="request-info">@{username}</div>
        </div>
      </div>
      <div className="request-body">
        <div className="request-message">"{message}"</div>
        {skills.length > 0 && (
          <div className="request-skills">
            {skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="request-skill">{skill}</span>
            ))}
            {skills.length > 3 && (
              <span className="request-skill">+{skills.length - 3} more</span>
            )}
          </div>
        )}
        <div className="request-actions">
          <Button 
            variant="primary" 
            onClick={handleAcceptClick} 
            className="request-accept"
          >
            Accept
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={handleRejectClick}
            className="request-reject"
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
