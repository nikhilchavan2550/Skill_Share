import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { skills } from "./Skills";
import axios from "axios";
import "./EditProfile.css";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../util/UserContext";
import { FaUser, FaGraduationCap, FaBriefcase, FaUserCog } from "react-icons/fa";
import defaultAvatar from "../../assets/images/default-avatar.svg";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const { user, setUser } = useUser();

  // Get active tab from URL or default to profile
  const [activeTab, setActiveTab] = useState('profile');

  const [form, setForm] = useState({
    profilePhoto: null,
    name: "",
    email: "",
    username: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    skillsProficientAt: [],
    skillsToLearn: [],
    education: [
      {
        id: uuidv4(),
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        score: "",
        description: "",
      },
    ],
    bio: "",
    projects: [],
  });
  const [skillsProficientAt, setSkillsProficientAt] = useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn] = useState("Select some skill");
  const [techStack, setTechStack] = useState([]);

  const [activeKey, setActiveKey] = useState("registration");

  // Set debug mode to false and remove debug controls
  const [debugMode, setDebugMode] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState("/user/registered/saveRegDetails");

  useEffect(() => {
    if (user) {
      setForm((prevState) => ({
        ...prevState,
        name: user?.name,
        email: user?.email,
        username: user?.username,
        skillsProficientAt: user?.skillsProficientAt || [],
        skillsToLearn: user?.skillsToLearn || [],
        portfolioLink: user?.portfolioLink,
        githubLink: user?.githubLink,
        linkedinLink: user?.linkedinLink,
        education: user?.education || [],
        bio: user?.bio,
        projects: user?.projects || [],
        picture: user?.picture,
      }));
      setTechStack(user?.projects?.map((project) => "Select some Tech Stack") || []);
    }
  }, [user]);

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab", "Preview"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prevState) => ({
        ...prevState,
        [name]: checked ? [...prevState[name], value] : prevState[name].filter((item) => item !== value),
      }));
    } else {
      if (name === "bio" && value.length > 500) {
        toast.error("Bio should be less than 500 characters");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleAddSkill = (e) => {
    const { name } = e.target;
    if (name === "skill_to_learn") {
      if (skillsToLearn === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsToLearn.includes(skillsToLearn)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsProficientAt.includes(skillsToLearn)) {
        toast.error("Skill already added in skills proficient at");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: [...prevState.skillsToLearn, skillsToLearn],
      }));
    } else {
      if (skillsProficientAt === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsProficientAt.includes(skillsProficientAt)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsToLearn.includes(skillsProficientAt)) {
        toast.error("Skill already added in skills to learn");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: [...prevState.skillsProficientAt, skillsProficientAt],
      }));
    }
  };

  const handleRemoveSkill = (e, type) => {
    const skill = e.target.getAttribute('data-skill');
    if (type === "skills_proficient_at") {
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: prevState.skillsProficientAt.filter((item) => item !== skill),
      }));
    } else {
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: prevState.skillsToLearn.filter((item) => item !== skill),
      }));
    }
  };

  const handleRemoveEducation = (tid) => {
    const updatedEducation = form.education.filter((item) => (item._id !== tid && item.id !== tid));
    setForm((prevState) => ({
      ...prevState,
      education: updatedEducation,
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    
    // Special handling for score field
    if (name === "score") {
      console.log("Updating score value:", value);
    }
    
    setForm((prevState) => {
      const updatedEducation = prevState.education.map((item, i) => {
        if (i === index) {
          return { ...item, [name]: value };
        }
        return item;
      });
      
      console.log("Updated education:", updatedEducation);
      return {
        ...prevState,
        education: updatedEducation
      };
    });
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  // Helper function to ensure proper date formatting
  const formatDate = (dateString) => {
    if (!dateString) {
      return new Date().toISOString().split('T')[0]; // Default to today
    }
    
    try {
      // Handle different date formats
      let date;
      if (dateString.includes('T')) {
        // If it's already in ISO format
        date = new Date(dateString);
      } else if (dateString.includes('-') || dateString.includes('/')) {
        // If it's in date string format like YYYY-MM-DD or MM/DD/YYYY
        date = new Date(dateString);
      } else {
        // If it's a timestamp
        date = new Date(parseInt(dateString));
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}, using current date`);
        return new Date().toISOString().split('T')[0];
      }
      
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date().toISOString().split('T')[0]; // Default to today
    }
  };

  const validateRegForm = () => {
    if (!form.username) {
      toast.error("Username is empty");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Enter at least one skill you are proficient at");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Enter at least one skill you want to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error("Enter at least one link among portfolio, github and linkedin");
      return false;
    }
    const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.githubLink && githubRegex.test(form.githubLink) === false) {
      toast.error("Enter a valid github link");
      return false;
    }
    const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.linkedinLink && linkedinRegex.test(form.linkedinLink) === false) {
      toast.error("Enter a valid linkedin link");
      return false;
    }
    if (form.portfolioLink && form.portfolioLink.includes("http") === false) {
      toast.error("Enter a valid portfolio link");
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateRegForm()) return;
    
    try {
      setSaveLoading(true);
      toast.info("Saving your profile changes...");
      
      // Format dates properly for backend
      const cleanedEducation = form.education.map(edu => ({
        ...(edu._id ? { _id: edu._id } : {}), // Keep the _id if it exists for existing records
        id: edu.id || uuidv4(),
        institution: edu.institution || '',
        degree: edu.degree || '',
        startDate: formatDate(edu.startDate),
        endDate: formatDate(edu.endDate),
        score: edu.score || '',
        description: edu.description || ''
      }));
      
      const cleanedProjects = form.projects.map(proj => ({
        ...(proj._id ? { _id: proj._id } : {}), // Keep the _id if it exists for existing records
        id: proj.id || uuidv4(),
        title: proj.title || '',
        startDate: formatDate(proj.startDate),
        endDate: formatDate(proj.endDate),
        projectUrl: proj.projectUrl || '',
        techStack: proj.techStack || [],
        description: proj.description || ''
      }));
      
      // Prepare the request data
      const requestData = {
        name: form.name,
        username: form.username,
        skillsProficientAt: form.skillsProficientAt,
        skillsToLearn: form.skillsToLearn,
        portfolioLink: form.portfolioLink,
        githubLink: form.githubLink,
        linkedinLink: form.linkedinLink,
        bio: form.bio,
        education: cleanedEducation,
        projects: cleanedProjects,
        picture: form.picture
      };
      
      console.log("Using API endpoint:", apiEndpoint);
      
      // Make the API call - but don't redirect on success
      const response = await axios.post(apiEndpoint, requestData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token if available
        }
      });
      console.log("Full server response:", response);
      
      const { data } = response;
      console.log("Server response data:", data);
      
      // Check if the response has the expected structure
      if (data && (data.success === true || data.status === "success")) {
        // Update the local user data to reflect changes immediately
        const userData = data.data || data.user || data;
        
        console.log("User data to be saved:", userData);
        
        setUser(userData);
        
        // Remove localStorage/navigation logic that was causing infinite refresh
        if (userData) {
          localStorage.setItem("userInfo", JSON.stringify(userData));
          
          // Show success message but don't redirect automatically
          toast.success("Profile updated successfully!");
          setSaveLoading(false);
          
          // Return true to indicate success for any calling functions
          return true;
        }
      } else {
        console.error("Unexpected response format:", data);
        toast.error("Failed to update profile: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        
        if (error.response.status === 401) {
          toast.error("Your session has expired. Please login again.");
          // Clear token and user data
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          setUser(null);
          // Redirect to login
          navigate('/login');
        } else if (error.response.data?.message) {
          toast.error(`Error: ${error.response.data.message}`);
        } else if (error.response.status === 413) {
          toast.error("The data you're trying to save is too large. Try uploading smaller images or reduce the amount of content.");
        } else {
          toast.error(`Server error (${error.response.status}). Please try again.`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Check your internet connection.");
      } else {
        console.error("Error message:", error.message);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSaveLoading(false);
    }
    
    // Return false to indicate failure for any calling functions
    return false;
  };

  // Function to use native fetch instead of axios
  const tryNativeFetch = async () => {
    try {
      setSaveLoading(true);
      toast.info(`Trying native fetch POST to ${apiEndpoint}...`);
      console.log("Debug - Trying fetch POST to endpoint:", apiEndpoint);
      
      // Prepare the data payload
      const cleanedEducation = form.education.map(edu => ({
        ...(edu._id ? { _id: edu._id } : {}),
        id: edu.id || uuidv4(),
        institution: edu.institution || '',
        degree: edu.degree || '',
        startDate: formatDate(edu.startDate),
        endDate: formatDate(edu.endDate),
        score: edu.score || '',
        description: edu.description || ''
      }));
      
      const cleanedProjects = form.projects.map(proj => ({
        ...(proj._id ? { _id: proj._id } : {}),
        id: proj.id || uuidv4(),
        title: proj.title || '',
        startDate: formatDate(proj.startDate),
        endDate: formatDate(proj.endDate),
        projectUrl: proj.projectUrl || '',
        techStack: proj.techStack || [],
        description: proj.description || ''
      }));
      
      const requestData = {
        name: form.name,
        username: form.username,
        skillsProficientAt: form.skillsProficientAt,
        skillsToLearn: form.skillsToLearn,
        portfolioLink: form.portfolioLink,
        githubLink: form.githubLink,
        linkedinLink: form.linkedinLink,
        bio: form.bio,
        education: cleanedEducation,
        projects: cleanedProjects
      };
      
      console.log("Debug - Request data:", JSON.stringify(requestData, null, 2));
      
      // Use native fetch with POST
      const fetchResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token if available
        },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      
      console.log("Debug - Fetch response status:", fetchResponse.status);
      console.log("Debug - Fetch response headers:", Object.fromEntries([...fetchResponse.headers]));
      
      // Clone the response for logging
      const responseClone = fetchResponse.clone();
      const responseText = await responseClone.text();
      console.log("Debug - Response text:", responseText);
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Debug - Parsed JSON:", data);
      } catch (e) {
        console.log("Debug - Could not parse response as JSON, using text response");
        data = { success: fetchResponse.ok, message: responseText };
      }
      
      if (fetchResponse.ok || data.success || data.status === 'success') {
        toast.success("Profile updated successfully with fetch!");
        
        // Update user data if available
        const userData = data.data || data.user || data;
        if (userData && typeof userData === 'object') {
          setUser(userData);
          localStorage.setItem("userInfo", JSON.stringify(userData));
          
          setTimeout(() => {
            navigate(`/profile/${userData.username}`);
          }, 1000);
        } else {
          // If no user data in response but request was successful
          toast.info("Request successful but no user data returned. Refreshing profile...");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        
        return true;
      } else {
        toast.error("Fetch POST failed: " + (data.message || fetchResponse.statusText || "Unknown error"));
      }
    } catch (error) {
      console.error("Fetch POST error:", error);
      toast.error("Error with fetch POST: " + error.message);
    } finally {
      setSaveLoading(false);
    }
    
    return false;
  };
  
  const tryMultipleEndpoints = async () => {
    setSaveLoading(true);
    toast.info("Testing multiple endpoints - this may take a moment...");
    
    const endpoints = [
      '/user/registered/saveRegDetails',
      '/user/registered/saveEduDetail',
      '/user/registered/saveAddDetail',
      '/user/registered/getDetails',
      '/user/uploadPicture'
    ];
    
    // Prepare the data payload
    const cleanedEducation = form.education.map(edu => ({
      ...(edu._id ? { _id: edu._id } : {}),
      id: edu.id || uuidv4(),
      institution: edu.institution || '',
      degree: edu.degree || '',
      startDate: formatDate(edu.startDate),
      endDate: formatDate(edu.endDate),
      score: edu.score || '',
      description: edu.description || ''
    }));
    
    const cleanedProjects = form.projects.map(proj => ({
      ...(proj._id ? { _id: proj._id } : {}),
      id: proj.id || uuidv4(),
      title: proj.title || '',
      startDate: formatDate(proj.startDate),
      endDate: formatDate(proj.endDate),
      projectUrl: proj.projectUrl || '',
      techStack: proj.techStack || [],
      description: proj.description || ''
    }));
    
    const requestData = {
      name: form.name,
      username: form.username,
      skillsProficientAt: form.skillsProficientAt,
      skillsToLearn: form.skillsToLearn,
      portfolioLink: form.portfolioLink,
      githubLink: form.githubLink,
      linkedinLink: form.linkedinLink,
      bio: form.bio,
      education: cleanedEducation,
      projects: cleanedProjects
    };
    
    console.log("Debug - Starting multi-endpoint test with data:", JSON.stringify(requestData, null, 2));
    
    // Test each endpoint with both PUT and POST
    for (const endpoint of endpoints) {
      console.log(`Debug - Testing endpoint: ${endpoint}`);
      
      // Try PUT method first
      try {
        toast.info(`Trying PUT to ${endpoint}...`);
        
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token if available
          },
          body: JSON.stringify(requestData),
          credentials: 'include'
        });
        
        console.log(`Debug - ${endpoint} PUT status:`, response.status);
        
        if (response.ok) {
          let data;
          try {
            data = await response.json();
            console.log(`Debug - ${endpoint} PUT response:`, data);
          } catch (e) {
            const text = await response.text();
            console.log(`Debug - ${endpoint} PUT text response:`, text);
            data = { success: true };
          }
          
          if (data.success || data.status === 'success' || response.ok) {
            toast.success(`Endpoint ${endpoint} with PUT worked!`);
            
            // Update user data if available
            const userData = data.data || data.user || data;
            if (userData && typeof userData === 'object') {
              setUser(userData);
              localStorage.setItem("userInfo", JSON.stringify(userData));
              
              // Set as default endpoint
              setApiEndpoint(endpoint);
              toast.info(`Setting ${endpoint} as default endpoint`);
              
              setTimeout(() => {
                navigate(`/profile/${userData.username}`);
              }, 1000);
            } else {
              // If no user data in response but request was successful
              toast.info("Request successful but no user data returned. Refreshing profile...");
              setApiEndpoint(endpoint);
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            
            return true;
          }
        }
      } catch (error) {
        console.error(`Debug - ${endpoint} PUT error:`, error);
      }
      
      // Try POST method next
      try {
        toast.info(`Trying POST to ${endpoint}...`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token if available
          },
          body: JSON.stringify(requestData),
          credentials: 'include'
        });
        
        console.log(`Debug - ${endpoint} POST status:`, response.status);
        
        if (response.ok) {
          let data;
          try {
            data = await response.json();
            console.log(`Debug - ${endpoint} POST response:`, data);
          } catch (e) {
            const text = await response.text();
            console.log(`Debug - ${endpoint} POST text response:`, text);
            data = { success: true };
          }
          
          if (data.success || data.status === 'success' || response.ok) {
            toast.success(`Endpoint ${endpoint} with POST worked!`);
            
            // Update user data if available
            const userData = data.data || data.user || data;
            if (userData && typeof userData === 'object') {
              setUser(userData);
              localStorage.setItem("userInfo", JSON.stringify(userData));
              
              // Set as default endpoint
              setApiEndpoint(endpoint);
              toast.info(`Setting ${endpoint} as default endpoint`);
              
              setTimeout(() => {
                navigate(`/profile/${userData.username}`);
              }, 1000);
            } else {
              // If no user data in response but request was successful
              toast.info("Request successful but no user data returned. Refreshing profile...");
              setApiEndpoint(endpoint);
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            
            return true;
          }
        }
      } catch (error) {
        console.error(`Debug - ${endpoint} POST error:`, error);
      }
    }
    
    // If we get here, all endpoints failed
    toast.error("All endpoints failed. Check network tab for details.");
    setSaveLoading(false);
    return false;
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-content">
        {/* Sidebar */}
        <div className="edit-profile-sidebar">
          <ul className="edit-profile-nav">
            <li 
              className={`edit-profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="edit-profile-nav-icon"><FaUser /></span>
              Profile Information
            </li>
            <li 
              className={`edit-profile-nav-item ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <span className="edit-profile-nav-icon"><FaGraduationCap /></span>
              Education
            </li>
            <li 
              className={`edit-profile-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <span className="edit-profile-nav-icon"><FaBriefcase /></span>
              Projects
            </li>
            <li 
              className={`edit-profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="edit-profile-nav-icon"><FaUserCog /></span>
              Account Settings
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="edit-profile-main" data-tab={activeTab}>
          {activeTab === 'profile' && (
            <>
              <div className="edit-profile-header">
                <h2 className="edit-profile-title">Profile Information</h2>
                <p className="edit-profile-subtitle">Update your personal information and how others see you on the platform</p>
              </div>

              <div className="profile-image-container">
                <img 
                  src={form.picture || defaultAvatar} 
                  alt="Profile" 
                  className="profile-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
                <div className="profile-image-actions">
                  <form 
                    id="profile-pic-form" 
                    encType="multipart/form-data" 
                    style={{ display: 'inline' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fileInput = document.getElementById('profile-image-upload');
                      
                      // Check if file is selected
                      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                        toast.error("Please select an image file first");
                        return;
                      }
                      
                      // Show upload in progress toast
                      const toastId = toast.info(
                        <div>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading your profile picture...
                        </div>, 
                        { autoClose: false }
                      );
                      
                      // Set local loading state
                      setLoading(true);
                      
                      // Log file info for debugging
                      const file = fileInput.files[0];
                      console.log("Image upload - File details:", {
                        name: file.name,
                        type: file.type,
                        size: `${(file.size / 1024).toFixed(2)} KB`
                      });
                      
                      // Create FormData object with the file
                      const formData = new FormData();
                      formData.append("picture", file);
                      
                      // Get token for authorization
                      const token = localStorage.getItem('token');
                      console.log("Token for authentication:", token ? "Found" : "Not found");
                      
                      // Function to handle successful upload
                      const handleSuccess = (imageUrl) => {
                        console.log("Upload successful! Image URL:", imageUrl);
                        
                        // Update UI immediately
                        document.querySelector('.profile-image').src = imageUrl;
                        
                        // Update form state
                        setForm(prevForm => ({
                          ...prevForm,
                          picture: imageUrl
                        }));
                        
                        // Update user context
                        setUser(prev => ({
                          ...prev,
                          picture: imageUrl
                        }));
                        
                        // Update localStorage
                        try {
                          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                          userInfo.picture = imageUrl;
                          localStorage.setItem('userInfo', JSON.stringify(userInfo));
                        } catch (err) {
                          console.error("Error updating userInfo in localStorage:", err);
                        }
                        
                        // Save the new profile picture URL to the backend database
                        axios.post(apiEndpoint, { picture: imageUrl }, {
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        })
                        .then(response => {
                          console.log("Profile picture URL saved to database:", response.data);
                          
                          // Do a complete profile save to ensure the picture is saved with all other profile data
                          setTimeout(() => {
                            handleSaveProfile().then(success => {
                              if (success) {
                                console.log("Full profile saved with new picture");
                              } else {
                                console.error("Failed to save full profile with new picture");
                              }
                            });
                          }, 500);
                        })
                        .catch(error => {
                          console.error("Failed to save profile picture URL to database:", error);
                          // Try one more time with a different endpoint if the first one fails
                          axios.post("/user/registered/saveRegDetails", { picture: imageUrl }, {
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          })
                          .then(response => {
                            console.log("Profile picture URL saved to database (fallback):", response.data);
                            
                            // Do a complete profile save to ensure the picture is saved with all other profile data
                            setTimeout(() => {
                              handleSaveProfile().then(success => {
                                if (success) {
                                  console.log("Full profile saved with new picture");
                                } else {
                                  console.error("Failed to save full profile with new picture");
                                }
                              });
                            }, 500);
                          })
                          .catch(err => {
                            console.error("Failed to save profile picture URL using fallback:", err);
                          });
                        });
                        
                        // Show success message
                        toast.update(toastId, {
                          render: "Profile picture updated successfully!",
                          type: "success",
                          autoClose: 3000
                        });
                        
                        // Reset loading state
                        setLoading(false);
                      };
                      
                      // Get the backend API URL from environment or default
                      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                      console.log("Using backend URL for upload:", backendUrl);
                      
                      // Direct fetch upload attempt
                      fetch(`${backendUrl}/user/uploadPicture`, {
                        method: 'POST',
                        headers: {
                          'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: formData,
                        credentials: 'include'
                      })
                      .then(response => {
                        console.log("Upload response status:", response.status);
                        
                        if (!response.ok) {
                          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                        }
                        
                        return response.json();
                      })
                      .then(data => {
                        console.log("Upload response data:", data);
                        
                        if (data && data.success && data.data && data.data.url) {
                          handleSuccess(data.data.url);
                        } else {
                          throw new Error("Invalid response format");
                        }
                      })
                      .catch(error => {
                        console.error("First upload attempt failed:", error);
                        
                        // Try with /api prefix removed as fallback
                        console.log("Trying fallback upload with direct URL...");
                        
                        // Get base API URL without /api prefix
                        const directUrl = backendUrl.replace(/\/api$/, '');
                        console.log("Using direct URL for fallback:", directUrl);
                        
                        return fetch(`${directUrl}/user/uploadPicture`, {
                          method: 'POST',
                          headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                          },
                          body: formData,
                          credentials: 'include'
                        })
                        .then(response => {
                          console.log("Fallback response status:", response.status);
                          
                          if (!response.ok) {
                            throw new Error(`Fallback server returned ${response.status}: ${response.statusText}`);
                          }
                          
                          return response.json();
                        })
                        .then(data => {
                          console.log("Fallback response data:", data);
                          
                          if (data && data.success && data.data && data.data.url) {
                            handleSuccess(data.data.url);
                          } else {
                            toast.update(toastId, {
                              render: "Upload succeeded but returned unexpected data",
                              type: "warning",
                              autoClose: 5000
                            });
                            setLoading(false);
                          }
                        })
                        .catch(fallbackError => {
                          // Both attempts failed
                          console.error("Both upload attempts failed:", fallbackError);
                          
                          toast.update(toastId, {
                            render: "Failed to upload image. Please try again or contact support.",
                            type: "error", // Using string instead of toast.TYPE.ERROR to fix TypeError
                            autoClose: 5000
                          });
                          
                          setLoading(false);
                        });
                      });
                    }}
                  >
                    <input
                      type="file"
                      id="profile-image-upload"
                      name="picture"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={() => {
                        // Auto-submit form when file is selected
                        document.getElementById('profile-pic-form').dispatchEvent(
                          new Event('submit', { cancelable: true, bubbles: true })
                        );
                      }}
                    />
                    <label 
                      htmlFor="profile-image-upload" 
                      className="btn btn-profile-primary"
                      style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading...
                        </>
                      ) : "Change Photo"}
                    </label>
                  </form>
                  <button 
                    className="btn btn-profile-outline"
                    style={{ backgroundColor: '#FF5722', color: 'white' }}
                    onClick={() => {
                      // Only remove if there is a picture
                      if (form.picture) {
                        setForm(prevForm => ({
                          ...prevForm,
                          picture: null
                        }));
                        
                        setUser(prev => ({
                          ...prev,
                          picture: null
                        }));
                        
                        // Update UI immediately
                        document.querySelector('.profile-image').src = defaultAvatar;
                        
                        toast.success("Profile picture removed");
                      }
                    }}
                    disabled={loading}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={form.username}
                  onChange={handleInputChange}
                  placeholder="Your username"
                />
                <div className="form-text">This will be used in your profile URL</div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="Your email address"
                  disabled
                />
                <div className="form-text">Your email cannot be changed</div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="form-control"
                  value={form.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                ></textarea>
                <div className="form-text">
                  {form.bio ? form.bio.length : 0}/500 characters
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Social Links</label>
                <div className="mb-3">
                  <input
                    type="text"
                    name="portfolioLink"
                    className="form-control"
                    value={form.portfolioLink}
                    onChange={handleInputChange}
                    placeholder="Portfolio URL"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    name="githubLink"
                    className="form-control"
                    value={form.githubLink}
                    onChange={handleInputChange}
                    placeholder="GitHub URL"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="linkedinLink"
                    className="form-control"
                    value={form.linkedinLink}
                    onChange={handleInputChange}
                    placeholder="LinkedIn URL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills I'm Proficient At</label>
                <div className="d-flex mb-2">
                  <Form.Select 
                    aria-label="Default select example"
                    className="form-control me-2"
                    onChange={(e) => setSkillsProficientAt(e.target.value)}
                  >
                    <option>Select some skill</option>
                    {skills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </Form.Select>
                  <button 
                    className="btn"
                    name="skill_proficient_at"
                    onClick={handleAddSkill}
                    style={{ backgroundColor: '#FF5722', color: 'white', borderColor: '#FF7043' }}
                  >
                    Add
                  </button>
                </div>
                
                <div className="skill-tags">
                  {form.skillsProficientAt?.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      <button 
                        className="skill-tag-remove" 
                        onClick={(e) => handleRemoveSkill(e, "skills_proficient_at")}
                        data-skill={skill}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills I Want to Learn</label>
                <div className="d-flex mb-2">
                  <Form.Select 
                    aria-label="Default select example"
                    className="form-control me-2"
                    onChange={(e) => setSkillsToLearn(e.target.value)}
                  >
                    <option>Select some skill</option>
                    {skills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </Form.Select>
                  <button 
                    className="btn"
                    name="skill_to_learn"
                    onClick={handleAddSkill}
                    style={{ backgroundColor: '#FF5722', color: 'white', borderColor: '#FF7043' }}
                  >
                    Add
                  </button>
                </div>
                
                <div className="skill-tags">
                  {form.skillsToLearn?.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      <button 
                        className="skill-tag-remove" 
                        onClick={(e) => handleRemoveSkill(e, "skills_to_learn")}
                        data-skill={skill}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-profile-outline" 
                  onClick={() => navigate('/profile/' + user?.username)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-profile-primary"
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button 
                  className="btn btn-profile-secondary"
                  onClick={async () => {
                    // First attempt to save and wait for result
                    const success = await handleSaveProfile();
                    // Only navigate if save was successful
                    if (success && user?.username) {
                      navigate('/profile/' + user?.username);
                    } else if (success) {
                      // Fallback if username is missing but save succeeded
                      navigate('/discover');
                      toast.info("Profile updated but couldn't navigate to your profile page");
                    }
                  }}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save and View Profile"
                  )}
                </button>
              </div>
            </>
          )}

          {activeTab === 'education' && (
            <>
              <div className="edit-profile-header">
                <h2 className="edit-profile-title">Education</h2>
                <p className="edit-profile-subtitle">Add or update your educational background</p>
              </div>
              
              {form.education.map((edu, index) => (
                <div key={index} className="education-entry p-3 mb-4 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" style={{ fontFamily: "'Nunito', sans-serif" }}>Education #{index + 1}</h4>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => handleRemoveEducation(edu._id || edu.id)}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label className="form-label">Institution</label>
                      <input
                        type="text"
                        name="institution"
                        className="form-control"
                        value={edu.institution || ''}
                        onChange={(e) => handleEducationChange(e, index)}
                        placeholder="University/College name"
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">Degree</label>
                      <input
                        type="text"
                        name="degree"
                        className="form-control"
                        value={edu.degree || ''}
                        onChange={(e) => handleEducationChange(e, index)}
                        placeholder="E.g., Bachelor of Science"
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        value={edu.startDate ? edu.startDate.substring(0, 10) : ''}
                        onChange={(e) => handleEducationChange(e, index)}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        className="form-control"
                        value={edu.endDate ? edu.endDate.substring(0, 10) : ''}
                        onChange={(e) => handleEducationChange(e, index)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Score/GPA</label>
                    <input
                      type="text"
                      name="score"
                      className="form-control"
                      value={edu.score || ''}
                      onChange={(e) => handleEducationChange(e, index)}
                      placeholder="E.g., 3.8/4.0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={edu.description || ''}
                      onChange={(e) => handleEducationChange(e, index)}
                      placeholder="Describe your studies, achievements, etc."
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <button 
                className="btn btn-profile-teal mb-4"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setForm(prev => ({
                    ...prev,
                    education: [
                      ...prev.education,
                      {
                        id: uuidv4(),
                        institution: "",
                        degree: "",
                        startDate: today,
                        endDate: today,
                        score: "",
                        description: ""
                      }
                    ]
                  }));
                }}
              >
                <i className="fas fa-plus-circle me-2"></i>
                Add Education
              </button>
              
              <div className="form-actions">
                <button 
                  className="btn btn-profile-outline" 
                  onClick={() => navigate('/profile/' + user?.username)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-profile-primary"
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button 
                  className="btn btn-profile-secondary"
                  onClick={async () => {
                    // First attempt to save and wait for result
                    const success = await handleSaveProfile();
                    // Only navigate if save was successful
                    if (success && user?.username) {
                      navigate('/profile/' + user?.username);
                    } else if (success) {
                      // Fallback if username is missing but save succeeded
                      navigate('/discover');
                      toast.info("Profile updated but couldn't navigate to your profile page");
                    }
                  }}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save and View Profile"
                  )}
                </button>
              </div>
            </>
          )}

          {activeTab === 'projects' && (
            <>
              <div className="edit-profile-header">
                <h2 className="edit-profile-title">Projects</h2>
                <p className="edit-profile-subtitle">Add or update your projects and portfolio</p>
              </div>
              
              {form.projects && form.projects.map((project, index) => (
                <div key={index} className="project-entry p-3 mb-4 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" style={{ fontFamily: "'Nunito', sans-serif" }}>Project #{index + 1}</h4>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => {
                        const updatedProjects = form.projects.filter((_, i) => i !== index);
                        setForm(prev => ({
                          ...prev,
                          projects: updatedProjects
                        }));
                        // Also update the techStack array to stay in sync
                        const newTechStack = [...techStack];
                        newTechStack.splice(index, 1);
                        setTechStack(newTechStack);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={project.title || ''}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      placeholder="Project name"
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        value={project.startDate ? project.startDate.substring(0, 10) : ''}
                        onChange={(e) => handleAdditionalChange(e, index)}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        className="form-control"
                        value={project.endDate ? project.endDate.substring(0, 10) : ''}
                        onChange={(e) => handleAdditionalChange(e, index)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Project URL</label>
                    <input
                      type="text"
                      name="projectUrl"
                      className="form-control"
                      value={project.projectUrl || ''}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      placeholder="https://example.com/your-project"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tech Stack</label>
                    <div className="d-flex mb-2">
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Add technologies used (e.g., React, Node.js)"
                        value={techStack[index] || ''}
                        onChange={(e) => {
                          const newTechStack = [...techStack];
                          newTechStack[index] = e.target.value;
                          setTechStack(newTechStack);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && techStack[index]) {
                            e.preventDefault();
                            const newProjects = [...form.projects];
                            if (!newProjects[index].techStack) {
                              newProjects[index].techStack = [];
                            }
                            if (!newProjects[index].techStack.includes(techStack[index])) {
                              newProjects[index].techStack.push(techStack[index]);
                              setForm(prev => ({
                                ...prev,
                                projects: newProjects
                              }));
                              const newTechStack = [...techStack];
                              newTechStack[index] = '';
                              setTechStack(newTechStack);
                            }
                          }
                        }}
                      />
                      <button 
                        className="btn"
                        onClick={() => {
                          if (techStack[index]) {
                            const newProjects = [...form.projects];
                            if (!newProjects[index].techStack) {
                              newProjects[index].techStack = [];
                            }
                            if (!newProjects[index].techStack.includes(techStack[index])) {
                              newProjects[index].techStack.push(techStack[index]);
                              setForm(prev => ({
                                ...prev,
                                projects: newProjects
                              }));
                              const newTechStack = [...techStack];
                              newTechStack[index] = '';
                              setTechStack(newTechStack);
                            }
                          }
                        }}
                        style={{ backgroundColor: '#FF5722', color: 'white', borderColor: '#FF7043' }}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="skill-tags">
                      {project.techStack && project.techStack.map((tech, techIndex) => (
                        <div key={techIndex} className="skill-tag">
                          {tech}
                          <button 
                            className="skill-tag-remove"
                            onClick={() => {
                              const newProjects = [...form.projects];
                              newProjects[index].techStack = newProjects[index].techStack.filter((_, i) => i !== techIndex);
                              setForm(prev => ({
                                ...prev,
                                projects: newProjects
                              }));
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={project.description || ''}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      placeholder="Describe your project, your role, and technologies used"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <button 
                className="btn btn-profile-teal mb-4"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setForm(prev => ({
                    ...prev,
                    projects: [
                      ...prev.projects,
                      {
                        id: uuidv4(),
                        title: "",
                        startDate: today,
                        endDate: today,
                        projectUrl: "",
                        techStack: [],
                        description: ""
                      }
                    ]
                  }));
                  setTechStack(prev => [...prev, '']);
                }}
              >
                <i className="fas fa-plus-circle me-2"></i>
                Add Project
              </button>
              
              <div className="form-actions">
                <button 
                  className="btn btn-profile-outline" 
                  onClick={() => navigate('/profile/' + user?.username)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-profile-primary"
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button 
                  className="btn btn-profile-secondary"
                  onClick={async () => {
                    // First attempt to save and wait for result
                    const success = await handleSaveProfile();
                    // Only navigate if save was successful
                    if (success && user?.username) {
                      navigate('/profile/' + user?.username);
                    } else if (success) {
                      // Fallback if username is missing but save succeeded
                      navigate('/discover');
                      toast.info("Profile updated but couldn't navigate to your profile page");
                    }
                  }}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save and View Profile"
                  )}
                </button>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div className="edit-profile-header">
                <h2 className="edit-profile-title">Account Settings</h2>
                <p className="edit-profile-subtitle">Manage your account preferences and security</p>
              </div>
              
              <div className="settings-section p-3 mb-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h4 style={{ fontFamily: "'Nunito', sans-serif" }}>Email Notifications</h4>
                
                <div className="form-check mb-3 mt-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="newConnectionNotif" 
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="newConnectionNotif">
                    New connection requests
                  </label>
                </div>
                
                <div className="form-check mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="messageNotif" 
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="messageNotif">
                    New messages
                  </label>
                </div>
                
                <div className="form-check mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="skillMatchNotif" 
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="skillMatchNotif">
                    Skill match suggestions
                  </label>
                </div>
                
                <div className="form-check mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="newsletterNotif" 
                  />
                  <label className="form-check-label" htmlFor="newsletterNotif">
                    Newsletter and updates
                  </label>
                </div>
              </div>
              
              <div className="settings-section p-3 mb-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h4 style={{ fontFamily: "'Nunito', sans-serif" }}>Password</h4>
                
                <div className="form-group mt-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your current password"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <button className="btn btn-profile-primary mt-3">
                  Update Password
                </button>
              </div>
              
              <div className="settings-section p-3 mb-4 rounded" style={{ backgroundColor: 'rgba(207, 102, 121, 0.1)', border: '1px solid rgba(207, 102, 121, 0.2)' }}>
                <h4 style={{ fontFamily: "'Nunito', sans-serif", color: 'var(--error)' }}>Danger Zone</h4>
                
                <p className="text-muted mb-3 mt-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                <button className="btn btn-danger">
                  Delete Account
                </button>
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn btn-profile-outline" 
                  onClick={() => navigate('/profile/' + user?.username)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-profile-primary"
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button 
                  className="btn btn-profile-secondary"
                  onClick={async () => {
                    // First attempt to save and wait for result
                    const success = await handleSaveProfile();
                    // Only navigate if save was successful
                    if (success && user?.username) {
                      navigate('/profile/' + user?.username);
                    } else if (success) {
                      // Fallback if username is missing but save succeeded
                      navigate('/discover');
                      toast.info("Profile updated but couldn't navigate to your profile page");
                    }
                  }}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </div>
                  ) : (
                    "Save and View Profile"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
