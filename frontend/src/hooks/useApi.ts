import axios from 'axios';

const API_BASE_URL = 'http://localhost:5253/api';

/**
 * Custom hook that returns a pre-configured axios instance
 * with the API base URL already set.
 */
export const useApi = () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  return api;
};
