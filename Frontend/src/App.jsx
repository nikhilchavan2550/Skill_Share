import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Discover from "./Pages/Discover/Discover";
import Login from "./Pages/Login/Login";
import Header from "./Components/Navbar/Navbar";
import Home from "./Pages/Home/Home";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Chats from "./Pages/Chats/Chats";
import Report from "./Pages/Report/Report";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/NotFound/NotFound";
import Register from "./Pages/Register/Register";
import Rating from "./Pages/Rating/Rating";
import EditProfile from "./Pages/EditProfile/EditProfile";
import PrivateRoutes from "./util/PrivateRoutes";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/theme.css";
import Discord from './Pages/Discord/Discord';
import { useEffect } from "react";
import { configureAxios } from "./util/ApiCall";
import { useUser } from "./util/UserContext";

// A wrapper component to provide error boundary for each route
const RouteErrorBoundary = ({ children }) => (
  <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
    {children}
  </ErrorBoundary>
);

const App = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Force logout if user reaches a private route without valid authentication
  useEffect(() => {
    // Define paths that don't require authentication
    const publicPaths = ['/', '/about', '/login', '/register', '/discord'];
    
    // Check if current path requires authentication
    const isPrivatePath = !publicPaths.includes(location.pathname) && 
                          !publicPaths.some(path => location.pathname.startsWith(path));
    
    // If we're on a private path but no user is authenticated, force logout
    if (isPrivatePath && !user) {
      console.log("Auth verification: User not authenticated but trying to access private route:", location.pathname);
      
      // Force cleanup and redirect
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login
      navigate('/login', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  // Configure axios with token on app start
  useEffect(() => {
    try {
      configureAxios();
      console.log("API configuration completed successfully");
    } catch (error) {
      console.error("Failed to configure API:", error);
    }
  }, []);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <div className="app-container">
        <Header />
        <ToastContainer 
          position="top-right" 
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <main className="main-content">
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/chat" element={
                <RouteErrorBoundary>
                  <Chats />
                </RouteErrorBoundary>
              } />
              <Route path="/discover" element={
                <RouteErrorBoundary>
                  <Discover />
                </RouteErrorBoundary>
              } />
              <Route path="/profile/:username" element={
                <RouteErrorBoundary>
                  <Profile />
                </RouteErrorBoundary>
              } />
              <Route path="/edit-profile" element={
                <RouteErrorBoundary>
                  <EditProfile />
                </RouteErrorBoundary>
              } />
              <Route path="/settings" element={
                <RouteErrorBoundary>
                  <EditProfile />
                </RouteErrorBoundary>
              } />
              <Route path="/rating/:username" element={
                <RouteErrorBoundary>
                  <Rating />
                </RouteErrorBoundary>
              } />
              <Route path="/report/:username" element={
                <RouteErrorBoundary>
                  <Report />
                </RouteErrorBoundary>
              } />
            </Route>
            <Route path="/" element={
              <RouteErrorBoundary>
                <Home />
              </RouteErrorBoundary>
            } />
            <Route path="/login" element={
              <RouteErrorBoundary>
                <Login />
              </RouteErrorBoundary>
            } />
            <Route path="/register" element={
              <RouteErrorBoundary>
                <Register />
              </RouteErrorBoundary>
            } />
            <Route path="/about" element={
              <RouteErrorBoundary>
                <AboutUs />
              </RouteErrorBoundary>
            } />
            <Route path="/discord" element={
              <RouteErrorBoundary>
                <Discord />
              </RouteErrorBoundary>
            } />
            <Route path="*" element={
              <RouteErrorBoundary>
                <NotFound />
              </RouteErrorBoundary>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;
