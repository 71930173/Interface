import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { parentAPI } from '../utils/api';
import { toast } from 'react-toastify';

const QueueContext = createContext();

const STORAGE_KEYS = {
  appointment: 'activeAppointment',
  timerStart: 'queueTimerStart',
  appointmentId: 'queueTimerAppointmentId',
  warningSent: 'queueWarningSent',
  emailSent: 'queueEmailSent',
};

export const QueueProvider = ({ children }) => {
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [peopleBefore, setPeopleBefore] = useState(0);
  const [warningSent, setWarningSent] = useState(false);

  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const warningEmailSentRef = useRef(false);
  const isMountedRef = useRef(true);
  const activeAppointmentRef = useRef(activeAppointment);
  const warningSentRef = useRef(warningSent);
  const lastServerRemainingRef = useRef(0);
  const lastNotifiedRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    activeAppointmentRef.current = activeAppointment;
  }, [activeAppointment]);

  useEffect(() => {
    warningSentRef.current = warningSent;
  }, [warningSent]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearAllIntervals();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAllIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Listen for storage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'parentToken' && !e.newValue) {
        clearAllIntervals();
        setActiveAppointment(null);
        setQueueStatus(null);
        setRemainingTime(null);
        setPeopleBefore(0);
        setWarningSent(false);
        warningEmailSentRef.current = false;
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAllIntervals]);

  // FIXED: Define fetchQueueStatus BEFORE useEffect
  const fetchQueueStatus = useCallback(async (appointmentId) => {
    if (!appointmentId) return;

    try {
      const response = await parentAPI.getQueueStatus(appointmentId);
      const status = response.data;

      if (!isMountedRef.current) return;

      setQueueStatus(status);
      setPeopleBefore(status.people_before || 0);

      if (status.remaining_seconds !== undefined) {
        const serverRemaining = status.remaining_seconds;

        setRemainingTime(prev => {
          if (prev === null || prev === undefined) {
            return serverRemaining;
          }
          if (serverRemaining > prev) {
            return serverRemaining;
          }
          return serverRemaining;
        });

        lastServerRemainingRef.current = serverRemaining;
      }

      if (status.status === 'serving') {
        if (activeAppointmentRef.current?.status !== 'serving') {
          setActiveAppointment(prev => prev ? { ...prev, status: 'serving' } : null);
          toast.success("It's your turn! Please enter the office now.", {
            autoClose: false,
            icon: '🎉',
          });
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setRemainingTime(0);
        setPeopleBefore(0);
      }

      if (status.status === 'served') {
        setActiveAppointment(prev => prev ? { ...prev, status: 'served' } : null);
        toast.success('Your appointment has been completed!', {
          autoClose: 8000,
          icon: '✅',
        });
        clearAllIntervals();
        clearStorage();
      }

      if (status.status === 'resolved_remotely') {
        setActiveAppointment(prev => prev ? { ...prev, status: 'resolved_remotely', resolution_note: status.resolution_note } : null);
        toast.success(
          <div>
            <div style={{fontWeight: 700, marginBottom: 4}}>✅ Issue Resolved Remotely</div>
            <div style={{fontSize: 13}}>No need to visit the office.</div>
            {status.resolution_note && (
              <div style={{fontSize: 12, marginTop: 6, padding: '6px 8px', background: '#ede9fe', borderRadius: 6, color: '#5b21b6'}}>
                <strong>Note:</strong> {status.resolution_note}
              </div>
            )}
          </div>,
          { autoClose: 10000 }
        );
        clearAllIntervals();
        clearStorage();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        clearAllIntervals();
        setActiveAppointment(null);
        setQueueStatus(null);
      } else if (error.code !== 'ERR_NETWORK') {
        console.error('Queue status fetch error:', error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for new notifications (staff pause alerts)
  const checkNotifications = useCallback(async () => {
    try {
      const response = await parentAPI.getNotifications();
      const notifications = response.data || [];

      // Find unread queue_paused notifications
      const pausedNotifications = notifications.filter(
        n => n.notification_type === 'queue_paused' && !n.is_read && n.id > lastNotifiedRef.current
      );

      if (pausedNotifications.length > 0) {
        // Show toast for the most recent one
        const latest = pausedNotifications[0];
        lastNotifiedRef.current = latest.id;

        toast.warning(
          <div>
            <div style={{fontWeight: 700, marginBottom: 4}}>⏸️ Staff Paused</div>
            <div style={{fontSize: 13}}>The staff member is temporarily unavailable. Your wait time has been extended.</div>
          </div>,
          { autoClose: 10000 }
        );

        // Mark as read
        parentAPI.markNotificationRead(latest.id).catch(() => {});
      }
    } catch (error) {
      // Silent fail - don't break queue polling
    }
  }, []);

  // FIXED: Define fetchActiveAppointmentFromServer BEFORE useEffect
  const fetchActiveAppointmentFromServer = useCallback(async () => {
    try {
      const response = await parentAPI.getActiveAppointment();
      const appointment = response.data;

      if (appointment && appointment.id) {
        setActiveAppointment(appointment);
        localStorage.setItem(STORAGE_KEYS.appointment, JSON.stringify(appointment));
        fetchQueueStatus(appointment.id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.appointment);
      }
    } catch (error) {
      console.error('Fetch active appointment error:', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchQueueStatus]);

  // FIXED: Load on mount - ALWAYS fetch from server, no initRef blocking
  useEffect(() => {
    const token = sessionStorage.getItem('parentToken');
    if (!token) {
      clearStorage();
      setActiveAppointment(null);
      return;
    }

    // Always fetch from server when component mounts (after login)
    fetchActiveAppointmentFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist active appointment to localStorage
  useEffect(() => {
    if (activeAppointment) {
      localStorage.setItem(STORAGE_KEYS.appointment, JSON.stringify(activeAppointment));
    } else {
      localStorage.removeItem(STORAGE_KEYS.appointment);
    }
  }, [activeAppointment]);

  // MAIN QUEUE STATUS POLLING
  useEffect(() => {
    if (!activeAppointment || activeAppointment.status === 'served' || activeAppointment.status === 'cancelled' || activeAppointment.status === 'resolved_remotely') {
      clearAllIntervals();
      return;
    }

    fetchQueueStatus(activeAppointment.id);
    checkNotifications();
    intervalRef.current = setInterval(() => {
      fetchQueueStatus(activeAppointment.id);
      checkNotifications();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAppointment?.id, activeAppointment?.status]);

  // Countdown timer
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) return;
    if (activeAppointment?.status === 'serving' || activeAppointment?.status === 'resolved_remotely') {
      setRemainingTime(0);
      return;
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime === null ? -1 : remainingTime > 0 ? 1 : 0, activeAppointment?.status]);

  // 3-minute warning
  useEffect(() => {
    if (remainingTime === null || remainingTime > 180) return;
    if (remainingTime <= 0) return;
    if (warningSent) return;
    if (activeAppointment?.status === 'serving' || activeAppointment?.status === 'resolved_remotely') return;

    setWarningSent(true);
    localStorage.setItem(STORAGE_KEYS.warningSent, 'true');

    toast.warning('Your turn is coming up in about 3 minutes! Please be ready.', {
      autoClose: 10000,
      icon: '⏰',
    });

    if (!warningEmailSentRef.current) {
      warningEmailSentRef.current = true;
      localStorage.setItem(STORAGE_KEYS.emailSent, 'true');
      send3MinWarning(activeAppointment.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime, warningSent, activeAppointment?.id, activeAppointment?.status]);

  // Initialize timer
  useEffect(() => {
    if (!activeAppointment?.id) return;

    const storedStart = localStorage.getItem(STORAGE_KEYS.timerStart);
    const storedAppointmentId = localStorage.getItem(STORAGE_KEYS.appointmentId);
    const storedWarning = localStorage.getItem(STORAGE_KEYS.warningSent);
    const storedEmail = localStorage.getItem(STORAGE_KEYS.emailSent);

    if (storedStart && storedAppointmentId === String(activeAppointment.id)) {
      const startTime = parseInt(storedStart);
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const originalEstimate = (activeAppointment.estimated_wait_minutes || 0) * 60;
      const remaining = Math.max(0, originalEstimate - elapsedSeconds);

      if (remaining > 0) {
        setRemainingTime(remaining);
      } else {
        setRemainingTime(0);
      }
    } else {
      const initialSeconds = (activeAppointment.estimated_wait_minutes || 0) * 60;
      const effectiveSeconds = initialSeconds > 0 ? initialSeconds : 0;

      setRemainingTime(effectiveSeconds);

      localStorage.setItem(STORAGE_KEYS.timerStart, Date.now().toString());
      localStorage.setItem(STORAGE_KEYS.appointmentId, String(activeAppointment.id));
      localStorage.removeItem(STORAGE_KEYS.warningSent);
      localStorage.removeItem(STORAGE_KEYS.emailSent);
      setWarningSent(false);
      warningEmailSentRef.current = false;
    }

    if (storedWarning === 'true' && storedAppointmentId === String(activeAppointment.id)) {
      setWarningSent(true);
    }

    if (storedEmail === 'true' && storedAppointmentId === String(activeAppointment.id)) {
      warningEmailSentRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAppointment?.id, activeAppointment?.estimated_wait_minutes]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.appointment);
    localStorage.removeItem(STORAGE_KEYS.timerStart);
    localStorage.removeItem(STORAGE_KEYS.appointmentId);
    localStorage.removeItem(STORAGE_KEYS.warningSent);
    localStorage.removeItem(STORAGE_KEYS.emailSent);
    // Also clear any per-appointment warning sent flags
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('warningSent_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, []);

  // ============================================
  // NEW: Send 3-minute warning via WhatsApp (UltraMsg) + Email backup
  // ============================================
  const isSendingWarningRef = useRef(false);

  const send3MinWarning = useCallback(async (appointmentId) => {
    // Guard: prevent duplicate sends for same appointment
    if (isSendingWarningRef.current) {
      console.log('3-min warning already in flight, skipping duplicate');
      return;
    }
    // Guard: check localStorage to prevent re-send after refresh
    const sentKey = `warningSent_${appointmentId}`;
    if (localStorage.getItem(sentKey) === 'true') {
      console.log('3-min warning already sent for appointment', appointmentId);
      return;
    }

    isSendingWarningRef.current = true;
    try {
      // Send WhatsApp first (primary)
      const waResponse = await parentAPI.send3MinWhatsApp(appointmentId);
      console.log('3-minute WhatsApp result:', waResponse.data);

      // Also try email as backup
      try {
        await parentAPI.send3MinWarning(appointmentId);
        console.log('3-minute email backup sent');
      } catch (emailErr) {
        console.log('Email backup failed:', emailErr.message);
      }

      // Mark as sent in localStorage so it won't send again
      localStorage.setItem(sentKey, 'true');
    } catch (error) {
      console.error('Failed to send 3-minute warning:', error);
    } finally {
      isSendingWarningRef.current = false;
    }
  }, []);

  const createQueue = useCallback(async (data) => {
    try {
      setIsLoading(true);
      const response = await parentAPI.createAppointment(data);
      const appointment = response.data;

      setActiveAppointment(appointment);
      setWarningSent(false);
      warningEmailSentRef.current = false;

      const initialPeopleBefore = Math.max(0, (appointment.queue_position || 1) - 1);
      setPeopleBefore(initialPeopleBefore);

      const initialMinutes = appointment.estimated_wait_minutes || 0;
      const initialSeconds = initialMinutes * 60;

      setRemainingTime(initialSeconds);

      localStorage.setItem(STORAGE_KEYS.timerStart, Date.now().toString());
      localStorage.setItem(STORAGE_KEYS.appointmentId, String(appointment.id));
      localStorage.removeItem(STORAGE_KEYS.warningSent);
      localStorage.removeItem(STORAGE_KEYS.emailSent);

      toast.success(`Queue confirmed! Your number is #${appointment.ticket_number}`);
      return { success: true, appointment };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create queue. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelQueue = useCallback(async () => {
    if (!activeAppointmentRef.current) return { success: false };

    try {
      setIsLoading(true);
      await parentAPI.cancelAppointment(activeAppointmentRef.current.id);

      clearAllIntervals();

      setActiveAppointment(null);
      setQueueStatus(null);
      setRemainingTime(null);
      setPeopleBefore(0);
      setWarningSent(false);
      warningEmailSentRef.current = false;

      clearStorage();

      toast.success('Queue cancelled successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to cancel queue.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [clearAllIntervals, clearStorage]);

  const refreshQueue = useCallback(async () => {
    if (!activeAppointmentRef.current) return;

    try {
      const response = await parentAPI.getQueueStatus(activeAppointmentRef.current.id);
      const status = response.data;
      setQueueStatus(status);
      setPeopleBefore(status.people_before || 0);

      if (status.remaining_seconds !== undefined) {
        const serverRemaining = status.remaining_seconds;

        setRemainingTime(prev => {
          if (prev === null || prev === undefined) {
            return serverRemaining;
          }
          if (serverRemaining > prev) {
            return serverRemaining;
          }
          return serverRemaining;
        });
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, []);

  const hasActiveQueue = useCallback(() => {
    const token = sessionStorage.getItem('parentToken');
    if (!token) return false;
    return activeAppointmentRef.current && ['waiting', 'serving'].includes(activeAppointmentRef.current.status);
  }, []);

  const clearQueue = useCallback(() => {
    clearAllIntervals();
    setActiveAppointment(null);
    setQueueStatus(null);
    setRemainingTime(null);
    setPeopleBefore(0);
    setWarningSent(false);
    warningEmailSentRef.current = false;
    clearStorage();
  }, [clearAllIntervals, clearStorage]);

  // ============================================
  // MINIMAL FIX: Detect login and re-fetch active appointment
  // Placed after clearStorage to avoid ESLint no-use-before-define
  // ============================================
    useEffect(() => {
    let lastToken = sessionStorage.getItem('parentToken');
    let isFetching = false;

    const interval = setInterval(() => {
      const currentToken = sessionStorage.getItem('parentToken');
      if (currentToken && !lastToken && !isFetching) {
        lastToken = currentToken;
        isFetching = true;
        fetchActiveAppointmentFromServer().finally(() => {
          isFetching = false;
        });
      }
      else if (!currentToken && lastToken) {
        lastToken = null;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchActiveAppointmentFromServer]);

  return (
    <QueueContext.Provider value={{
      activeAppointment,
      queueStatus,
      isLoading,
      remainingTime,
      peopleBefore,
      createQueue,
      cancelQueue,
      refreshQueue,
      hasActiveQueue,
      clearQueue,
      setActiveAppointment,
      checkNotifications,
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within QueueProvider');
  }
  return context;
};