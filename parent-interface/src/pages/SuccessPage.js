import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, Home, Star, Clock } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../context/AuthContext';

const SuccessPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Auth check: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <AnimatedBackground variant="hero" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: 440,
          width: '100%'
        }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 16px 48px rgba(30,64,175,0.4)'
          }}
        >
          <CheckCircle size={48} color="white" strokeWidth={2.5} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            marginBottom: 12,
            letterSpacing: '-0.5px',
            textShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          {t('queueConfirmed')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 32,
            lineHeight: 1.6,
            fontWeight: 500
          }}
        >
          Your appointment has been successfully created. You will receive notifications when your turn is approaching.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginBottom: 40
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: '18px 24px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Star size={20} color="#fbbf24" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
              {t('parentPriority')}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            padding: '18px 24px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Clock size={20} color="white" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
              Real-time Updates
            </div>
          </div>
        </motion.div>

        {/* Auto redirect notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 24,
            fontWeight: 500
          }}
        >
          Redirecting to dashboard in 5 seconds...
        </motion.p>

        {/* Manual redirect */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05, boxShadow: '0 12px 32px rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '14px 32px',
            borderRadius: 14,
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'inherit'
          }}
        >
          <Home size={20} />
          {t('back')} to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SuccessPage;