import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { parentAPI } from '../utils/api';
import { 
  Clock, 
  MapPin,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Zap,
  RefreshCw,
  Home
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const WaitingScreen = () => {
  useAuth();
  const { 
    activeAppointment, 
    queueStatus, 
    remainingTime, 
    peopleBefore,
    cancelQueue,
    isLoading: queueLoading,
    refreshQueue
  } = useQueue();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [displayTime, setDisplayTime] = useState(remainingTime || 0);
  const [localPeopleBefore, setLocalPeopleBefore] = useState(peopleBefore);
  const [threeMinWarningShown, setThreeMinWarningShown] = useState(false);
  const [pauseAlert, setPauseAlert] = useState(null);
  const timerRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const lastServerTimeRef = useRef(0);

  // FIXED: Sync with server time - extend when queue changes, snap when normal
  useEffect(() => {
    if (remainingTime !== null && remainingTime >= 0) {
      setDisplayTime(prev => {
        // If server time is greater than current, extend (queue changed)
        if (remainingTime > prev) {
          return remainingTime;
        }
        // If server time is less, snap to it (normal countdown)
        return remainingTime;
      });
      lastServerTimeRef.current = remainingTime;
    }
  }, [remainingTime]);

  useEffect(() => {
    setLocalPeopleBefore(peopleBefore);
  }, [peopleBefore]);

  // Local countdown timer - decreases 1 second at a time
  useEffect(() => {
    if (activeAppointment?.status === 'serving') {
      setDisplayTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (displayTime > 0) {
      timerRef.current = setInterval(() => {
        setDisplayTime(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAppointment?.status]);

  // FIXED: Auto-refresh from server every 10 seconds
  useEffect(() => {
    if (activeAppointment?.status === 'waiting') {
      refreshIntervalRef.current = setInterval(() => {
        refreshQueue();
      }, 10000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAppointment?.status, activeAppointment?.id]);

  // 3-minute warning
  useEffect(() => {
    if (displayTime <= 180 && displayTime > 170 && !threeMinWarningShown && activeAppointment?.status === 'waiting') {
      setThreeMinWarningShown(true);
      // Trigger 3-min warning (can be expanded to call API)
      console.log('3-minute warning triggered');
    }
  }, [displayTime, activeAppointment?.status, threeMinWarningShown]);

  // Handle no active appointment
  useEffect(() => {
    if (!activeAppointment) {
      const timer = setTimeout(() => navigate('/dashboard'), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeAppointment, navigate]);

  // ADDED: Auto-redirect when resolved remotely
  useEffect(() => {
    if (activeAppointment?.status === 'resolved_remotely') {
      const timer = setTimeout(() => navigate('/dashboard'), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeAppointment?.status, navigate]);

  // Check for staff pause/resume notifications
  useEffect(() => {
    const checkPause = async () => {
      try {
        const res = await parentAPI.getNotifications();
        const notifications = res.data || [];
        const paused = notifications.find(n => n.notification_type === 'queue_paused' && !n.is_read);
        const resumed = notifications.find(n => n.notification_type === 'queue_resumed' && !n.is_read);
        if (paused) {
          setPauseAlert({ ...paused, alertType: 'paused' });
          parentAPI.markNotificationRead(paused.id).catch(() => {});
        }
        if (resumed) {
          setPauseAlert({ ...resumed, alertType: 'resumed' });
          parentAPI.markNotificationRead(resumed.id).catch(() => {});
        }
      } catch (e) {}
    };
    checkPause();
    const interval = setInterval(checkPause, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = useCallback(async () => {
    const result = await cancelQueue();
    if (result.success) {
      setShowCancelConfirm(false);
      navigate('/dashboard');
    }
  }, [cancelQueue, navigate]);

  const formatTime = useCallback((totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined) return '--:--';
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgressColor = useCallback(() => {
    if (displayTime === null || displayTime <= 0) return '#22c55e';
    const totalMinutes = queueStatus?.estimated_wait_minutes || Math.max(localPeopleBefore, 1) * 5;
    const total = totalMinutes * 60;
    const percentage = displayTime / total;
    if (percentage > 0.6) return '#22c55e';
    if (percentage > 0.3) return '#f59e0b';
    return '#ef4444';
  }, [displayTime, localPeopleBefore, queueStatus]);

  const getProgress = useCallback(() => {
    if (displayTime === null || displayTime <= 0) return 100;
    const totalMinutes = queueStatus?.estimated_wait_minutes || Math.max(localPeopleBefore, 1) * 5;
    const total = totalMinutes * 60;
    if (total <= 0) return 100;
    return Math.max(0, Math.min(100, (displayTime / total) * 100));
  }, [displayTime, localPeopleBefore, queueStatus]);

  const isRTL = dir === 'rtl';

  if (!activeAppointment) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        background: '#f8fafc'
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #e2e8f0',
          borderTopColor: '#1e40af',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500 }}>
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  const isServing = activeAppointment.status === 'serving';
  const isResolvedRemote = activeAppointment.status === 'resolved_remotely';
  const isWarning = displayTime !== null && displayTime <= 180 && displayTime > 0 && !isServing && !isResolvedRemote;

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: isServing || isResolvedRemote
        ? 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #dbeafe 100%)'
    }}>
      <AnimatedBackground variant={isServing || isResolvedRemote ? 'hero' : 'default'} />

      {/* Staff Pause/Resume Alert */}
      <AnimatePresence>
        {pauseAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'relative',
              zIndex: 20,
              background: pauseAlert.alertType === 'resumed' ? '#d1fae5' : '#fef3c7',
              border: `2px solid ${pauseAlert.alertType === 'resumed' ? '#10b981' : '#f59e0b'}`,
              borderRadius: 16,
              padding: '16px 20px',
              margin: '16px 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: pauseAlert.alertType === 'resumed' ? '#10b981' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {pauseAlert.alertType === 'resumed' ? <CheckCircle size={20} color="white" /> : <AlertTriangle size={20} color="white" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: pauseAlert.alertType === 'resumed' ? '#065f46' : '#92400e', marginBottom: 2 }}>
                {pauseAlert.alertType === 'resumed' ? 'Staff Available Again!' : 'Staff Temporarily Paused'}
              </div>
              <div style={{ fontSize: 13, color: pauseAlert.alertType === 'resumed' ? '#047857' : '#a16207' }}>
                {pauseAlert.alertType === 'resumed'
                  ? 'Good news! The staff member is now available again. Service will resume shortly. Thank you for your patience.'
                  : 'The staff member is temporarily unavailable. Your wait time has been extended. Please be patient.'}
              </div>
            </div>
            <button
              onClick={() => setPauseAlert(null)}
              style={{
                background: 'none',
                border: 'none',
                color: pauseAlert.alertType === 'resumed' ? '#047857' : '#a16207',
                cursor: 'pointer',
                fontSize: 18,
                padding: 4
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 12,
            border: isServing || isResolvedRemote ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #e2e8f0',
            background: isServing || isResolvedRemote ? 'rgba(255,255,255,0.1)' : 'white',
            color: isServing || isResolvedRemote ? 'white' : '#64748b',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            backdropFilter: 'blur(10px)'
          }}
        >
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {t('back')}
        </motion.button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshQueue}
            disabled={queueLoading}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: isServing || isResolvedRemote ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #e2e8f0',
              background: isServing || isResolvedRemote ? 'rgba(255,255,255,0.1)' : 'white',
              color: isServing || isResolvedRemote ? 'white' : '#64748b',
              fontSize: 14,
              fontWeight: 600,
              cursor: queueLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: queueLoading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} style={{ animation: queueLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </motion.button>

          {!isServing && !isResolvedRemote && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCancelConfirm(true)}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: isServing || isResolvedRemote ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #fee2e2',
                background: isServing || isResolvedRemote ? 'rgba(255,255,255,0.1)' : '#fef2f2',
                color: isServing || isResolvedRemote ? 'white' : '#dc2626',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <XCircle size={16} />
              {t('cancelQueue')}
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        maxWidth: 600,
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          {isResolvedRemote ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                padding: '10px 24px',
                borderRadius: 30,
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                fontSize: 16,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
              }}
            >
              <Home size={20} />
              Resolved Remotely
            </motion.div>
          ) : isServing ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                padding: '10px 24px',
                borderRadius: 30,
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: 16,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <Zap size={20} />
              {t('turnNow')}
            </motion.div>
          ) : (
            <div style={{
              padding: '10px 24px',
              borderRadius: 30,
              background: isWarning ? '#fef3c7' : '#eff6ff',
              color: isWarning ? '#92400e' : '#1e40af',
              fontSize: 15,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: `1.5px solid ${isWarning ? '#f59e0b' : '#bfdbfe'}`
            }}>
              <Clock size={18} />
              {isWarning ? t('minWarning') : t('waitingForTurn')}
            </div>
          )}
        </motion.div>

        {/* Ticket Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: isServing || isResolvedRemote ? 'rgba(255,255,255,0.7)' : '#64748b',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            {t('yourNumber')}
          </div>
          <motion.div
            animate={isServing || isResolvedRemote ? { 
              scale: [1, 1.1, 1],
              textShadow: ['0 0 20px rgba(255,255,255,0.3)', '0 0 40px rgba(255,255,255,0.6)', '0 0 20px rgba(255,255,255,0.3)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: 'clamp(72px, 15vw, 120px)',
              fontWeight: 900,
              color: isServing || isResolvedRemote ? 'white' : '#0f172a',
              lineHeight: 1,
              letterSpacing: '-4px',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            #{activeAppointment.ticket_number}
          </motion.div>
        </motion.div>

        {/* Timer Circle */}
        {!isServing && !isResolvedRemote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              position: 'relative',
              width: 220,
              height: 220,
              marginBottom: 32
            }}
          >
            {isWarning && (
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0 0px rgba(239,68,68,0.4)', '0 0 0 20px rgba(239,68,68,0)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '50%',
                }}
              />
            )}

            <svg style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotate(-90deg)'
            }} width="220" height="220" viewBox="0 0 220 220">
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke={getProgressColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 100}`}
                strokeDashoffset={`${2 * Math.PI * 100 * (1 - getProgress() / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>

            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#64748b',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {t('estimatedWait')}
              </div>
              <div style={{
                fontSize: 36,
                fontWeight: 900,
                color: getProgressColor(),
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1
              }}>
                {formatTime(displayTime)}
              </div>
              <div style={{
                fontSize: 12,
                color: '#94a3b8',
                marginTop: 4,
                fontWeight: 500
              }}>
                {t('minutes')}
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            width: '100%',
            maxWidth: 400,
            marginBottom: 32
          }}
        >
          <div style={{
            background: isServing || isResolvedRemote ? 'rgba(255,255,255,0.15)' : 'white',
            borderRadius: 16,
            padding: '18px',
            textAlign: 'center',
            border: isServing || isResolvedRemote ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0',
            backdropFilter: isServing || isResolvedRemote ? 'blur(10px)' : 'none'
          }}>
            <Users size={20} color={isServing || isResolvedRemote ? 'white' : '#64748b'} style={{ margin: '0 auto 8px' }} />
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: isServing || isResolvedRemote ? 'white' : '#0f172a',
              lineHeight: 1
            }}>
              {isResolvedRemote ? '—' : localPeopleBefore}
            </div>
            <div style={{
              fontSize: 12,
              color: isServing || isResolvedRemote ? 'rgba(255,255,255,0.7)' : '#64748b',
              fontWeight: 500,
              marginTop: 4
            }}>
              {isResolvedRemote ? 'Completed' : t('peopleBefore')}
            </div>
          </div>

          <div style={{
            background: isServing || isResolvedRemote ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #fef3c7, #fef9c3)',
            borderRadius: 16,
            padding: '18px',
            textAlign: 'center',
            border: isServing || isResolvedRemote ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f59e0b',
            backdropFilter: isServing || isResolvedRemote ? 'blur(10px)' : 'none'
          }}>
            <Zap size={20} color={isServing || isResolvedRemote ? '#fbbf24' : '#d97706'} style={{ margin: '0 auto 8px' }} />
            <div style={{
              fontSize: 16,
              fontWeight: 800,
              color: isServing || isResolvedRemote ? '#fbbf24' : '#92400e',
              lineHeight: 1
            }}>
              {isResolvedRemote ? 'Done' : t('parentPriority')}
            </div>
            <div style={{
              fontSize: 12,
              color: isServing || isResolvedRemote ? 'rgba(255,255,255,0.7)' : '#a16207',
              fontWeight: 500,
              marginTop: 4
            }}>
              {isResolvedRemote ? 'No visit needed' : 'Priority Queue'}
            </div>
          </div>
        </motion.div>

        {/* Staff Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: isServing || isResolvedRemote ? 'rgba(255,255,255,0.15)' : 'white',
            borderRadius: 16,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: '100%',
            maxWidth: 400,
            border: isServing || isResolvedRemote ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0',
            backdropFilter: isServing || isResolvedRemote ? 'blur(10px)' : 'none'
          }}
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: isServing || isResolvedRemote ? 'rgba(255,255,255,0.2)' : '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MapPin size={20} color={isServing || isResolvedRemote ? 'white' : '#1e40af'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: isServing || isResolvedRemote ? 'white' : '#0f172a',
              marginBottom: 2
            }}>
              {queueStatus?.staff_name || activeAppointment?.staff_name || 'Staff'}
            </div>
            <div style={{
              fontSize: 12,
              color: isServing || isResolvedRemote ? 'rgba(255,255,255,0.7)' : '#64748b',
              fontWeight: 500
            }}>
              {queueStatus?.room || activeAppointment?.room || 'Room A-101'}, {queueStatus?.block || activeAppointment?.block || 'Block A'}
            </div>
          </div>
          {isServing && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 12px #22c55e'
              }}
            />
          )}
        </motion.div>

        {/* Your Turn Action */}
        <AnimatePresence>
          {isServing && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              style={{
                marginTop: 32,
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0 0px rgba(34,197,94,0.4)', '0 0 0 20px rgba(34,197,94,0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  padding: '20px 40px',
                  borderRadius: 20,
                  background: 'white',
                  color: '#16a34a',
                  fontSize: 20,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: 'none'
                }}
              >
                <CheckCircle size={28} />
                {t('enterOffice')}
              </motion.div>
              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 16,
                fontWeight: 500
              }}>
                Please proceed to the office immediately
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADDED: Resolved Remotely Message */}
        <AnimatePresence>
          {isResolvedRemote && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              style={{
                marginTop: 32,
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0 0px rgba(139,92,246,0.4)', '0 0 0 20px rgba(139,92,246,0)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  padding: '20px 40px',
                  borderRadius: 20,
                  background: 'white',
                  color: '#7c3aed',
                  fontSize: 18,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  fontFamily: 'inherit',
                  border: 'none'
                }}
              >
                <Home size={28} />
                Issue Resolved!
              </motion.div>
              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 16,
                fontWeight: 500
              }}>
                Your issue has been resolved remotely. No need to visit the office. Redirecting...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: 24,
                padding: '32px',
                maxWidth: 400,
                width: '100%',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <AlertTriangle size={32} color="#dc2626" />
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: 8
              }}>
                {t('cancelQueue')}
              </h3>
              <p style={{
                fontSize: 15,
                color: '#64748b',
                marginBottom: 24,
                lineHeight: 1.5
              }}>
                {t('cancelConfirm')}
              </p>
              <div style={{
                display: 'flex',
                gap: 12
              }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCancelConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: 12,
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    color: '#475569',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {t('no')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  disabled={queueLoading}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: queueLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: queueLoading ? 0.7 : 1
                  }}
                >
                  {queueLoading ? '...' : t('yes')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default WaitingScreen;