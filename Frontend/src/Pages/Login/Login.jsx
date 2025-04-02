import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import { FaGoogle, FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";

const Login = () => {
  const [scrollY, setScrollY] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Use a ref instead of state to track if a toast has been shown
  // This prevents issues with multiple state updates during navigation
  const toastShownRef = useRef(false);
  
  const { user, setUser, clearForRegistration } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Reset toast ref when component unmounts/remounts and handle logout message
  useEffect(() => {
    // Check if user is attempting to register (either from state or directly navigating to register page)
    const isAttemptingToRegister = 
      location.state?.navigatingToRegister || 
      location.pathname === '/register' ||
      sessionStorage.getItem('direct_registration') === 'true' ||
      sessionStorage.getItem('active_registration') === 'true';
    
    // SKIP all logout handling if user is trying to register
    if (isAttemptingToRegister) {
      console.log("User is attempting to register - bypassing logout handling");
      
      // Clear the force_logout flag to avoid interference with registration
      localStorage.removeItem('force_logout');
      return;
    }
    
    // Clear any lingering user data on login page mount
    if (!user) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    }

    // Check for query params indicating a logout
    const params = new URLSearchParams(window.location.search);
    // Don't show logout toast if we're in registration flow
    if ((params.has('logged_out') || params.has('logoutSuccess')) && 
        sessionStorage.getItem('active_registration') !== 'true') {
      toast.success("Logged out successfully");
      
      // Clear any remaining user data
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      sessionStorage.clear();
      
      // Reset axios config
      import('../../util/ApiCall').then(({ configureAxios }) => {
        try { configureAxios(); } catch (e) { console.error("Axios config reset failed:", e); }
      });
      
      // Ensure user state is null
      setUser(null);
      
      // Remove query params from URL
      window.history.replaceState({}, document.title, '/login');
    }
  }, [location.search, setUser, location.pathname, location.state]);
  
  // Helper function to handle successful login (Ensure it runs only once per login flow)
  const handleSuccessfulLogin = (userData) => {
    // Prevent duplicates if toast has already been shown for this login flow
    if (toastShownRef.current) {
      console.log("Login success handler called, but toast already shown. Exiting.");
      return;
    }
    
    console.log("Handling successful login for:", userData?.username);
    
    // Mark toast as shown *before* doing anything else
    toastShownRef.current = true;

    // Store user data and token
    localStorage.setItem("userInfo", JSON.stringify(userData));
    if (userData && userData.token) {
      localStorage.setItem("token", userData.token);
      console.log("Token stored:", userData.token);
      // Attempt to configure Axios, but don't let it block
      import('../../util/ApiCall').then(({ configureAxios }) => {
        try { configureAxios(); } catch (e) { console.error("Axios config failed post-login:", e); }
      }).catch(e => console.error("Failed to import ApiCall for config:", e));
    }
    
    // Set user state in UserContext
    setUser(userData);
    
    // Show the success toast ONCE
    toast.success("Login successful!");
    
    // Navigate to discover page, replacing the login page in history
    // Use setTimeout to ensure state updates settle before navigation
    setTimeout(() => {
        console.log("Navigating to /discover after successful login.");
        navigate('/discover', { replace: true });
    }, 50); // Small delay 
  };
  
  // Check if user is coming from Google OAuth redirect
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Skip auth check if already logging in or already checking auth
      if (toastShownRef.current || isLoading) {
        setCheckingAuth(false);
        return;
      }
      
      // IMPORTANT: Skip all checks if direct registration is active
      if (sessionStorage.getItem('direct_registration') === 'true' || 
          sessionStorage.getItem('active_registration') === 'true') {
        console.log("Registration flow active - bypassing all auth checks");
        setCheckingAuth(false);
        return;
      }
      
      // Check if user is trying to register - if so, SKIP auto-login
      if (location.state?.navigatingToRegister || location.pathname === '/register') {
        console.log("User is trying to register, skipping auto-login check");
        setCheckingAuth(false);
        return;
      }
      
      // ENHANCED LOGOUT DETECTION: Check all possible logout signals
      const params = new URLSearchParams(window.location.search);
      const justLoggedOut = 
        params.has('logged_out') || 
        params.has('forcedLogout') ||
        sessionStorage.getItem('manual_logout') === 'true' ||
        localStorage.getItem('force_logout') === 'true' ||
        localStorage.getItem('manual_logout') === 'true';
      
      if (justLoggedOut) {
        console.log("Login page: Detected recent logout, SKIPPING auto-login");
        
        // Clear any possible auth data
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        
        // Show logout success message if not already shown
        if (!toastShownRef.current) {
          toast.success("Logged out successfully");
          toastShownRef.current = true;
        }
        
        // Make another server logout call to ensure cookies are cleared
        // This is crucial for HTTP-only cookies that client JS can't clear
        try {
          await fetch('/auth/logout', { 
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache' 
            }
          });
          console.log("Secondary logout call completed successfully");
        } catch (err) {
          console.error("Secondary logout call failed (can ignore):", err);
        }
        
        // Preserve the force_logout flag but clear manual_logout
        localStorage.setItem('force_logout', 'true');
        sessionStorage.removeItem('manual_logout');
        
        // Clean up URL parameters
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        setCheckingAuth(false);
        return;
      }
      
      // Only if we're not logged out, check for existing session
      try {
        setCheckingAuth(true);
        
        // Prevent caching of this request
        const { data } = await axios.get('/user/registered/getDetails', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (data.success && data.data) {
          // Check if we have a force_logout flag - if so, we shouldn't auto-login
          if (localStorage.getItem('force_logout') === 'true') {
            console.log("Found force_logout flag, refusing to auto-login despite valid session");
            
            // Make one more logout call
            await fetch('/auth/logout', { credentials: 'include' }).catch(() => {});
            
            localStorage.removeItem('force_logout');
            setCheckingAuth(false);
            return;
          }
          
          console.log("User authenticated via cookie:", data.data);
          handleSuccessfulLogin(data.data);
        }
      } catch (error) {
        console.log("Not authenticated via cookie:", error);
        // Not authenticated or error fetching user data - that's okay
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [setUser, navigate, isLoading]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/discover');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if we just returned from a failed Google OAuth attempt
    const googleAuthAttempt = localStorage.getItem("googleAuthAttempt");
    if (googleAuthAttempt === "true") {
      localStorage.removeItem("googleAuthAttempt");
      setErrorMessage("Google login failed or was cancelled. Please try again or use another login method.");
      
      // Let's try to check our authentication status to see if we have a valid cookie
      const checkAuthAfterRedirect = async () => {
        try {
          const { data } = await axios.get('/user/registered/getDetails');
          console.log("Auth check after redirect result:", data);
          // If this succeeds, we actually have a valid session
          if (data.success && data.data) {
            handleSuccessfulLogin(data.data);
          }
        } catch (error) {
          console.error("Auth check failed after redirect:", error.response?.data || error.message);
        }
      };
      
      checkAuthAfterRedirect();
    }
  }, []);

  // Check for successful auth redirect with query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authSuccess = params.get('authSuccess');
    const userDataParam = params.get('userData');
    
    if (authSuccess === 'true' && userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        console.log("User data from redirect:", userData);
        
        if (userData && userData.username) {
          handleSuccessfulLogin(userData);
        }
      } catch (error) {
        console.error("Error parsing user data from URL:", error);
        setErrorMessage("Authentication completed but there was an error loading your data.");
      }
    }
  }, [location]);

  // Force clean authentication state when arriving at login page
  useEffect(() => {
    // Skip cleanup if navigating to registration
    if (sessionStorage.getItem('direct_registration') === 'true') {
      console.log("Detected registration navigation - skipping logout cleanup");
      return;
    }
    
    // Detect if we need to do a forced cleanup
    const params = new URLSearchParams(window.location.search);
    const shouldCleanup = 
      params.has('logged_out') || 
      params.has('forcedLogout') ||
      params.has('session_expired') ||
      sessionStorage.getItem('manual_logout') === 'true' ||
      localStorage.getItem('force_logout') === 'true' ||
      localStorage.getItem('manual_logout') === 'true';
    
    if (shouldCleanup) {
      console.log("Login page: AGGRESSIVE cleanup requested for logout");
      
      // Immediately clear all client-side auth data
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      
      // Keep the force_logout flag to prevent auto-login
      localStorage.setItem('force_logout', 'true');
      
      // Reset other flags
      sessionStorage.removeItem('manual_logout');
      
      // Force reset user context state
      setUser(null);
      
      // AGGRESSIVE SERVER-SIDE LOGOUT: Make multiple API calls with different paths
      // This ensures all possible cookie paths are covered
      const baseUrl = window.location.origin;
      const paths = ['/auth/logout', '/api/auth/logout', '/logout', '/api/logout'];
      
      // Make multiple logout calls to cover all possible API endpoints
      Promise.all(
        paths.map(path => 
          fetch(`${baseUrl}${path}`, { 
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          }).catch(err => console.log(`Logout attempt for ${path} failed (safe to ignore):`, err))
        )
      ).then(() => {
        console.log("Multiple logout attempts completed");
        
        // Show a single success message if not already shown
        if (!toastShownRef.current) {
          toast.success("Logged out successfully");
          toastShownRef.current = true;
        }
        
        // Clean up URL query params
        if (window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, [setUser]);

  // Special effect specifically for handling registration navigation
  useEffect(() => {
    // Check if user is going to register
    if (location.pathname === '/register' || location.state?.navigatingToRegister) {
      console.log("Detected navigation to registration page");
      
      // Reset all logout-related flags
      localStorage.removeItem('force_logout');
      localStorage.removeItem('manual_logout');
      sessionStorage.removeItem('manual_logout');
      
      // Reset toast shown status
      toastShownRef.current = false;
    }
  }, [location.pathname, location.state]);

  const handleGoogleLogin = () => {
    try {
      // Use axios baseURL to ensure we're using the correct server URL
      const googleAuthUrl = `${axios.defaults.baseURL}/auth/google`;
      console.log("Redirecting to Google OAuth:", googleAuthUrl);
      
      // Add a flag to localStorage so we know we tried to login with Google
      localStorage.setItem("googleAuthAttempt", "true");
      
      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Error starting Google OAuth flow:", error);
      setErrorMessage("Failed to start Google login process. Please try again.");
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate login attempts
    if (isLoading || toastShownRef.current) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      console.log("Attempting login with:", { email: loginData.email });
      
      // Example for direct login - replace with your actual login endpoint
      const response = await axios.post("/auth/login", loginData);
      console.log("Login response:", response.data);
      
      if (response.data.success) {
        // Store token if provided in response
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          console.log("Token stored from login response:", response.data.token);
          
          // Update axios configuration with new token
          try {
            const { configureAxios } = await import('../../util/ApiCall');
            configureAxios();
          } catch (error) {
            console.error("Error configuring axios after login:", error);
          }
        }
        
        handleSuccessfulLogin(response.data.data);
      } else {
        setErrorMessage(response.data.message || "Login failed");
        // Reset toast flag if login failed
        toastShownRef.current = false;
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Failed to connect to server. Please try again later.");
      }
      // Reset toast flag if login failed
      toastShownRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth status
  if (checkingAuth) {
    return (
      <div className="login-container">
        <div className="login-background"></div>
        <div className="login-content">
          <div className="login-box d-flex flex-column align-items-center justify-content-center">
            <Spinner animation="border" variant="light" />
            <p className="mt-3 text-light">Checking authentication status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-background"></div>
      
      <img 
        src="/assets/images/1.png" 
        alt="Decorative graphic" 
        className="login-image login-image-top" 
        style={{ transform: `translateX(${scrollY * 0.2}px) rotate(${scrollY * 0.05}deg)` }}
      />
      
      <div className="login-content">
        <div className="login-box">
          <h1 className="login-title">LOGIN</h1>
          <p className="login-subtitle">Connect with other skill enthusiasts</p>
          
          {errorMessage && (
            <Alert variant="danger" className="mb-3">
              {errorMessage}
            </Alert>
          )}
          
          <div className="login-options">
            <Button 
              className="btn-google" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <FaGoogle /> Login with Google
            </Button>
            
            <div className="login-divider">or</div>
            
            <Button 
              className="btn-register"
              onClick={() => clearForRegistration()}
              disabled={isLoading}
            >
              Create New Account
            </Button>
          </div>
          
          <p className="login-register-link">
            New to SkillCrafter?{" "}
            <a 
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                clearForRegistration();
              }}
            >
              Register here
            </a>
          </p>
        </div>
      </div>
      
      <img 
        src="/assets/images/2.png" 
        alt="Decorative graphic" 
        className="login-image login-image-bottom" 
        style={{ transform: `translateX(-${scrollY * 0.15}px) rotate(-${scrollY * 0.03}deg)` }}
      />
    </div>
  );
};

export default Login;
