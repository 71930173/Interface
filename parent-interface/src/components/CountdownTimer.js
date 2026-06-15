import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CountdownTimer = ({ 
  initialSeconds, 
  peopleBefore, 
  onComplete, 
  onWarning,
  warningThreshold = 180 // 3 minutes in seconds
}) => {
  const { t } = useLanguage();
  const [seconds, setSeconds] = useState(() => {
    // Try to get saved time from localStorage
    const saved = localStorage.getItem('queueTimerSeconds');
    const savedTimestamp = localStorage.getItem('queueTimerTimestamp');
    if (saved && savedTimestamp) {
      const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remaining = parseInt(saved) - elapsed;
      return remaining > 0 ? remaining : 0;
    }
    return initialSeconds || 0;
  });
  const [warningShown, setWarningShown] = useState(false);
  const intervalRef = useRef(null);

  // Save timer state
  useEffect(() => {
    if (seconds > 0) {
      localStorage.setItem('queueTimerSeconds', seconds);
      localStorage.setItem('queueTimerTimestamp', Date.now().toString());
    }
  }, [seconds]);

  // Countdown logic
  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        const newValue = prev - 1;

        // Warning at 3 minutes
        if (newValue <= warningThreshold && newValue > warningThreshold - 5 && !warningShown) {
          setWarningShown(true);
          onWarning?.();
        }

        if (newValue <= 0) {
          clearInterval(intervalRef.current);
          onComplete?.();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds, warningShown, onComplete, onWarning, warningThreshold]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const percentage = seconds / (initialSeconds || 1);
    if (percentage > 0.6) return '#22c55e';
    if (percentage > 0.3) return '#f59e0b';
    return '#ef4444';
  };

  const progress = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} color="white" />
          </div>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#1e293b'
            }}>
              {t('estimatedWait')}
            </div>
            <div style={{
              fontSize: 12,
              color: '#64748b'
            }}>
              {peopleBefore} {peopleBefore === 1 ? t('personBefore') || 'person before you' : t('peopleBefore')}
            </div>
          </div>
        </div>

        {/* Warning badge */}
        {seconds <= warningThreshold && seconds > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background: '#fef3c7',
              color: '#d97706',
              fontSize: 12,
              fontWeight: 700
            }}
          >
            <AlertTriangle size={14} />
            {t('minWarning')}
          </motion.div>
        )}
      </div>

      {/* Timer Display */}
      <div style={{
        textAlign: 'center',
        padding: '20px 0'
      }}>
        <motion.div
          key={seconds}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 56,
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums',
            color: getProgressColor(),
            letterSpacing: '-2px',
            lineHeight: 1
          }}
        >
          {formatTime(seconds)}
        </motion.div>
        <div style={{
          fontSize: 14,
          color: '#64748b',
          marginTop: 8,
          fontWeight: 500
        }}>
          {seconds <= warningThreshold ? t('yourTurnSoon') : t('pleaseWait')}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: 8,
        borderRadius: 4,
        background: '#f1f5f9',
        overflow: 'hidden',
        marginTop: 16
      }}>
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: `linear-gradient(90deg, ${getProgressColor()}, ${getProgressColor()}dd)`,
            boxShadow: `0 0 10px ${getProgressColor()}40`
          }}
        />
      </div>

      {/* Time breakdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 12,
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: 500
      }}>
        <span>{t('started') || 'Started'}</span>
        <span>{t('now') || 'Now'}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;