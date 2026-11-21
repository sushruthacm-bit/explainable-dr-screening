import axios from 'axios';

// Backend default URL: http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // Retinal AI analysis may take several seconds
  headers: {
    'Accept': 'application/json',
  },
});

// Response interceptor for clear and meaningful error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected network error occurred.';
    if (error.response) {
      // Backend returned an error response
      message = error.response.data?.message || 
                error.response.data?.error || 
                `Server Error (${error.response.status}): ${error.response.statusText}`;
    } else if (error.request) {
      // No response received (backend is offline or unreachable)
      message = `Cannot reach ROSHNI backend at ${API_BASE_URL}. Ensure your Node.js/Express server is running on port 5000.`;
    } else {
      message = error.message;
    }
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.originalError = error;
    return Promise.reject(customError);
  }
);

export const checkBackendHealth = async () => {
  try {
    const res = await api.get('/api/health');
    return { online: true, data: res.data };
  } catch (err) {
    return { 
      online: false, 
      error: err.message, 
      apiUrl: API_BASE_URL 
    };
  }
};

export default api;
export { API_BASE_URL };
