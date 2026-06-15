export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTime = (seconds) => {
  if (seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatWaitTime = (minutes) => {
  if (minutes <= 0) return '0 min';
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 min';
  return `${Math.ceil(minutes)} mins`;
};

export const getPriorityLabel = (isParentPriority) => {
  return isParentPriority ? 'Priority' : 'Standard';
};

export const getStatusColor = (status) => {
  const colors = {
    waiting: { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
    serving: { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' },
    served: { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' },
    cancelled: { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
    paused: { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' },
    no_show: { bg: '#fef2f2', text: '#991b1b', border: '#ef4444' },
  };
  return colors[status] || colors.waiting;
};

export const getStatusLabel = (status) => {
  const labels = {
    waiting: 'Waiting',
    serving: 'Now Serving',
    served: 'Completed',
    cancelled: 'Cancelled',
    paused: 'Paused',
    no_show: 'No Show',
  };
  return labels[status] || status;
};

export const generateTicketNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const calculateEstimatedWait = (queuePosition, avgServiceTime = 5) => {
  return queuePosition * avgServiceTime;
};

export const validatePhone = (phone) => {
  const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return regex.test(phone);
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};