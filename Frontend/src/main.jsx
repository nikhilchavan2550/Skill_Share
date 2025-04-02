import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { UserContextProvider } from "./util/UserContext.jsx";

// Set default backend URL if environment variables are not available
const DEFAULT_DEV_URL = 'http://localhost:5000/api'; // Updated port to match ApiCall.jsx
const DEFAULT_PROD_URL = 'https://skillswap-backend.vercel.app/api'; // Replace with your actual production URL

// Configure axios defaults
try {
  if (import.meta.env.DEV) {
    console.log("Running in development mode");
    axios.defaults.baseURL = import.meta.env.VITE_LOCALHOST || DEFAULT_DEV_URL;
  } else {
    console.log("Running in production mode");
    axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || DEFAULT_PROD_URL;
  }

  // Essential for cookie-based authentication
  axios.defaults.withCredentials = true;
  
  // Set default headers
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  
  // Log the configured axios settings
  console.log("Axios baseURL:", axios.defaults.baseURL);
  console.log("Axios withCredentials:", axios.defaults.withCredentials);
} catch (error) {
  console.error("Error configuring axios defaults:", error);
}

// Function to render the app safely
const renderApp = () => {
  try {
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <Router>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </Router>
    );
  } catch (error) {
    console.error("Failed to render app:", error);
    // Fallback rendering to show at least something if the app fails to render
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button onclick="window.location.reload()">Refresh Page</button>
        </div>
      `;
    }
  }
};

// Render the app
renderApp();
