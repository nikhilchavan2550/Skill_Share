import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "../Components/Loading/Loading";
import { useUser } from "./UserContext";

const PrivateRoutes = () => {
  const { loading, isAuthenticated } = useUser();
  const [authVerified, setAuthVerified] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      // Use the isAuthenticated method for a reliable check
      const authStatus = isAuthenticated();
      setIsAuthed(authStatus);
      setAuthVerified(true);
      
      console.log("PrivateRoutes: Authentication verified:", authStatus);
      
      // If not authenticated, clean up
      if (!authStatus) {
        console.log("PrivateRoutes: User not authenticated, cleaning up...");
        localStorage.clear();
        sessionStorage.clear();
      }
    }
  }, [loading, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (loading || !authVerified) {
    return <Loading fullScreen message="Verifying your session..." />;
  }

  // Check if the user is attempting to register
  const isAttemptingToRegister = 
    location.pathname === "/register" || 
    location.state?.navigatingToRegister ||
    sessionStorage.getItem('direct_registration') === 'true' ||
    sessionStorage.getItem('active_registration') === 'true';
                                
  // If trying to register, send directly to register page
  if (isAttemptingToRegister) {
    console.log("PrivateRoutes: Attempting to register, clearing auth state");
    
    // Complete logout procedure
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    
    // Clear any logout flags to prevent interference with registration
    localStorage.removeItem('force_logout');
    sessionStorage.removeItem('manual_logout');
    
    // The direct_registration flag will be cleared by the Register component
    // but we make sure it's set again for safety
    sessionStorage.setItem('direct_registration', 'true');
    
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // Use verified auth status for navigation
  return isAuthed ? 
    <Outlet /> : 
    <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoutes;
