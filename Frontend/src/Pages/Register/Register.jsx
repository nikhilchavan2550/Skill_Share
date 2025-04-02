import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { skills } from "./Skills";
import axios from "axios";
import "./Register.css";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";
import { FaGithub, FaLinkedin, FaGlobe, FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { useUser } from "../../util/UserContext";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const formRef = useRef(null);
  const { setUser } = useUser();

  const [form, setForm] = useState({
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

  // Enhanced logout on mount to prevent any session bleed
  useEffect(() => {
    // Clear any possible auth data completely
    console.log("Register component mounted - full auth state reset");
    
    // Set a flag that we're actively in the registration component
    // This prevents any logout-related toasts from appearing
    sessionStorage.setItem('active_registration', 'true');
    
    // Clear localStorage auth data
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('force_logout');
    localStorage.removeItem('manual_logout');
    
    // We don't clear direct_registration because that would break our flow
    // ONLY clear manual_logout from sessionStorage, keep direct_registration
    sessionStorage.removeItem('manual_logout');
    
    // Reset user context
    setUser(null);
    
    // Make server logout call to clear any server-side session/cookies
    fetch('/auth/logout', { credentials: 'include' })
      .then(() => console.log("Server logout successful"))
      .catch(() => console.log("Server logout attempt made"));
      
    // Clean up active_registration flag when unmounting
    return () => {
      sessionStorage.removeItem('active_registration');
    };
  }, [setUser]);

  // Redirect to discover if already logged in
  useEffect(() => {
    // Check localStorage directly - don't trust user state during registration
    const userInfoString = localStorage.getItem("userInfo");
    const token = localStorage.getItem("token");
    
    if (userInfoString && token && sessionStorage.getItem('direct_registration') !== 'true') {
      try {
        const userInfo = JSON.parse(userInfoString);
        if (userInfo && userInfo._id && userInfo.username) {
          console.log("Already logged in - redirecting from register to discover");
          toast.info("You're already logged in. Redirecting to your dashboard.");
          navigate('/discover');
        }
      } catch (err) {
        // Invalid user data, can continue with registration
        console.error("Error parsing user data:", err);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current) {
        const scrollPosition = window.scrollY;
        // Apply a subtle animation effect on scroll
        formRef.current.style.boxShadow = `0 ${15 + scrollPosition * 0.01}px ${30 + scrollPosition * 0.02}px rgba(0, 0, 0, ${0.3 + scrollPosition * 0.0005})`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      try {
        const { data } = await axios.get("/user/unregistered/getDetails");
        console.log("User Data: ", data.data);
        
        // Handle empty or missing data with proper fallbacks
        if (!data.data) {
          console.log("No user data received, using empty defaults");
          setForm(prevState => ({
            ...prevState,
            skillsProficientAt: [],
            skillsToLearn: [],
            education: [{
              id: uuidv4(),
              institution: "",
              degree: "",
              startDate: "",
              endDate: "",
              score: "",
              description: "",
            }],
            projects: []
          }));
          setLoading(false);
          return;
        }
        
        // Process education data with proper null checks
        const edu = Array.isArray(data?.data?.education) ? data.data.education : [];
        edu.forEach((ele) => {
          ele.id = uuidv4();
        });
        
        if (edu.length === 0) {
          edu.push({
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          });
        }
        
        // Process projects data with proper null checks
        const proj = Array.isArray(data?.data?.projects) ? data.data.projects : [];
        proj.forEach((ele) => {
          ele.id = uuidv4();
        });
        
        console.log(proj);
        setTechStack(proj.length > 0 ? proj.map(() => "Select some Tech Stack") : []);
        
        // Update form with all available data, providing fallbacks for missing fields
        setForm((prevState) => ({
          ...prevState,
          name: data?.data?.name || "",
          email: data?.data?.email || "",
          username: data?.data?.username || "",
          skillsProficientAt: Array.isArray(data?.data?.skillsProficientAt) ? data.data.skillsProficientAt : [],
          skillsToLearn: Array.isArray(data?.data?.skillsToLearn) ? data.data.skillsToLearn : [],
          linkedinLink: data?.data?.linkedinLink || "",
          githubLink: data?.data?.githubLink || "",
          portfolioLink: data?.data?.portfolioLink || "",
          education: edu,
          bio: data?.data?.bio || "",
          projects: proj.length > 0 ? proj : []
        }));
      } catch (error) {
        console.log(error);
        // For API errors, check if we need to redirect to login
        if (error?.response?.data?.message) {
          if (error.response.data.message.includes("already registered") || 
              error.response.data.message.includes("User exists")) {
            toast.info("You already have an account. Please login instead.");
            navigate("/login");
          } else {
            // If it's not an "already registered" error, start with empty form
            toast.error(error.response.data.message);
            setForm(prevState => ({
              ...prevState,
              skillsProficientAt: [],
              skillsToLearn: [],
              education: [{
                id: uuidv4(),
                institution: "",
                degree: "",
                startDate: "",
                endDate: "",
                score: "",
                description: "",
              }],
              projects: []
            }));
          }
        } else {
          toast.error("Some error occurred");
          // Start with empty form on general errors
          setForm(prevState => ({
            ...prevState,
            skillsProficientAt: [],
            skillsToLearn: [],
            education: [{
              id: uuidv4(),
              institution: "",
              degree: "",
              startDate: "",
              endDate: "",
              score: "",
              description: "",
            }],
            projects: []
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]);

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
    // Prevent default form submission behavior that causes page refresh
    e.preventDefault();
    
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

  const handleRemoveSkill = (e, temp) => {
    const skill = e.target.innerText.split(" ")[0];
    if (temp === "skills_proficient_at") {
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
    console.log("Form: ", form);
  };

  const handleRemoveEducation = (e, tid) => {
    const updatedEducation = form.education.filter((item, i) => item.id !== tid);
    console.log("Updated Education: ", updatedEducation);
    setForm((prevState) => ({
      ...prevState,
      education: updatedEducation,
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      education: prevState.education.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
    console.log("Form: ", form);
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    console.log("Name", name);
    console.log("Value", value);
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
    console.log("Form: ", form);
  };

  const validateRegForm = () => {
    if (!form.username) {
      toast.error("Username is empty");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Enter atleast one Skill you are proficient at");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Enter atleast one Skill you want to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error("Enter atleast one link among portfolio, github and linkedin");
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

  const validateEduForm = () => {
    form.education.forEach((edu, index) => {
      if (!edu.institution) {
        toast.error(`Institution name is empty in education field ${index + 1}`);
        return false;
      }
      if (!edu.degree) {
        toast.error("Degree is empty");
        return false;
      }
      if (!edu.startDate) {
        toast.error("Start date is empty");
        return false;
      }
      if (!edu.endDate) {
        toast.error("End date is empty");
        return false;
      }
      if (!edu.score) {
        toast.error("Score is empty");
        return false;
      }
    });
    return true;
  };

  const validateAddForm = () => {
    if (!form.bio) {
      toast.error("Bio is empty");
      return false;
    }
    if (form.bio.length > 500) {
      toast.error("Bio should be less than 500 characters");
      return false;
    }
    var flag = true;
    form.projects.forEach((project, index) => {
      if (!project.title) {
        toast.error(`Title is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.techStack.length) {
        toast.error(`Tech Stack is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.startDate) {
        toast.error(`Start Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.endDate) {
        toast.error(`End Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.projectLink) {
        toast.error(`Project Link is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.description) {
        toast.error(`Description is empty in project ${index + 1}`);
        flag = false;
      }
      if (project.startDate > project.endDate) {
        toast.error(`Start Date should be less than End Date in project ${index + 1}`);
        flag = false;
      }
      if (!project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        console.log("Valid URL");
        toast.error(`Please provide valid project link in project ${index + 1}`);
        flag = false;
      }
    });
    return flag;
  };

  const checkUsernameExists = async (username) => {
    try {
      const { data } = await axios.get(`/user/check-username/${username}`);
      return data.exists;
    } catch (error) {
      console.error("Error checking username:", error);
      return false; // Assume username doesn't exist if there's an error checking
    }
  };

  const handleSaveRegistration = async () => {
    const check = validateRegForm();
    if (check) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveRegDetails", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveEducation = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    if (check1 && check2) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveEduDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveAdditional = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = await validateAddForm();
    console.log(check1, check2, check3);
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveAddDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        // First check if username exists
        const usernameExists = await checkUsernameExists(form.username);
        
        if (usernameExists) {
          toast.error("This username is already taken. Please choose another or login to your existing account.");
          setSaveLoading(false);
          return;
        }
        
        const { data } = await axios.post("/user/registerUser", form);
        toast.success("Registration Successful");
        console.log("Data: ", data.data);
        navigate("/discover");
      } catch (error) {
        console.log(error);
        // Check if error indicates user already exists
        if (error?.response?.data?.message && 
            (error.response.data.message.includes("already registered") || 
             error.response.data.message.includes("already exists"))) {
          toast.info("You already have an account. Please login instead.");
          navigate("/login");
        } else if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-form" ref={formRef}>
        <div className="register-header">
          <h1 className="register-title">Create Your Profile</h1>
          <p className="register-subtitle">Join our community and start connecting with other developers</p>
        </div>

        {loading ? (
          <div className="spinner-container">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Tabs
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
            className="mb-4"
          >
            <Tab eventKey="registration" title="Basic Info">
              <Form>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
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
                    required
                    disabled={form.email && form.email.length > 0}
                  />
                  {form.email && form.email.length > 0 && (
                    <small className="form-text text-muted">
                      Email cannot be changed once set
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={form.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    required
                  />
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

                <div className="social-links">
                  <div className="form-group">
                    <label className="form-label">Portfolio Website</label>
                    <div className="social-link">
                      <FaGlobe />
                      <input
                        type="url"
                        name="portfolioLink"
                        className="form-control"
                        value={form.portfolioLink}
                        onChange={handleInputChange}
                        placeholder="https://your-portfolio.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">GitHub Profile</label>
                    <div className="social-link">
                      <FaGithub />
                      <input
                        type="url"
                        name="githubLink"
                        className="form-control"
                        value={form.githubLink}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn Profile</label>
                    <div className="social-link">
                      <FaLinkedin />
                      <input
                        type="url"
                        name="linkedinLink"
                        className="form-control"
                        value={form.linkedinLink}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills I'm Proficient At</label>
                  <div className="d-flex mb-2">
                    <Form.Select 
                      aria-label="Select skills you're proficient at"
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
                      className="btn btn-primary"
                      type="button"
                      name="skill_proficient_at"
                      onClick={handleAddSkill}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>
                  
                  <div className="skill-tags">
                    {form.skillsProficientAt?.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        <button 
                          className="skill-tag-remove"
                          type="button"
                          onClick={(e) => handleRemoveSkill(e, "skills_proficient_at")}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills I Want to Learn</label>
                  <div className="d-flex mb-2">
                    <Form.Select 
                      aria-label="Select skills you want to learn"
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
                      className="btn btn-primary"
                      type="button"
                      name="skill_to_learn"
                      onClick={handleAddSkill}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>
                  
                  <div className="skill-tags">
                    {form.skillsToLearn?.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        <button 
                          className="skill-tag-remove"
                          type="button"
                          onClick={(e) => handleRemoveSkill(e, "skills_to_learn")}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </Form>
            </Tab>
            <Tab eventKey="education" title="Education">
              {form.education.map((edu, index) => (
                <div className="education-card mb-4 p-3 border rounded" key={edu.id}>
                  {index !== 0 && (
                    <div className="d-flex justify-content-end mb-2">
                      <button className="btn btn-outline-danger btn-sm" onClick={(e) => handleRemoveEducation(e, edu.id)}>
                        <FaTrash /> Remove
                      </button>
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label className="form-label">Institution Name</label>
                    <input
                      type="text"
                      name="institution"
                      className="form-control"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(e, index)}
                      placeholder="Enter your institution name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      className="form-control"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(e, index)}
                      placeholder="Enter your degree"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Grade/Percentage</label>
                    <input
                      type="number"
                      name="score"
                      className="form-control"
                      value={edu.score}
                      onChange={(e) => handleEducationChange(e, index)}
                      placeholder="Enter your grade/percentage"
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          className="form-control"
                          value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleEducationChange(e, index)}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          className="form-control"
                          value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleEducationChange(e, index)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={edu.description}
                      onChange={(e) => handleEducationChange(e, index)}
                      placeholder="Enter your experience or achievements"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <div className="d-flex justify-content-center my-3">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    setForm((prevState) => ({
                      ...prevState,
                      education: [
                        ...prevState.education,
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
                    }));
                  }}
                >
                  <FaPlus /> Add Education
                </button>
              </div>
              
              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-primary" onClick={() => setActiveKey("registration")}>
                  Previous
                </button>
                <button className="btn btn-warning" onClick={handleSaveEducation} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" size="sm" /> : "Save"}
                </button>
                <button onClick={handleNext} className="btn btn-primary">
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="longer-tab" title="Additional">
              <div className="form-group">
                <label className="form-label">Bio (Max 500 Characters)</label>
                <textarea
                  name="bio"
                  className="form-control"
                  value={form.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows="5"
                ></textarea>
                <div className="form-text">
                  {form.bio ? form.bio.length : 0}/500 characters
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Projects</label>

                {form.projects.map((project, index) => (
                  <div className="project-card mb-4 p-3 border rounded" key={project.id}>
                    <div className="d-flex justify-content-end mb-2">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        type="button"
                        onClick={() => {
                          setForm((prevState) => ({
                            ...prevState,
                            projects: prevState.projects.filter((item) => item.id !== project.id),
                          }));
                        }}
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={project.title}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        placeholder="Enter your project title"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Tech Stack</label>
                      <div className="d-flex mb-2">
                        <Form.Select
                          className="form-control me-2"
                          value={techStack[index]}
                          onChange={(e) => {
                            setTechStack((prevState) => prevState.map((item, i) => (i === index ? e.target.value : item)));
                          }}
                        >
                          <option>Select some Tech Stack</option>
                          {skills.map((skill, i) => (
                            <option key={i} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </Form.Select>
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => {
                            if (techStack[index] === "Select some Tech Stack") {
                              toast.error("Select a tech stack to add");
                              return;
                            }
                            if (form.projects[index].techStack.includes(techStack[index])) {
                              toast.error("Tech Stack already added");
                              return;
                            }
                            setForm((prevState) => ({
                              ...prevState,
                              projects: prevState.projects.map((item, i) =>
                                i === index ? { ...item, techStack: [...item.techStack, techStack[index]] } : item
                              ),
                            }));
                          }}
                        >
                          <FaPlus /> Add
                        </button>
                      </div>
                      
                      <div className="skill-tags mb-3">
                        {form.projects[index].techStack.map((skill, i) => (
                          <div className="skill-tag" key={i}>
                            {skill}
                            <button
                              className="skill-tag-remove"
                              type="button"
                              onClick={() => {
                                setForm((prevState) => ({
                                  ...prevState,
                                  projects: prevState.projects.map((item, i) =>
                                    i === index
                                      ? { ...item, techStack: item.techStack.filter((item) => item !== skill) }
                                      : item
                                  ),
                                }));
                              }}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
                            onChange={(e) => handleAdditionalChange(e, index)}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">End Date</label>
                          <input
                            type="date"
                            name="endDate"
                            className="form-control"
                            value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
                            onChange={(e) => handleAdditionalChange(e, index)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Project Link</label>
                      <input
                        type="url"
                        name="projectLink"
                        className="form-control"
                        value={project.projectLink}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        placeholder="Enter your project link"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        value={project.description}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        placeholder="Enter your project description"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-center my-3">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      setTechStack((prevState) => {
                        return [...prevState, "Select some Tech Stack"];
                      });
                      setForm((prevState) => ({
                        ...prevState,
                        projects: [
                          ...prevState.projects,
                          {
                            id: uuidv4(),
                            title: "",
                            techStack: [],
                            startDate: "",
                            endDate: "",
                            projectLink: "",
                            description: "",
                          },
                        ],
                      }));
                    }}
                  >
                    <FaPlus /> Add Project
                  </button>
                </div>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-primary" onClick={() => setActiveKey("education")}>
                  Previous
                </button>
                <button className="btn btn-warning" onClick={handleSaveAdditional} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" size="sm" /> : "Save"}
                </button>
                <button onClick={handleNext} className="btn btn-primary">
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="Preview" title="Confirm Details">
              <div>
                <h3 className="preview_title">Preview of the Form</h3>
                <div className="previewForm">
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link m-sm-0"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Name:</span>
                    <span style={{ flex: 2 }}>{form.name || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Email ID:</span>
                    <span style={{ flex: 2 }}>{form.email || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Username:</span>
                    <span style={{ flex: 2 }}>{form.username || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Portfolio Link:</span>
                    <span style={{ flex: 2 }}>{form.portfolioLink || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Github Link:</span>
                    <span style={{ flex: 2 }}>{form.githubLink || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      marginBottom: "10px",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Linkedin Link:</span>
                    <span
                      style={{
                        width: "70vw",
                        alignItems: "center",
                        flex: 2,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {form.linkedinLink || "Yet to be filled"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Skills Proficient At:</span>
                    <span style={{ flex: 2 }}>{form.skillsProficientAt.join(", ") || "Yet to be filled"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Skills To Learn:</span>
                    <span style={{ flex: 2 }}>{form.skillsToLearn.join(", ") || "Yet to be filled"}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      width: "70vw",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                    className="link"
                  >
                    <span style={{ flex: 1, fontWeight: "bold", color: "#3BB4A1" }}>Bio:</span>
                    <span style={{ flex: 2 }}>{form.bio || "Yet to be filled"}</span>
                  </div>
                </div>
                <div className="row">
                  <button
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: "#3BB4A1",
                      color: "white",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    className="w-50 d-flex m-auto text-center align-content-center justify-content-center"
                  >
                    {saveLoading ? <Spinner animation="border" variant="primary" /> : "Submit"}
                  </button>
                </div>
              </div>
            </Tab>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Register;
