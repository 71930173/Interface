import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import api from '../utils/api';

const ProtectedRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState(() => {
    // FIXED: Use localStorage (same as AuthContext)
    const token = sessionStorage.getItem('parentToken');
    const parentData = sessionStorage.getItem('parentData');
    if (!token || !parentData) return { isChecking: false, isValid: false };
    return { isChecking: true, isValid: false };
  });

  // FIXED: Use useEffect for navigation instead of Navigate component
  // This prevents infinite loop
  useEffect(() => {
    if (!authState.isChecking && !authState.isValid) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [authState.isChecking, authState.isValid, navigate, location.pathname]);

  useEffect(() => {
    if (!authState.isChecking) return;

    let cancelled = false;

    const verifyAuth = async () => {
      // FIXED: Use localStorage (same as AuthContext)
      const token = sessionStorage.getItem('parentToken');
      const parentData = sessionStorage.getItem('parentData');

      if (!token || !parentData) {
        if (!cancelled) setAuthState({ isChecking: false, isValid: false });
        return;
      }

      try {
        const parsed = JSON.parse(parentData);
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid');
      } catch {
        // FIXED: Use localStorage
        sessionStorage.removeItem('parentToken');
        sessionStorage.removeItem('parentData');
        sessionStorage.removeItem('activeAppointment');
        if (!cancelled) setAuthState({ isChecking: false, isValid: false });
        return;
      }

      try {
        const response = await api.get('/auth/verify');
        const data = response.data;

        if (!cancelled) {
          if (data.valid && data.user?.userType === 'parent') {
            setAuthState({ isChecking: false, isValid: true });
          } else {
            throw new Error('Not parent');
          }
        }
      } catch (error) {
        // FIXED: Use localStorage
        sessionStorage.removeItem('parentToken');
        sessionStorage.removeItem('parentData');
        sessionStorage.removeItem('activeAppointment');
        if (!cancelled) setAuthState({ isChecking: false, isValid: false });
      }
    };

    verifyAuth();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FIXED: Return null instead of Navigate when not valid
  // Navigation is handled by useEffect above
  if (!authState.isChecking && !authState.isValid) {
    return null; // Return null while redirecting
  }

  if (authState.isChecking) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', zIndex: 99999
      }}>
        <div style={{
          width: 50, height: 50,
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;