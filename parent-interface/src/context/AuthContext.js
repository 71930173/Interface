import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      const token = sessionStorage.getItem('parentToken');
      const parentData = sessionStorage.getItem('parentData');

            if (!token || !parentData) {
        setIsLoading(false);
        setIsAuthenticated(false); // Explicitly set false
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(parentData);
        // Only verify if we have a token
        await authAPI.verifyToken();
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth verification failed:', error);
        sessionStorage.removeItem('parentToken');
        sessionStorage.removeItem('parentData');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      const { token, parent } = response.data;

      sessionStorage.setItem('parentToken', token);
      sessionStorage.setItem('parentData', JSON.stringify(parent));

      setUser(parent);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data) => {
    try {
      setIsLoading(true);
      const response = await authAPI.signup(data);
      const { token, parent } = response.data;

      sessionStorage.setItem('parentToken', token);
      sessionStorage.setItem('parentData', JSON.stringify(parent));

      setUser(parent);
      setIsAuthenticated(true);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Signup failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('parentToken');
    sessionStorage.removeItem('parentData');
    localStorage.removeItem('activeAppointment');
    localStorage.removeItem('queueTimerStart');
    localStorage.removeItem('queueTimerAppointmentId');
    localStorage.removeItem('queueWarningSent');
    localStorage.removeItem('queueEmailSent');

    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      sessionStorage.setItem('parentData', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      signup, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};