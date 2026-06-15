import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const isPublicPage = () => {
  const path = window.location.pathname;
  const publicPaths = ['/login', '/signup', '/staff/login', '/parent/login', '/parent/signup', '/admin/login'];
  return publicPaths.some(p => path.startsWith(p)) || path === '/';
};

// ============================================================
// SECURITY FIX: sessionStorage by default. localStorage only if rememberMe=true
// This prevents copy-paste URL in new tab from accessing dashboard
// ============================================================
const authStorage = {
  get: (key) => sessionStorage.getItem(key) || localStorage.getItem(key),
  set: (key, value, remember = false) => {
    sessionStorage.setItem(key, value);
    if (remember) localStorage.setItem(key, value);
  },
  remove: (key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(authStorage.get('token'));
  const logoutRef = useRef(null);

  const logout = useCallback(() => {
    authStorage.remove('token');
    authStorage.remove('userType');
    authStorage.remove('user');
    setToken(null);
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
    if (!isPublicPage()) {
      toast.info('Logged out successfully');
    }
  }, []);

  logoutRef.current = logout;

  useEffect(() => {
    const reqInt = axios.interceptors.request.use(
      (config) => {
        const t = authStorage.get('token');
        if (t) config.headers.Authorization = 'Bearer ' + t;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInt = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config && error.config.url ? error.config.url : '';
        const isLoginRequest = url.includes('/login') || url.includes('/signup');
        if (error.response && error.response.status === 401 && !isLoginRequest) {
          if (logoutRef.current) logoutRef.current();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInt);
      axios.interceptors.response.eject(resInt);
    };
  }, []);

  // FIXED: Only verify token on protected pages, NOT on login/signup
  useEffect(() => {
    const verifyToken = async () => {
      if (isPublicPage()) {
        setIsLoading(false);
        return;
      }

      const storedToken = authStorage.get('token');
      const storedUserType = authStorage.get('userType');
      const storedUser = authStorage.get('user');

      if (!storedToken || !storedUserType || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/verify', {
          headers: { Authorization: 'Bearer ' + storedToken }
        });

        if (response.data && response.data.valid) {
          setToken(storedToken);
          setUserType(storedUserType);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + storedToken;
        } else {
          if (logoutRef.current) logoutRef.current();
        }
      } catch (error) {
        console.error('Token verification error:', error.message);
        if (logoutRef.current) logoutRef.current();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  // SECURITY FIX: Added rememberMe parameter
  const login = useCallback(async (credentials, type, rememberMe = false) => {
    try {
      const endpoint = type === 'student' ? '/student/login' :
                      type === 'parent' ? '/parent/login' :
                      type === 'staff' ? '/auth/staff-login' :
                      type === 'admin' ? '/auth/admin-login' : '/auth/login';

      const response = await axios.post(endpoint, credentials, { maxRedirects: 0 });

      if (response.data && response.data.success) {
        const newToken = response.data.token;
        const userData = response.data[type] || response.data.student || response.data.parent || response.data.staff || response.data.admin;

        // SECURITY FIX: Store in sessionStorage. localStorage only if rememberMe=true
        authStorage.set('token', newToken, rememberMe);
        authStorage.set('userType', type, rememberMe);
        authStorage.set('user', JSON.stringify(userData), rememberMe);

        setToken(newToken);
        setUserType(type);
        setUser(userData);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;

        toast.success('Welcome back, ' + (userData.firstName || userData.first_name || userData.name) + '!');
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data?.error || 'Wrong ID or password' };
      }
    } catch (error) {
      let message = 'Wrong ID or password';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (typeof data === 'string') {
          if (status === 500) message = 'Server error, please try again';
          else if (status === 401) message = 'Wrong ID or password';
          else message = 'Server error, please try again';
        } else if (data && typeof data === 'object') {
          if (data.error) message = data.error;
          else if (data.message) message = data.message;
        }
      } else if (error.request) {
        message = 'Cannot connect to server. Please check your internet.';
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, error: message };
    }
  }, []);

  const signup = useCallback(async (data, type, rememberMe = false) => {
    try {
      const endpoint = type === 'student' ? '/student/signup' : '/parent/signup';
      const response = await axios.post(endpoint, data);

      if (response.data && response.data.success) {
        const newToken = response.data.token;
        const userData = response.data[type] || response.data.student || response.data.parent;

        // SECURITY FIX: Same storage logic
        authStorage.set('token', newToken, rememberMe);
        authStorage.set('userType', type, rememberMe);
        authStorage.set('user', JSON.stringify(userData), rememberMe);

        setToken(newToken);
        setUserType(type);
        setUser(userData);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        toast.success('Account created successfully!');
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.data?.error || 'Signup failed' };
      }
    } catch (error) {
      let message = 'Signup failed';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (typeof data === 'string') {
          if (status === 409) message = 'Student ID or email already exists';
          else if (status === 500) message = 'Server error, please try again';
          else message = 'Signup failed, please try again';
        } else if (data && typeof data === 'object') {
          if (data.error) message = data.error;
          else if (data.message) message = data.message;
        }
      } else if (error.request) {
        message = 'Cannot connect to server. Please check your internet.';
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, error: message };
    }
  }, []);

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    // Keep in same storage location as original
    const currentToken = authStorage.get('token');
    const isRemembered = localStorage.getItem('token') === currentToken;
    authStorage.set('user', JSON.stringify(updatedUser), isRemembered);
  }, [user]);

  const value = {
    user, userType, isAuthenticated, isLoading, token,
    login, signup, logout, updateUser,
    isStudent: userType === 'student',
    isParent: userType === 'parent',
    isStaff: userType === 'staff',
    isAdmin: userType === 'admin',
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export default AuthContext;