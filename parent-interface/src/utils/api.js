import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('parentToken'); // CHANGED: localStorage → sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.warn('Network/CORS error - server may be unreachable:', error.message);
      return Promise.reject({ 
        ...error, 
        isNetworkError: true,
        message: 'Unable to connect to server. Please check your connection or try again later.' 
      });
    }

    if (error.response?.status === 401) {
      sessionStorage.removeItem('parentToken');      // CHANGED
      sessionStorage.removeItem('parentData');         // CHANGED
      localStorage.removeItem('activeAppointment');    // keep (queue data)
      localStorage.removeItem('parentSessionActive');  // CHANGED to sessionStorage if you use it
      localStorage.removeItem('parentSessionTimestamp'); // CHANGED to sessionStorage if you use it
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  signup: (data) => api.post('/auth/parent/signup', data),
  login: (data) => api.post('/auth/parent/login', data),
  verifyToken: () => api.get('/auth/verify'),
};

export const parentAPI = {
  send3MinWarning: (appointmentId) => api.post(`/parent/queue-status/${appointmentId}/send-3min-warning`),
  send3MinWhatsApp: (appointmentId) => api.post(`/parent/queue-status/${appointmentId}/send-3min-whatsapp`),
  getProfile: () => api.get('/parent/profile'),
  updateProfile: (data) => api.put('/parent/profile', data),
  getIssueTypes: () => api.get('/parent/issue-types'),
  getAvailableStaff: (issueTypeId) => api.get(`/parent/available-staff?issueTypeId=${issueTypeId}`),
  createAppointment: (data) => api.post('/parent/appointments', data),
  getMyAppointments: () => api.get('/parent/my-appointments'),
  getActiveAppointment: () => api.get('/parent/active-appointment'),
  cancelAppointment: (id) => api.post(`/parent/appointments/${id}/cancel`),
  getQueueStatus: (appointmentId) => api.get(`/parent/queue-status/${appointmentId}`),
  getNotifications: () => api.get('/parent/notifications'),
  markNotificationRead: (id) => api.put(`/parent/notifications/${id}/read`),
  getStats: () => api.get('/parent/stats'),
};

export const staffAPI = {
  getStaffDetails: (id) => api.get(`/staff/${id}`),
};