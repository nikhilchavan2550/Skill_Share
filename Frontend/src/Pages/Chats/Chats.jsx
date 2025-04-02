import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import RequestCard from "./RequestCard";
import "./Chats.css";
import Modal from "react-bootstrap/Modal";
import { FaComment, FaExclamationTriangle, FaEnvelopeOpenText } from "react-icons/fa";

let socket;
const Chats = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);

  const [scheduleModalShow, setScheduleModalShow] = useState(false);
  const [requestModalShow, setRequestModalShow] = useState(false);

  // to store selected chat
  const [selectedChat, setSelectedChat] = useState(null);
  // to store chat messages
  const [chatMessages, setChatMessages] = useState([]);
  // to store chats
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  // to store message
  const [message, setMessage] = useState("");
  // to track errors
  const [chatError, setChatError] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const { user, setUser } = useUser();

  const navigate = useNavigate();

  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    if (user) {
      fetchChats();
      if (activeTab === 'requests') {
        getRequests();
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    const initializeSocket = async () => {
      if (!user) return;
      
      try {
        socket = io(axios.defaults.baseURL);
        socket.emit("setup", user);
        
        socket.on("message recieved", (newMessageReceived) => {
          if (selectedChat && selectedChat.id === newMessageReceived.chatId._id) {
            setChatMessages((prevState) => [...prevState, newMessageReceived]);
          } else {
            // Notify user of new message if not in current chat
            toast.info(`New message from ${newMessageReceived.sender.name}`);
            // Update chats to reflect new message
            fetchChats();
          }
        });
        
        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
          setChatError("Unable to connect to chat server. Please try again later.");
        });
      } catch (error) {
        console.error("Socket initialization error:", error);
      }
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.off("message recieved");
        socket.off("connect_error");
        socket.disconnect();
      }
    };
  }, [selectedChat, user]);

  const fetchChats = async () => {
    try {
      setChatLoading(true);
      setChatError(null);
      const tempUser = user || JSON.parse(localStorage.getItem("userInfo"));
      
      if (!tempUser?._id) {
        throw new Error("User not authenticated");
      }
      
      console.log("Fetching chats for user:", tempUser._id);
      const { data } = await axios.get("/chat");
      
      if (data.success) {
        console.log("Raw chat data:", data.data);
        
        const temp = data.data.map((chat) => {
          const otherUser = chat?.users.find((u) => u?._id !== tempUser?._id);
          console.log("Processing chat:", chat._id, "with other user:", otherUser);
          
          return {
            id: chat._id,
            name: otherUser?.name || "Unknown User",
            picture: otherUser?.picture || null,
            username: otherUser?.username || "unknown",
            latestMessage: chat.latestMessage?.content,
            updatedAt: chat.updatedAt,
          };
        });
        
        console.log("Processed chats:", temp);
        setChats(temp);
        
        // If we just accepted a request, select the new chat
        if (temp.length > 0 && chats.length < temp.length) {
          // Find the newest chat (the one that was just added)
          const newChats = temp.filter(newChat => 
            !chats.some(oldChat => oldChat.id === newChat.id)
          );
          
          if (newChats.length > 0) {
            console.log("New chat detected, selecting:", newChats[0]);
            handleChatClick(newChats[0]);
          }
        }
      } else {
        setChatError("Failed to load chats");
      }
    } catch (err) {
      console.error("Fetch chats error:", err);
      if (err?.response?.data?.message) {
        setChatError(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          navigate("/login");
        }
      } else {
        setChatError(err.message || "Failed to load chats");
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleScheduleClick = () => {
    setScheduleModalShow(true);
  };

  const handleChatClick = async (chatId) => {
    try {
      setChatMessageLoading(true);
      setChatError(null);
      setSelectedChat(chatId);
      
      const { data } = await axios.get(`/message/getMessages/${chatId.id}`);
      
      if (data.success) {
        setChatMessages(data.data);
        socket.emit("join chat", chatId.id);
      } else {
        setChatError("Failed to load messages");
      }
    } catch (err) {
      console.error("Chat messages error:", err);
      if (err?.response?.data?.message) {
        setChatError(err.response.data.message);
      } else {
        setChatError(err.message || "Failed to load messages");
      }
      setChatMessages([]);
    } finally {
      setChatMessageLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    
    const originalMessage = message;
    setMessage("");
    
    try {
      const { data } = await axios.post("/message/sendMessage", {
        content: originalMessage,
        chatId: selectedChat.id,
      });
      
      if (data.success) {
        socket.emit("new message", data.data);
        setChatMessages((prevMessages) => [...prevMessages, data.data]);
        toast.success("Message sent successfully", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          style: { 
            backgroundColor: "#4CAF50",
            color: "white"
          }
        });
      } else {
        toast.error("Failed to send message");
        setMessage(originalMessage); // Restore message if failed
      }
    } catch (err) {
      console.error("Send message error:", err);
      setMessage(originalMessage); // Restore message if failed
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message || "Failed to send message");
      }
    }
  };

  const getRequests = async () => {
    try {
      setRequestLoading(true);
      const { data } = await axios.get("/request/getRequests");
      if (data.success) {
        console.log("Raw request data from server:", data.data);
        
        // Ensure each request has proper sender structure
        const processedRequests = (data.data || []).map(request => {
          // If sender is not an object but a string ID, create a placeholder
          if (typeof request.sender === 'string') {
            console.log(`Request ${request._id} has sender as string ID:`, request.sender);
            return {
              ...request,
              sender: {
                _id: request.sender,
                name: request.senderName || "Unknown User",
                username: request.senderUsername || "unknown",
                picture: request.senderPicture || null
              }
            };
          }
          
          // If sender object exists but doesn't have _id
          if (request.sender && !request.sender._id && request.senderId) {
            console.log(`Fixing sender object for request ${request._id}`);
            return {
              ...request,
              sender: {
                ...request.sender,
                _id: request.senderId
              }
            };
          }
          
          return request;
        });
        
        console.log("Processed requests:", processedRequests);
        setRequests(processedRequests || []);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Get requests error:", err);
      setRequests([]);
      // Only show error toast if it's not a "no requests" scenario
      if (err?.response?.status !== 404) {
        if (err?.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error(err.message || "Failed to load requests");
        }
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedChat(null);
    setChatMessages([]);
  };

  const handleRequestClick = (request) => {
    if (!request) return;
    setSelectedRequest(request);
    setRequestModalShow(true);
  };

  const handleRequestAccept = async (request) => {
    if (!request?._id) {
      toast.error("Invalid request data");
      return;
    }
    
    try {
      setAcceptRequestLoading(true);
      console.log("Accepting request:", request);
      
      // Extract sender ID from various possible structures
      const senderId = request.sender?._id || 
                      (typeof request.sender === 'string' ? request.sender : null) || 
                      request.from?._id;
      
      if (!senderId) {
        console.error("Could not determine sender ID:", request);
        toast.error("Could not determine request sender");
        setAcceptRequestLoading(false);
        return;
      }
      
      console.log("Request ID:", request._id);
      console.log("Sender ID:", senderId);
      
      const { data } = await axios.post("/request/acceptRequest", {
        requestId: request._id,
        senderId: senderId
      });
      
      toast.success(data.message || "Request accepted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        style: { 
          backgroundColor: "#4CAF50",
          color: "white"
        }
      });
      
      // Close the modal first
      setRequestModalShow(false);
      
      // Switch to the chats tab
      setActiveTab('chats');
      
      // Refresh the data
      await getRequests();
      await fetchChats();
    } catch (err) {
      console.error("Accept request error:", err);
      console.error("Error details:", err.response?.data);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message || "Failed to accept request");
      }
    } finally {
      setAcceptRequestLoading(false);
    }
  };

  const handleRequestReject = async (request) => {
    if (!request?._id) {
      toast.error("Invalid request data");
      return;
    }
    
    try {
      console.log("Rejecting request:", request);
      const { data } = await axios.post("/request/rejectRequest", {
        requestId: request._id,
      });
      toast.success(data.message || "Request rejected successfully");
      getRequests();
      setRequestModalShow(false);
    } catch (err) {
      console.error("Reject request error:", err);
      console.error("Error details:", err.response?.data);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message || "Failed to reject request");
      }
    } finally {
      setAcceptRequestLoading(false);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-tabs">
          <div 
            className={`chat-tab ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => handleTabClick('chats')}
          >
            <FaComment className="tab-icon" /> Chats
          </div>
          <div 
            className={`chat-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => handleTabClick('requests')}
          >
            <FaEnvelopeOpenText className="tab-icon" /> Requests
          </div>
        </div>

        {/* Chat List */}
        {activeTab === 'chats' && (
          chatLoading ? (
            <div className="empty-state">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : chats.length > 0 ? (
            <ul className="chat-list">
              {chats.map((chat) => (
                <li 
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => handleChatClick(chat)}
                >
                  <div className="chat-avatar">
                    {chat.picture ? (
                      <img 
                        src={chat.picture} 
                        alt={chat.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://ui-avatars.com/api/?name=" + chat.name + "&background=9C27B0&color=fff";
                        }}
                      />
                    ) : (
                      <div className="default-avatar">
                        {chat.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="chat-details">
                    <h4>{chat.name}</h4>
                    <p>{chat.latestMessage || "No messages yet"}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <FaComment className="empty-icon" />
              <p>No chats yet</p>
              <small>Start a conversation by browsing the discover page</small>
            </div>
          )
        )}

        {/* Request List */}
        {activeTab === 'requests' && (
          requestLoading ? (
            <div className="empty-state">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading requests...</p>
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="request-list">
              {requests.map((request) => (
                <RequestCard 
                  key={request._id}
                  request={request}
                  onDetailClick={handleRequestClick}
                  onAccept={handleRequestAccept}
                  onReject={handleRequestReject}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaEnvelopeOpenText className="empty-icon" />
              <p>No Connection Requests</p>
              <small>You don't have any pending connection requests</small>
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/discover')}
                >
                  Browse Users
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="chat-user">
                {selectedChat.picture ? (
                  <img 
                    src={selectedChat.picture} 
                    alt={selectedChat.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=" + selectedChat.name + "&background=9C27B0&color=fff";
                    }}
                  />
                ) : (
                  <div className="default-avatar">
                    {selectedChat.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3>{selectedChat.name}</h3>
              </div>
              <Button variant="outline-primary" onClick={handleScheduleClick}>
                Schedule
              </Button>
            </div>

            <div className="chat-messages">
              {chatMessageLoading ? (
                <div className="loading-messages">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : chatError ? (
                <div className="error-state">
                  <FaExclamationTriangle className="error-icon" />
                  <p>{chatError}</p>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleChatClick(selectedChat)}
                  >
                    Try Again
                  </Button>
                </div>
              ) : chatMessages.length > 0 ? (
                <ScrollableFeed>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${
                        msg.sender._id === user?._id ? "sent" : "received"
                      }`}
                    >
                      <div className="message-content">
                        {msg.content}
                        <span className="message-time">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </ScrollableFeed>
              ) : (
                <div className="no-messages">
                  <p>No messages yet</p>
                  <small>Start a conversation with {selectedChat.name}</small>
                </div>
              )}
            </div>

            <Form className="message-form" onSubmit={sendMessage}>
              <Form.Control
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" variant="primary">
                Send
              </Button>
            </Form>
          </>
        ) : (
          <div className="no-chat-selected">
            <FaComment className="big-icon" />
            <h3>Welcome to Messages</h3>
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      <Modal
        show={requestModalShow}
        onHide={() => setRequestModalShow(false)}
        centered
        className="chat-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chat Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest ? (
            <div className="request-detail">
              <h4>
                {selectedRequest.sender?.name || selectedRequest.name || selectedRequest.from?.name || "Someone"} 
                wants to connect with you
              </h4>
              <p>{selectedRequest.message || "Would like to connect with you!"}</p>
              
              {/* Display skills from sender object if available */}
              {(selectedRequest.sender?.skillsProficientAt?.length > 0 || selectedRequest.skillsProficientAt?.length > 0) && (
                <div className="request-skills mt-3">
                  <small className="text-muted">Skills:</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {(selectedRequest.sender?.skillsProficientAt || selectedRequest.skillsProficientAt || []).slice(0, 5).map((skill, i) => (
                      <span key={i} className="badge bg-primary">{skill}</span>
                    ))}
                    {(selectedRequest.sender?.skillsProficientAt?.length > 5 || selectedRequest.skillsProficientAt?.length > 5) && (
                      <span className="badge bg-secondary">
                        +{Math.max(
                          (selectedRequest.sender?.skillsProficientAt?.length || 0), 
                          (selectedRequest.skillsProficientAt?.length || 0)
                        ) - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center">Request information not available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              if (selectedRequest) {
                handleRequestReject(selectedRequest);
              } else {
                setRequestModalShow(false);
              }
            }}
          >
            Decline
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (selectedRequest) {
                handleRequestAccept(selectedRequest);
              } else {
                setRequestModalShow(false);
              }
            }}
            disabled={acceptRequestLoading || !selectedRequest}
          >
            {acceptRequestLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="sr-only">Loading...</span>
              </>
            ) : (
              "Accept"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        show={scheduleModalShow}
        onHide={() => setScheduleModalShow(false)}
        centered
        className="chat-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Schedule a Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={scheduleForm.date}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, date: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                value={scheduleForm.time}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, time: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setScheduleModalShow(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setScheduleModalShow(false);
              const scheduledTime = `${scheduleForm.date} at ${scheduleForm.time}`
            }}
          >
            Schedule
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Chats;