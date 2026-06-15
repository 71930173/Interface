import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// SECURITY FIX: Read from sessionStorage first, then localStorage fallback
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - NEVER redirect on 401, just reject
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials, type) => api.post(`/${type}/login`, credentials),
  signup: (data, type) => api.post(`/${type}/signup`, data),
  verify: () => api.get('/auth/verify'),
  logout: () => {
    // SECURITY FIX: Clear both storages to be safe
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
  },
};

// Student API
export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getIssueTypes: () => api.get('/student/issue-types'),
  getAvailableStaff: (issueTypeId) => api.get('/student/available-staff', { params: { issueTypeId } }),
  createAppointment: (data) => api.post('/student/appointments', {
    staff_id: parseInt(data.staff_id),
    issue_type_id: parseInt(data.issue_type_id),
    description: data.description || ''
  }),
  getMyAppointments: () => api.get('/student/my-appointments'),
  getActiveAppointment: () => api.get('/student/active-appointment'),
  cancelAppointment: (id) => api.post(`/student/appointments/${id}/cancel`),
  getQueueStatus: (appointmentId) => api.get(`/student/queue-status/${appointmentId}`),
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id) => api.put(`/student/notifications/${id}/read`),
  getStats: () => api.get('/student/stats'),
  sendEmail: (data) => api.post('/send-email', data),
  sendSMS: (data) => api.post('/send-sms', data),
  sendWhatsApp: (data) => api.post('/send-whatsapp', data),
  send3MinWarning: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-3min-warning`),
  send3MinWhatsApp: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-3min-whatsapp`),
  sendTurnNowEmail: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-turn-now`),
  sendTurnNowWhatsApp: (appointmentId) => api.post(`/student/queue-status/${appointmentId}/send-turn-now-whatsapp`),
};

// Parent API
export const parentAPI = {
  getProfile: () => api.get('/parent/profile'),
  updateProfile: (data) => api.put('/parent/profile', data),
  getIssueTypes: () => api.get('/parent/issue-types'),
  getAvailableStaff: (issueTypeId) => api.get('/parent/available-staff', { params: { issueTypeId } }),
  createAppointment: (data) => api.post('/parent/appointments', {
    staff_id: parseInt(data.staff_id),
    issue_type_id: parseInt(data.issue_type_id),
    description: data.description || ''
  }),
  getMyAppointments: () => api.get('/parent/my-appointments'),
  getActiveAppointment: () => api.get('/parent/active-appointment'),
  cancelAppointment: (id) => api.post(`/parent/appointments/${id}/cancel`),
  getQueueStatus: (appointmentId) => api.get(`/parent/queue-status/${appointmentId}`),
  getNotifications: () => api.get('/parent/notifications'),
  markNotificationRead: (id) => api.put(`/parent/notifications/${id}/read`),
  getStats: () => api.get('/parent/stats'),
};

// Staff API
export const staffAPI = {
  getProfile: () => api.get('/staff/profile'),
  updateProfile: (data) => api.put('/staff/profile', data),
  getQueue: () => api.get('/staff/queue'),
  getCurrentAppointment: () => api.get('/staff/current-appointment'),
  serveNext: () => api.post('/staff/serve-next'),
  completeCurrent: (data) => api.post('/staff/complete', data),
  pauseQueue: (reason) => api.post('/staff/pause', { reason }),
  resumeQueue: () => api.post('/staff/resume'),
  setAvailability: (available) => api.put('/staff/availability', { is_available: available }),
  getStats: () => api.get('/staff/stats'),
  getNotifications: () => api.get('/staff/notifications'),
  markNotificationRead: (id) => api.put(`/staff/notifications/${id}/read`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStaff: () => api.get('/admin/staff'),
  getStudents: () => api.get('/admin/students'),
  getParents: () => api.get('/admin/parents'),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getStats: () => api.get('/admin/stats'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  exportData: (type, params) => api.get(`/export/${type}`, { params }),
};