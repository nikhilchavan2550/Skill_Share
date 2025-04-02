import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { configureAxios } from "./ApiCall";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Custom setUser function that handles token
  const setUser = (userData) => {
    try {
      if (userData && userData.token) {
        localStorage.setItem("token", userData.token);
        // Configure axios with the new token
        configureAxios();
      }
      setUserState(userData);
    } catch (error) {
      console.error("Error setting user data:", error);
      setUserState(userData); // Still set the user state even if token handling fails
    }
  };

  // Try to load user data from the server using the httpOnly cookie
  const loadUserFromServer = async () => {
    try {
      console.log("Attempting to load user data from server...");
      const { data } = await axios.get('/user/registered/getDetails');
      
      if (data.success && data.data) {
        console.log("User data loaded from server:", data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
        
        // If we have a token, store it
        if (data.data.token) {
          localStorage.setItem("token", data.data.token);
          // Configure axios with the new token
          try {
            configureAxios();
          } catch (error) {
            console.error("Error configuring axios with token:", error);
          }
        }
        
        setUserState(data.data); // Use setUserState directly to avoid recursive calls
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.log("Failed to load user from server:", error.response?.data || error.message);
      return false;
    }
    return false;
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserState = async () => {
      try {
        setLoading(true);
        const userInfoString = localStorage.getItem("userInfo");
        
        // Configure axios with any existing token
        try {
          configureAxios();
        } catch (error) {
          console.error("Error configuring axios during initial load:", error);
        }
        
        if (userInfoString) {
          try {
            const userInfo = JSON.parse(userInfoString);
            // Verify the user info has required fields
            if (userInfo && userInfo._id && userInfo.username) {
              console.log("User loaded from localStorage:", userInfo.username);
              setUserState(userInfo); // Use setUserState directly to avoid potential issues
            } else {
              // Invalid user data in localStorage
              console.log("Invalid user data in localStorage");
              localStorage.removeItem("userInfo");
              
              // Try to load from server instead
              await loadUserFromServer();
            }
          } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            localStorage.removeItem("userInfo");
            await loadUserFromServer();
          }
        } else {
          // No user in localStorage, try to load from server
          console.log("No user in localStorage, checking server");
          await loadUserFromServer();
        }
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("userInfo");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserState();
  }, []);

  // Listen for localStorage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userInfo") {
        if (e.newValue) {
          try {
            const userInfo = JSON.parse(e.newValue);
            setUser(userInfo);
          } catch (error) {
            console.error("Error parsing userInfo:", error);
          }
        } else {
          setUser(null);
          // Redirect to login if required
          const publicPaths = ['/', '/about', '/login', '/register', '/discord'];
          if (!publicPaths.includes(location.pathname) && !publicPaths.some(path => location.pathname.startsWith(path))) {
            navigate('/login');
            toast.info("Please log in to continue");
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate, location.pathname]);

  // COMPLETELY REDESIGNED LOGOUT FUNCTION - FOCUSED ON HTTP-ONLY COOKIES
  const logout = () => {
    try {
      // 1. Show a blocking overlay to prevent user interaction
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
      overlay.style.color = 'white';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.fontSize = '20px';
      overlay.textContent = 'Logging out...';
      document.body.appendChild(overlay);
      
      // 2. Set flags to block auto-login after logout
      localStorage.setItem('force_logout', 'true');
      localStorage.setItem('manual_logout', 'true');
      sessionStorage.setItem('manual_logout', 'true');
      
      // 3. Clear ALL known client-side auth data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      sessionStorage.removeItem('login_last_mount');
      
      // 4. Call MULTIPLE server endpoints to clear HTTP-only cookies
      // This is the critical fix for the HTTP-only cookie issue
      const baseUrl = window.location.origin;
      const paths = ['/auth/logout', '/api/auth/logout', '/logout', '/api/logout'];
      
      // Prepare multiple logout requests 
      const logoutRequests = paths.map(path => 
        fetch(`${baseUrl}${path}`, { 
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }).catch(err => console.log(`Logout attempt for ${path} failed (can ignore):`, err))
      );
      
      // Execute all logout requests in parallel
      Promise.all(logoutRequests)
        .then(() => {
          console.log("All server-side logout attempts completed");
          
          // Update overlay message
          if (overlay) {
            overlay.textContent = 'Logged out successfully! Redirecting...';
          }
          
          // 5. BYPASS React Router completely and force a hard refresh + redirect
          // Add cache-busting parameter to prevent browser from using cached page
          window.top.location.replace(`${baseUrl}/login?forcedLogout=${Date.now()}`);
        })
        .catch(() => {
          // If any error occurs, still redirect
          window.top.location.replace(`${baseUrl}/login?forcedLogout=${Date.now()}`);
        });
      
      // 6. Emergency fallback if the Promise.all gets stuck
      setTimeout(() => {
        window.top.location.replace(`${baseUrl}/login?forcedLogout=${Date.now()}`);
      }, 2000);
      
      // Don't rely on React state updates
      return;
    } catch (error) {
      console.error('Logout error:', error);
      // Emergency fallback
      localStorage.setItem('force_logout', 'true');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      window.top.location.replace(`${window.location.origin}/login?forcedLogout=${Date.now()}`);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    // Check for registration flow - immediately return false if detected
    if (sessionStorage.getItem('direct_registration') === 'true') {
      console.log("Registration flow detected - user considered not authenticated");
      return false;
    }
    
    try {
      // First check if user state is valid
      if (user && user._id && user.username) {
        return true;
      }
      
      // If not, check localStorage
      const userInfoString = localStorage.getItem("userInfo");
      const token = localStorage.getItem("token");
      
      if (userInfoString && token) {
        try {
          const userInfo = JSON.parse(userInfoString);
          if (userInfo && userInfo._id && userInfo.username) {
            return true;
          }
        } catch (e) {
          console.error("Error parsing user info:", e);
        }
      }
      
      return false;
    } catch (e) {
      console.error("Error checking authentication:", e);
      return false;
    }
  };

  // Special method for clearing auth state when navigating to registration
  const clearForRegistration = () => {
    console.log("Clearing auth state for registration flow");
    
    // Set registration flag
    sessionStorage.setItem('direct_registration', 'true');
    
    // Clear local auth state
    setUserState(null);
    
    // Clear stored auth data
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('force_logout');
    localStorage.removeItem('manual_logout');
    
    // Clear session flags
    sessionStorage.removeItem('manual_logout');
    
    // Make server-side logout call
    try {
      fetch('/auth/logout', { 
        credentials: 'include',
        cache: 'no-store'
      });
    } catch (error) {
      console.error("Server logout during registration failed:", error);
    }
    
    // Navigate to register page with cache-busting
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/register?fresh=${Date.now()}`;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      logout,
      clearForRegistration,
      loadUserFromServer,
      isAuthenticated 
    }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  return useContext(UserContext);
};

export { UserContextProvider, useUser };
