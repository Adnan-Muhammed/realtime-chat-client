import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Request interceptor to attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('swilaAccessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh
api.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;

  // If error is 401 and token expired, and we haven't already retried
  if (error.response && error.response.status === 401 && error.response.data.message === 'token_expired' && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('swilaRefreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint directly using axios (not the api instance to avoid loops)
      const res = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
        token: refreshToken
      });

      if (res.data.success) {
        // Save new access token
        localStorage.setItem('swilaAccessToken', res.data.accessToken);

        // Update authorization header for the original request and retry
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      }
    } catch (refreshError) {
      console.error('Refresh token failed:', refreshError);
      // Clear storage and redirect to login if refresh fails
      localStorage.removeItem('swilaAccessToken');
      localStorage.removeItem('swilaRefreshToken');
      localStorage.removeItem('swilaUser');
      window.location.href = '/'; // Simple way to reset state
    }
  }

  return Promise.reject(error);
});

export default api;
