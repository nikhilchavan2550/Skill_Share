import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ProfileCard from "./ProfileCard";
import "./Discover.css";
import Search from "./Search";
import Spinner from "react-bootstrap/Spinner";

const Discover = () => {
  const navigate = useNavigate();

  const { user, setUser } = useUser();

  const [loading, setLoading] = useState(false);

  const [discoverUsers, setDiscoverUsers] = useState([]);

  const [webDevUsers, setWebDevUsers] = useState([]);

  const [mlUsers, setMlUsers] = useState([]);

  const [otherUsers, setOtherUsers] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/user/registered/getDetails`);
        console.log(data.data);
        setUser(data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      }
    };
    const getDiscoverUsers = async () => {
      try {
        const { data } = await axios.get("/user/discover");
        console.log(data);
        setDiscoverUsers(data.data.forYou);
        setWebDevUsers(data.data.webDev);
        setMlUsers(data.data.ml);
        setOtherUsers(data.data.others);
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    getUser();
    getDiscoverUsers();
  }, []);

  return (
    <>
      <div className="discover-page">
        <div className="content-container">
          <div className="nav-bar">
            <Nav defaultActiveKey="/home" className="flex-column">
              <Nav.Link href="#for-you" className="navlink" id="foryou">
                For You
              </Nav.Link>
              <Nav.Link href="#popular" className="navlink" id="popular1">
                Popular
              </Nav.Link>
              <Nav.Link href="#web-development" className="navlink">
                Web Development
              </Nav.Link>
              <Nav.Link href="#machine-learning" className="navlink">
                Machine Learning
              </Nav.Link>
              <Nav.Link href="#others" className="navlink">
                Others
              </Nav.Link>
            </Nav>
          </div>
          <div className="heading-container">
            {loading ? (
              <div className="container d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                <h1 id="for-you" className="section-heading">
                  For You
                </h1>
                <div className="profile-cards">
                  {discoverUsers && discoverUsers.length > 0 ? (
                    discoverUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={user?.rating ? user?.rating : 5}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <p className="no-results">No users to show</p>
                  )}
                </div>
                <h1 id="popular" className="section-heading">
                  Popular
                </h1>
                <h2 id="web-development" className="category-heading">Web Development</h2>
                <div className="profile-cards">
                  {webDevUsers && webDevUsers.length > 0 ? (
                    webDevUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={4}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <p className="no-results">No users to show</p>
                  )}
                </div>
                <h2 id="machine-learning" className="category-heading">Machine Learning</h2>
                <div className="profile-cards">
                  {mlUsers && mlUsers.length > 0 ? (
                    mlUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={4}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <p className="no-results">No users to show</p>
                  )}
                </div>
                <h2 id="others" className="category-heading">Others</h2>
                <div className="profile-cards">
                  {otherUsers && otherUsers.length > 0 ? (
                    otherUsers.map((user, index) => (
                      <ProfileCard
                        key={index}
                        profileImageUrl={user?.picture}
                        name={user?.name}
                        rating={4}
                        bio={user?.bio}
                        skills={user?.skillsProficientAt}
                        username={user?.username}
                      />
                    ))
                  ) : (
                    <p className="no-results">No users to show</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Discover;
