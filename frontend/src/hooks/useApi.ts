import axios from 'axios';

const API_BASE_URL = 'http://localhost:5253/api';

// Create a singleton axios instance to ensure session cookies persist across requests
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send session cookies with every request
});

/**
 * Custom hook that returns the shared axios instance
 * with the API base URL already set.
 * 
 * Using a singleton ensures session cookies are properly maintained
 * across all API calls.
 */
export const useApi = () => {
  return apiInstance;
};
