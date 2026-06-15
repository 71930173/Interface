import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { parentAPI } from '../utils/api';
import { 
  Plus, 
  Clock, 
  Calendar, 
  Ticket,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Trash2,
  Zap,
  Timer,
  LogOut,
  Monitor,
  Home,
  MessageSquare
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { activeAppointment, hasActiveQueue, cancelQueue, isLoading: queueLoading, remainingTime, peopleBefore } = useQueue();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pauseAlert, setPauseAlert] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [apptsRes, statsRes] = await Promise.all([
        parentAPI.getMyAppointments().catch(() => ({ data: [] })),
        parentAPI.getStats().catch(() => ({ data: null }))
      ]);
      setAppointments(apptsRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for staff pause notifications
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
      fetchData();
    }
  }, [cancelQueue, fetchData]);

  const isRTL = dir === 'rtl';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return <Clock size={16} color="#d97706" />;
      case 'serving': return <RefreshCw size={16} color="#1e40af" />;
      case 'served': return <CheckCircle size={16} color="#16a34a" />;
      case 'cancelled': return <XCircle size={16} color="#dc2626" />;
      case 'resolved_remotely': return <Home size={16} color="#8b5cf6" />;
      default: return <AlertCircle size={16} color="#64748b" />;
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      waiting: { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
      serving: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      served: { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' },
      cancelled: { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
      resolved_remotely: { bg: '#ede9fe', text: '#7c3aed', border: '#8b5cf6' },
    };
    return styles[status] || styles.waiting;
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (remainingTime === null) return '#94a3b8';
    if (remainingTime <= 180) return '#ef4444';
    if (remainingTime <= 600) return '#f59e0b';
    return '#22c55e';
  };

  const hasActiveAppointment = hasActiveQueue() || (activeAppointment && ['waiting', 'serving'].includes(activeAppointment.status));
  const canViewWaiting = activeAppointment && ['waiting', 'serving'].includes(activeAppointment.status);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '24px 20px 120px',
      maxWidth: 900,
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 4,
              letterSpacing: '-0.5px'
            }}>
              {t('hello')}, {user?.first_name}!
            </h1>
            <p style={{
  fontSize: 15,
  color: '#475569',
  fontWeight: 500
}}>
  {t('welcome')}, {t('guest')}
</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 12,
              border: '1.5px solid #fee2e2',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <LogOut size={16} />
            {t('logout')}
          </motion.button>
        </div>
      </motion.div>

      {/* Staff Pause/Resume Alert */}
      <AnimatePresence>
        {pauseAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: pauseAlert.alertType === 'resumed' ? '#d1fae5' : '#fef3c7',
              border: `2px solid ${pauseAlert.alertType === 'resumed' ? '#10b981' : '#f59e0b'}`,
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 20,
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

      {/* VIEW WAITING SCREEN BANNER */}
      {canViewWaiting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          style={{ marginBottom: 24 }}
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(30,64,175,0.25)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/waiting')}
            style={{
              width: '100%',
              padding: '20px 28px',
              borderRadius: 20,
              border: 'none',
              background: activeAppointment.status === 'serving'
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
              color: 'white',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontFamily: 'inherit',
              boxShadow: activeAppointment.status === 'serving'
                ? '0 8px 24px rgba(34,197,94,0.2)'
                : '0 8px 24px rgba(30,64,175,0.2)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Monitor size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {activeAppointment.status === 'serving' ? t('turnNow') : 'View Waiting Screen'}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500, marginTop: 2 }}>
                {activeAppointment.status === 'serving' 
                  ? 'Please proceed to the office immediately' 
                  : `Ticket #${activeAppointment.ticket_number} • ${peopleBefore} people before you • ${formatTime(remainingTime)} remaining`}
              </div>
            </div>
            {isRTL ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
          </motion.button>
        </motion.div>
      )}

      {/* Active Queue Summary Card */}
      {hasActiveAppointment && activeAppointment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          style={{ marginBottom: 28 }}
        >
          <div style={{
            background: 'white',
            borderRadius: 20,
            border: '2px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
          }}>
            {/* Top Bar - Status & Ticket */}
            <div style={{
              background: activeAppointment.status === 'serving' 
                ? 'linear-gradient(135deg, #16a34a, #22c55e)' 
                : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ticket size={18} color="white" />
                </div>
                <div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {t('yourNumber')}
                  </div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: 'white',
                    lineHeight: 1
                  }}>
                    #{activeAppointment.ticket_number}
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: 13,
                fontWeight: 700
              }}>
                {activeAppointment.status === 'serving' ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#fff'
                      }}
                    />
                    {t('turnNow')}
                  </>
                ) : (
                  <>
                    <Clock size={14} />
                    {t('waiting')}
                  </>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div style={{
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              borderBottom: '1px solid #f1f5f9'
            }} className="info-grid">
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 4
                }}>
                  {t('queuePosition')}
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  {activeAppointment.queue_position}
                </div>
              </div>

              <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                <div style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 4
                }}>
                  {t('peopleBefore')}
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  {peopleBefore}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 4
                }}>
                  {t('priority')}
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}>
                  <Zap size={14} />
                  {t('parentPriority')}
                </div>
              </div>
            </div>

            {/* Live Timer Bar */}
            {activeAppointment.status === 'waiting' && remainingTime !== null && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Timer size={16} color={getProgressColor()} />
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#334155'
                    }}>
                      {t('estimatedWait')}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: getProgressColor(),
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {formatTime(remainingTime)}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  background: '#f1f5f9',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ 
                      width: `${Math.max(0, Math.min(100, (remainingTime / ((peopleBefore + 1) * 300)) * 100))}%` 
                    }}
                    transition={{ duration: 1 }}
                    style={{
                      height: '100%',
                      borderRadius: 3,
                      background: getProgressColor()
                    }}
                  />
                </div>
              </div>
            )}

            {/* VIEW WAITING SCREEN BUTTON INSIDE CARD */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/waiting')}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  border: 'none',
                  background: activeAppointment.status === 'serving'
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontFamily: 'inherit',
                  boxShadow: activeAppointment.status === 'serving'
                    ? '0 4px 16px rgba(34,197,94,0.3)'
                    : '0 4px 16px rgba(30,64,175,0.3)'
                }}
              >
                <Monitor size={20} />
                {activeAppointment.status === 'serving' ? t('turnNow') : 'View Waiting Screen'}
                {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Active Queue - Start New */}
      {!hasActiveAppointment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28 }}
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(30,64,175,0.25)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/issue-select')}
            style={{
              width: '100%',
              padding: '24px 28px',
              borderRadius: 20,
              border: 'none',
              background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
              color: 'white',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(30,64,175,0.2)'
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={24} />
            </div>
            <span>{t('selectIssue')}</span>
            {isRTL ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
          </motion.button>
        </motion.div>
      )}

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 28 }}
        >
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 16
          }}>
            Quick Stats
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 14
          }} className="stats-grid">
            {[
              { label: 'Total Visits', value: stats.total_visits || 0, icon: Calendar, color: '#1e40af' },
              { label: 'Completed', value: stats.completed || 0, icon: CheckCircle, color: '#22c55e' },
              { label: 'Avg Wait', value: `${stats.avg_wait || 0}m`, icon: Clock, color: '#f59e0b' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12
                  }}>
                    <Icon size={20} color={stat.color} />
                  </div>
                  <div style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: 4
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 16
        }}>
          Recent Appointments
        </h2>

        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer" style={{
                height: 80,
                borderRadius: 16,
                background: '#f1f5f9'
              }} />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <Calendar size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <p style={{
              fontSize: 15,
              color: '#64748b',
              fontWeight: 500
            }}>
              No appointments yet
            </p>
            <p style={{
              fontSize: 13,
              color: '#94a3b8',
              marginTop: 4
            }}>
              Start by selecting an issue type
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {appointments.slice(0, 5).map((appt, index) => {
              const statusStyle = getStatusStyle(appt.status);
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: '18px 20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: statusStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getStatusIcon(appt.status)}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: 4
                      }}>
                        Ticket #{appt.ticket_number}
                      </div>
                      <div style={{
                        fontSize: 13,
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        {appt.issue_type_name} • {new Date(appt.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {appt.status === 'resolved_remotely' && appt.resolution_note && (
                      <div style={{
                        marginTop: 8,
                        padding: '8px 12px',
                        background: '#ede9fe',
                        borderRadius: 8,
                        borderLeft: '3px solid #8b5cf6',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8
                      }}>
                        <MessageSquare size={14} color="#8b5cf6" style={{marginTop: 2, flexShrink: 0}} />
                        <div>
                          <div style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#7c3aed',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: 2
                          }}>
                            {t('resolutionNote')}
                          </div>
                          <div style={{
                            fontSize: 13,
                            color: '#5b21b6',
                            fontWeight: 500,
                            lineHeight: 1.4
                          }}>
                            {appt.resolution_note}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    flexShrink: 0
                  }}>
                    {appt.status === 'resolved_remotely' ? t('resolvedRemotely') : appt.status}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* FIXED BOTTOM ACTION BAR */}
      <AnimatePresence>
        {hasActiveAppointment && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(226,232,240,0.8)',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
              padding: '12px 20px 24px',
              maxWidth: 900,
              margin: '0 auto'
            }}
          >
            {/* Mini info row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              padding: '0 4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: activeAppointment?.status === 'serving' ? '#22c55e' : '#1e40af',
                  animation: activeAppointment?.status === 'serving' ? 'pulse 1.5s infinite' : 'none'
                }} />
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  #{activeAppointment?.ticket_number}
                </span>
                <span style={{
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 500
                }}>
                  • {peopleBefore} {t('peopleBefore')}
                </span>
              </div>
              {remainingTime !== null && (
                <span style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: getProgressColor(),
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {formatTime(remainingTime)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 10
            }}>
              {/* View Waiting Screen */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/waiting')}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 14,
                  border: 'none',
                  background: activeAppointment?.status === 'serving'
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'inherit',
                  boxShadow: activeAppointment?.status === 'serving'
                    ? '0 4px 16px rgba(34,197,94,0.3)'
                    : '0 4px 16px rgba(30,64,175,0.3)'
                }}
              >
                <Monitor size={20} />
                {activeAppointment?.status === 'serving' ? t('turnNow') : 'View Waiting Screen'}
                {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </motion.button>

              {/* Cancel Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCancelConfirm(true)}
                disabled={queueLoading}
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: '2px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: queueLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
              >
                <Trash2 size={18} />
                <span className="cancel-text">{t('cancelQueue')}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
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
                <AlertCircle size={32} color="#dc2626" />
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

      {/* CSS for responsive design */}
      <style>{`
        @media (max-width: 480px) {
          .cancel-text {
            display: none;
          }
        }
        @media (max-width: 400px) {
          .info-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;