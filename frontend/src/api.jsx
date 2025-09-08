import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api",
  withCredentials: true,
});

// JWT Token Management
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Request interceptor to add JWT token to headers
API.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors for authenticated requests
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API.defaults.baseURL}/therapist-refresh/`,
            { refresh_token: refreshToken }
          );
          
          const { access_token } = response.data;
          setTokens(access_token, refreshToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return API(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens but don't redirect automatically
          clearTokens();
          console.log('Token refresh failed, user needs to login again');
          // Dispatch custom event to notify UserContext
          window.dispatchEvent(new CustomEvent('tokenExpired'));
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear storage but don't redirect automatically
        clearTokens();
        console.log('No refresh token available, user needs to login');
        // Dispatch custom event to notify UserContext
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
    }
    
    return Promise.reject(error);
  }
);

console.log('🔧 API Configuration:', {
  baseURL: API.defaults.baseURL,
  env: process.env.REACT_APP_BACKEND_URL,
  withCredentials: API.defaults.withCredentials
});

// Patient APIs
export const getPatient = (id) => API.get(`/patients/${id}`);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const updatePatientPassword = (id, password) =>
  API.put(`/patients/${id}/password`, { password });

// Therapist APIs
export const getTherapists = () => API.get(`/therapists/`);
export const getTherapist = (id) => API.get(`/therapists/${id}`);
export const updateTherapist = (id, data) => API.put(`/therapists/${id}`, data);
export const uploadTherapistPic = (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return API.post(`/therapists/${id}/profile-picture`, formData);
};
export const getTherapistPatients = (id) => API.get(`/therapists/${id}/patients/`);
export const getTherapistCalendarSessions = (id, year, month) => 
  API.get(`/therapists/${id}/calendar_sessions/`, { params: { year, month } });
// Authentication APIs
export const therapistLogin = async (email, password) => {
  const url = `/therapist-login/`;
  const fullUrl = `${API.defaults.baseURL}${url}`;
  console.log('🔗 Therapist Login URL:', { url, fullUrl, baseURL: API.defaults.baseURL });
  
  try {
    const response = await API.post(url, { email, password });
    
    // Store JWT tokens and user data
    if (response.data.access_token) {
      setTokens(response.data.access_token, response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.therapist));
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const therapistLogout = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await API.post('/therapist-logout/', { refresh_token: refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await API.post('/therapist-refresh/', { refresh_token: refreshToken });
  setTokens(response.data.access_token, refreshToken);
  return response.data.access_token;
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Reviews APIs
export const getTherapistReviews = (therapistId) => API.get(`/reviews/?therapist_id=${therapistId}`);
export const createReview = (data) => API.post(`/reviews/`, data);

// Session APIs
export const getSessions = (params = {}) => API.get('/sessions/', { params });
export const getSession = (id) => API.get(`/sessions/${id}/`);
export const updateSessionStatus = (id, status) => API.post(`/sessions/${id}/update_status/`, { status });
export const cancelSession = (sessionId, therapistId, reason = '') => 
  API.post(`/sessions/${sessionId}/cancel_session/`, { 
    therapist_id: therapistId, 
    reason: reason 
  });

// Availability APIs  
export const getTherapistAvailability = (therapistId, date) => 
  API.get(`/availabilities/?therapist_id=${therapistId}&date=${date}`);
export const bookSession = (data) => API.post(`/sessions/`, data);

export default API;

