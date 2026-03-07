import axios from 'axios';

const api = axios.create({
  // Use a relative URL so requests go through Vite's proxy to localhost:8000
  // This avoids IP address issues when accessing via network
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for errors and Auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export const analyzeImage = (formData) => api.post('/analyze-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getPlants = () => api.get('/plants');
export const getPlantHistory = (id) => api.get(`/growth-history/${id}`);

export default api;
