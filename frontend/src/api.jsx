import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api",
  withCredentials: true,
});

// Patient APIs
export const getPatient = (id) => API.get(`/patients/${id}`);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const updatePatientPassword = (id, password) =>
  API.put(`/patients/${id}/password`, { password });

// Therapist APIs
export const getTherapist = (id) => API.get(`/therapists/${id}`);
export const updateTherapist = (id, data) => API.put(`/therapists/${id}`, data);
export const uploadTherapistPic = (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return API.post(`/therapists/${id}/profile-picture`, formData);
};

export default API;

