import axios from 'axios';
import { toast } from 'react-toastify';

// Updated to use import.meta.env for Vite instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Creates a configured axios instance for API calls
 * @returns {Object} Axios instance with base URL and interceptors
 */
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage if it exists
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle network errors
      if (!error.response) {
        toast.error('Network error. Please check your connection and try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
        return Promise.reject(error);
      }

      // Handle different HTTP error codes
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.log('Authentication failed in API client');
          
          // Clear ALL user data
          localStorage.clear();
          sessionStorage.clear();
          
          // Only redirect if we're not already on the login page
          const onLoginPage = window.location.pathname.includes('/login');
          
          if (!onLoginPage) {
            toast.error('Session expired. Please log in again.', {
              position: 'top-right',
              autoClose: 3000,
            });
            
            // Redirect to login page IMMEDIATELY
            window.location.href = '/login?session_expired=true';
            
            // Don't proceed with error handling, just stop execution
            return new Promise(() => {});
          } else {
            console.log('Already on login page, not redirecting');
          }
          
        case 403:
          toast.error('You do not have permission to perform this action.', {
            position: 'top-right',
            autoClose: 5000,
          });
          break;
        case 404:
          toast.error('The requested resource was not found.', {
            position: 'top-right',
            autoClose: 5000,
          });
          break;
        case 422:
          // Validation errors
          const message = data.message || 'Validation failed. Please check your input.';
          toast.error(message, {
            position: 'top-right',
            autoClose: 5000,
          });
          break;
        case 429:
          toast.error('Too many requests. Please try again later.', {
            position: 'top-right',
            autoClose: 5000,
          });
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.', {
            position: 'top-right',
            autoClose: 5000,
          });
          break;
        default:
          toast.error(data.message || 'An unexpected error occurred.', {
            position: 'top-right',
            autoClose: 5000,
          });
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create a single instance to be used throughout the app
let apiClient;
try {
  apiClient = createApiClient();
} catch (error) {
  console.error("Failed to create API client:", error);
  // Create a fallback client with minimal configuration
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });
}

/**
 * Makes a GET request to the API
 * @param {string} url - The API endpoint
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional axios options
 * @returns {Promise} API response
 */
export const apiGet = async (url, params = {}, options = {}) => {
  try {
    const response = await apiClient.get(url, { params, ...options });
    return response.data;
  } catch (error) {
    console.error(`API GET error for ${url}:`, error);
    throw error;
  }
};

/**
 * Makes a POST request to the API
 * @param {string} url - The API endpoint
 * @param {Object} data - Request body
 * @param {Object} options - Additional axios options
 * @returns {Promise} API response
 */
export const apiPost = async (url, data = {}, options = {}) => {
  try {
    const response = await apiClient.post(url, data, options);
    return response.data;
  } catch (error) {
    console.error(`API POST error for ${url}:`, error);
    throw error;
  }
};

/**
 * Makes a PUT request to the API
 * @param {string} url - The API endpoint
 * @param {Object} data - Request body
 * @param {Object} options - Additional axios options
 * @returns {Promise} API response
 */
export const apiPut = async (url, data = {}, options = {}) => {
  try {
    const response = await apiClient.put(url, data, options);
    return response.data;
  } catch (error) {
    console.error(`API PUT error for ${url}:`, error);
    throw error;
  }
};

/**
 * Makes a PATCH request to the API
 * @param {string} url - The API endpoint
 * @param {Object} data - Request body
 * @param {Object} options - Additional axios options
 * @returns {Promise} API response
 */
export const apiPatch = async (url, data = {}, options = {}) => {
  try {
    const response = await apiClient.patch(url, data, options);
    return response.data;
  } catch (error) {
    console.error(`API PATCH error for ${url}:`, error);
    throw error;
  }
};

/**
 * Makes a DELETE request to the API
 * @param {string} url - The API endpoint
 * @param {Object} options - Additional axios options
 * @returns {Promise} API response
 */
export const apiDelete = async (url, options = {}) => {
  try {
    const response = await apiClient.delete(url, options);
    return response.data;
  } catch (error) {
    console.error(`API DELETE error for ${url}:`, error);
    throw error;
  }
};

/**
 * Configure axios for direct API calls outside of the standard API client
 * This function adds the auth token to the default axios instance
 * Call this at app startup or whenever the token changes
 */
export const configureAxios = () => {
  try {
    // Set the base URL only if it's not already set
    if (!axios.defaults.baseURL) {
      axios.defaults.baseURL = API_BASE_URL;
    }
    
    // Remove any existing interceptors to prevent duplicates
    const existingRequestInterceptors = axios.interceptors.request.handlers || [];
    const existingResponseInterceptors = axios.interceptors.response.handlers || [];
    
    existingRequestInterceptors.forEach((interceptor, i) => {
      axios.interceptors.request.eject(i);
    });
    
    existingResponseInterceptors.forEach((interceptor, i) => {
      axios.interceptors.response.eject(i);
    });
    
    // Add a request interceptor to add the token
    axios.interceptors.request.use(
      (config) => {
        // Get token from localStorage if it exists
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add a response interceptor for handling errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle unauthorized errors (token expired or invalid)
        if (error.response && error.response.status === 401) {
          console.log('Token expired or invalid in direct axios call');
          
          // Clear ALL user data
          localStorage.clear();
          sessionStorage.clear();
          
          // Only redirect if we're not already on the login page
          const onLoginPage = window.location.pathname.includes('/login');
          
          if (!onLoginPage) {
            // Show toast notification
            toast.error('Session expired. Please log in again.', {
              position: 'top-right',
              autoClose: 3000,
            });
            
            // Redirect to login page IMMEDIATELY - don't wait
            window.location.href = '/login?session_expired=true';
            
            // Don't proceed with error handling, just stop execution
            return new Promise(() => {});
          } else {
            console.log('Already on login page, not redirecting');
          }
        }
        return Promise.reject(error);
      }
    );
    
    console.log("Axios configured successfully with base URL:", API_BASE_URL);
  } catch (error) {
    console.error("Error configuring axios:", error);
  }
};

// Export a default object with all API methods
export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  configureAxios,
};
