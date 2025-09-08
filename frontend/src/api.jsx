import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '/api' : "http://localhost:8000/api"),
  withCredentials: true,
});

if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_BACKEND_URL) {
  console.warn('⚠️ No REACT_APP_BACKEND_URL set in production! Falling back to relative /api path');
}

console.log('🔧 API Configuration:', {
  baseURL: API.defaults.baseURL,
  env: process.env.REACT_APP_BACKEND_URL,
  withCredentials: API.defaults.withCredentials
});

// Patient APIs
export const getPatient = (id) => API.get(`/patients/${id}`).catch(error => {
  console.error('API Connection Error:', {
    status: error.response?.status,
    message: error.message,
    baseURL: API.defaults.baseURL
  });
  throw error;
});
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
export const therapistLogin = (email, password) => {
  const url = `/therapist-login/`;
  const fullUrl = `${API.defaults.baseURL}${url}`;
  console.log('🔗 Therapist Login URL:', { url, fullUrl, baseURL: API.defaults.baseURL });
  return API.post(url, { email, password });
};

// Reviews APIs
export const getTherapistReviews = (therapistId) => API.get(`/reviews/?therapist_id=${therapistId}`);
export const createReview = (data) => API.post(`/reviews/`, data);

// Availability APIs  
export const getTherapistAvailability = (therapistId, date) => 
  API.get(`/availabilities/?therapist_id=${therapistId}&date=${date}`);
export const bookSession = (data) => API.post(`/sessions/`, data);

export default API;

