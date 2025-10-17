// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const planAPI = {
  generatePlan: (goalData) => API.post('/plans/generate', goalData),
  getPlan: (id) => API.get(`/plans/${id}`),
  getAllPlans: () => API.get('/plans'),
  deletePlan: (id) => API.delete(`/plans/${id}`),
};

export default API;