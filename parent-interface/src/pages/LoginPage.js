import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate} from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LogIn, 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    contact_value: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [listeningField, setListeningField] = useState(null);
  const [interimText, setInterimText] = useState({ contact: '', password: '' });
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  
  // ===== FIX: Guard to prevent infinite redirect loop =====
   const hasRedirected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/dashboard', { replace: true });
    }
    if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, navigate]);
  // =========================================================

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = dir === 'rtl' ? 'ar-SA' : 'en-US';
    rec.maxAlternatives = 1;

    const fieldRef = { current: null };

    rec.onstart = () => {
      isListeningRef.current = true;
    };

    rec.onresult = (event) => {
      let interimTranscript = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const field = fieldRef.current;
      if (field) {
        setInterimText(prev => ({ ...prev, [field]: interimTranscript }));
      }

      if (newFinal && field) {
        setFormData(prev => {
          const currentValue = prev[field === 'contact' ? 'contact_value' : 'password'];
          const separator = currentValue && !currentValue.endsWith(' ') ? ' ' : '';
          const updatedValue = currentValue + separator + newFinal;
          return {
            ...prev,
            [field === 'contact' ? 'contact_value' : 'password']: updatedValue
          };
        });
        setInterimText(prev => ({ ...prev, [field]: '' }));
      }
    };

    rec.onerror = (event) => {
      if (event.error !== 'aborted') {
        console.error('Speech error:', event.error);
      }
      setListeningField(null);
      fieldRef.current = null;
      isListeningRef.current = false;
    };

    rec.onend = () => {
      isListeningRef.current = false;
      if (fieldRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {}
        }, 200);
      }
    };

    recognitionRef.current = rec;
    recognitionRef.current._fieldRef = fieldRef;

    return () => {
      try {
        rec.stop();
      } catch (e) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const startVoiceInput = useCallback((field) => {
    if (!recognitionRef.current) {
      alert(t('speechNotSupported') || 'Speech recognition not supported. Please use Chrome or Safari.');
      return;
    }

    if (listeningField === field) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setListeningField(null);
      if (recognitionRef.current._fieldRef) {
        recognitionRef.current._fieldRef.current = null;
      }
      setInterimText(prev => ({ ...prev, [field]: '' }));
    } else {
      if (listeningField) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      setListeningField(field);
      if (recognitionRef.current._fieldRef) {
        recognitionRef.current._fieldRef.current = field;
      }
      setInterimText(prev => ({ ...prev, [field]: '' }));

      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (e) {
          console.error('Start error:', e);
        }
      }, 300);
    }
  }, [listeningField, t]);

  const validate = () => {
    const newErrors = {};
    const contactValue = formData.contact_value.trim();
    const password = formData.password;

    if (!contactValue) {
      newErrors.contact_value = t('fillAllFields');
    }
    if (!password) {
      newErrors.password = t('fillAllFields');
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const isValid = validate();
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      await login(formData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = dir === 'rtl';

  const getDisplayValue = (field) => {
    const actualValue = formData[field === 'contact' ? 'contact_value' : 'password'];
    const interim = interimText[field];
    if (interim) {
      return actualValue ? actualValue + ' ' + interim : interim;
    }
    return actualValue;
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px'
    }}>
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 440,
          width: '100%'
        }}
      >
        <motion.button
          whileHover={{ x: isRTL ? 5 : -5 }}
          onClick={() => navigate('/language')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 10,
            border: '1.5px solid #e2e8f0',
            background: 'white',
            color: '#64748b',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 32,
            fontFamily: 'inherit'
          }}
        >
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {t('back')}
        </motion.button>

        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: '28px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(37,99,235,0.3)'
            }}>
              <LogIn size={28} color="white" />
            </div>
            <h1 style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#1e293b',
              marginBottom: 8,
              letterSpacing: '-0.5px'
            }}>
              {t('login')}
            </h1>
            {/* ===== FIX: Removed nested <p> ===== */}
            <p style={{
              fontSize: 14,
              color: '#64748b',
              fontWeight: 500
            }}>
              {t('welcome')}, {t('guest')}
            </p>
            {/* ================================== */}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#475569',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('contactValue')}
              </label>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: 10,
                alignItems: 'flex-start',
                width: '100%'
              }}>
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: isRTL ? 'auto' : 14,
                    right: isRTL ? 14 : 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none'
                  }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    name="contact_value"
                    value={getDisplayValue('contact')}
                    onChange={handleChange}
                    placeholder={t('email') + ' / ' + t('phone')}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: 12,
                      border: errors.contact_value ? '2px solid #ef4444' : '2px solid #e2e8f0',
                      background: 'white',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s',
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = errors.contact_value ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => startVoiceInput('contact')}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: 'none',
                    background: listeningField === 'contact' 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: listeningField === 'contact' 
                      ? '0 0 12px rgba(239,68,68,0.5)' 
                      : '0 2px 8px rgba(37,99,235,0.3)',
                    flexShrink: 0,
                    flexGrow: 0,
                    marginTop: 0
                  }}
                  title={t('useMicrophone') || 'Use microphone'}
                >
                  {listeningField === 'contact' ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>
              </div>

              {listeningField === 'contact' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#dc2626',
                    animation: 'pulse 1s infinite'
                  }} />
                  {t('listening') || 'Listening... Speak now'}
                </motion.div>
              )}
              {errors.contact_value && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: 12,
                    color: '#ef4444',
                    marginTop: 6,
                    fontWeight: 500
                  }}
                >
                  {errors.contact_value}
                </motion.p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#475569',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('password')}
              </label>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: 10,
                alignItems: 'flex-start',
                width: '100%'
              }}>
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: isRTL ? 'auto' : 14,
                    right: isRTL ? 14 : 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none'
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={getDisplayValue('password')}
                    onChange={handleChange}
                    placeholder={t('password')}
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      borderRadius: 12,
                      border: errors.password ? '2px solid #ef4444' : '2px solid #e2e8f0',
                      background: 'white',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s',
                      color: '#1e293b',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: isRTL ? 'auto' : 14,
                      left: isRTL ? 14 : 'auto',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => startVoiceInput('password')}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: 'none',
                    background: listeningField === 'password' 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: listeningField === 'password' 
                      ? '0 0 12px rgba(239,68,68,0.5)' 
                      : '0 2px 8px rgba(37,99,235,0.3)',
                    flexShrink: 0,
                    flexGrow: 0,
                    marginTop: 0
                  }}
                  title={t('useMicrophone') || 'Use microphone'}
                >
                  {listeningField === 'password' ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>
              </div>

              {listeningField === 'password' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#dc2626',
                    animation: 'pulse 1s infinite'
                  }} />
                  {t('listening') || 'Listening... Speak your password'}
                </motion.div>
              )}
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: 12,
                    color: '#ef4444',
                    marginTop: 6,
                    fontWeight: 500
                  }}
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: 14,
                border: 'none',
                background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                fontSize: 17,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontFamily: 'inherit',
                marginTop: 8,
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(37,99,235,0.25)'
              }}
            >
              {isLoading ? (
                <div style={{
                  width: 20, height: 20,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <>
                  <LogIn size={20} />
                  {t('login')}
                </>
              )}
            </motion.button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            margin: '28px 0'
          }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{t('or')}</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 14,
              border: '2px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit'
            }}
          >
            <Sparkles size={18} />
            {t('noAccount')} {t('signupHere')}
          </motion.button>
        </div>
      </motion.div>

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

export default LoginPage;