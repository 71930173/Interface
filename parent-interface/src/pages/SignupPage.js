import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  UserPlus, 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Mic,
  MicOff
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const SignupPage = () => {
  const { signup, isAuthenticated } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_method: 'phone',
    contact_value: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Voice input states
  const [listeningField, setListeningField] = useState(null);
  const [interimText, setInterimText] = useState({});
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = dir === 'rtl' ? 'ar-SA' : 'en-US';
    rec.maxAlternatives = 1;

    // FIX: Use ref instead of closure variable so onresult can read the current field
    const fieldRef = { current: null };

    rec.onstart = () => {};

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

      // FIX: Read field from ref instead of closure variable
      const field = fieldRef.current;
      if (field) {
        setInterimText(prev => ({ ...prev, [field]: interimTranscript }));
      }

      if (newFinal && field) {
        setFormData(prev => {
          const currentValue = prev[field] || '';
          const separator = currentValue && !currentValue.endsWith(' ') ? ' ' : '';
          return {
            ...prev,
            [field]: currentValue + separator + newFinal
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
    };

    rec.onend = () => {
      // FIX: Check fieldRef instead of listeningField state (stale closure)
      if (fieldRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {}
        }, 200);
      }
    };

    recognitionRef.current = rec;
    // Store ref on recognition instance so startVoiceInput can access it
    recognitionRef.current._fieldRef = fieldRef;

    return () => {
      try {
        rec.stop();
      } catch (e) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // FIX: startVoiceInput now sets fieldRef so onresult knows which field to update
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
      // FIX: Clear the field ref
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
      // FIX: Set the field ref so onresult knows which field to update
      if (recognitionRef.current._fieldRef) {
        recognitionRef.current._fieldRef.current = field;
      }
      setInterimText(prev => ({ ...prev, [field]: '' }));
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (e) {}
      }, 300);
    }
  }, [listeningField, t]);

  const getDisplayValue = (field) => {
    const actualValue = formData[field] || '';
    const interim = interimText[field] || '';
    if (interim) {
      return actualValue ? actualValue + ' ' + interim : interim;
    }
    return actualValue;
  };

  const validate = () => {
    const newErrors = {};
    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();
    const contactValue = formData.contact_value.trim();
    const password = formData.password;
    const confirmPassword = formData.confirm_password;

    if (!firstName) newErrors.first_name = t('fillAllFields');
    if (!lastName) newErrors.last_name = t('fillAllFields');
    if (!contactValue) newErrors.contact_value = t('fillAllFields');

    if (!password) {
      newErrors.password = t('fillAllFields');
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter (A-Z)';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter (a-z)';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number (0-9)';
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$...)';
    }

    if (!confirmPassword) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirm_password = 'Passwords do not match';
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
      const result = await signup({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        contact_method: formData.contact_method,
        contact_value: formData.contact_value.trim(),
        password: formData.password,
        language: dir === 'rtl' ? 'ar' : 'en'
      });
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = dir === 'rtl';

  // Helper to render input with mic button - FIXED LAYOUT
  const renderInputWithMic = (name, value, placeholder, type = 'text', icon, error) => {
    const isListening = listeningField === name;
    const isPassword = type === 'password';

    return (
      <div style={{ width: '100%' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
          alignItems: 'flex-start',
          width: '100%'
        }}>
          {/* Input wrapper */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: isRTL ? 'auto' : 14,
              right: isRTL ? 14 : 'auto',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              pointerEvents: 'none',
              zIndex: 2
            }}>
              {icon}
            </div>
            <input
              type={isPassword && !showPassword ? 'password' : 'text'}
              name={name}
              value={getDisplayValue(name)}
              onChange={handleChange}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: isPassword 
                  ? '14px 44px 14px 44px' 
                  : '14px 16px 14px 44px',
                borderRadius: 12,
                border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
                background: 'white',
                fontSize: 15,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'all 0.2s',
                color: '#0f172a',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#1e40af'; e.target.style.boxShadow = '0 0 0 4px rgba(30,64,175,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {/* Eye toggle for password */}
            {isPassword && (
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
                  padding: 4,
                  zIndex: 2
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          {/* Mic Button - Fixed size, never wraps */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => startVoiceInput(name)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: 'none',
              background: isListening 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isListening 
                ? '0 0 12px rgba(239,68,68,0.5)' 
                : '0 2px 8px rgba(30,64,175,0.3)',
              flexShrink: 0,
              flexGrow: 0,
              marginTop: 0
            }}
            title={t('useMicrophone') || 'Use microphone'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </motion.button>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 4,
              fontSize: 11,
              color: '#dc2626',
              fontWeight: 600
            }}
          >
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#dc2626',
              animation: 'pulse 1s infinite'
            }} />
            {t('listening') || 'Listening...'}
          </motion.div>
        )}
        {error && (
          <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</p>
        )}
      </div>
    );
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
          maxWidth: 480,
          width: '100%'
        }}
      >
        {/* Back button */}
        <motion.button
          whileHover={{ x: isRTL ? 5 : -5 }}
          onClick={() => navigate('/login')}
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

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: '28px 20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(30,64,175,0.3)'
            }}>
              <UserPlus size={28} color="white" />
            </div>
            <h1 style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 8,
              letterSpacing: '-0.5px'
            }}>
              {t('signup')}
            </h1>
            <p style={{
              fontSize: 14,
              color: '#475569',
              fontWeight: 500
            }}>
              {t('enterDetails')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Name Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12
            }}>
              {/* First Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('firstName')}
                </label>
                {renderInputWithMic('first_name', formData.first_name, t('firstName'), 'text', <User size={18} />, errors.first_name)}
              </div>

              {/* Last Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('lastName')}
                </label>
                {renderInputWithMic('last_name', formData.last_name, t('lastName'), 'text', <User size={18} />, errors.last_name)}
              </div>
            </div>

            {/* Contact Method */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('contactMethod')}
              </label>
              <div style={{
                display: 'flex',
                gap: 10,
                marginBottom: 10
              }}>
                {['phone', 'email'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, contact_method: method, contact_value: '' }))}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: formData.contact_method === method ? '2px solid #1e40af' : '2px solid #e2e8f0',
                      background: formData.contact_method === method ? '#eff6ff' : 'white',
                      color: formData.contact_method === method ? '#1e40af' : '#64748b',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontFamily: 'inherit'
                    }}
                  >
                    {method === 'phone' ? <Phone size={16} /> : <Mail size={16} />}
                    {method === 'phone' ? t('phone') : t('email')}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Value with Mic */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('contactValue')}
              </label>
              {renderInputWithMic('contact_value', formData.contact_value, 
                formData.contact_method === 'phone' ? '+961 12 345 678' : 'parent@email.com',
                'text',
                formData.contact_method === 'phone' ? <Phone size={18} /> : <Mail size={18} />,
                errors.contact_value
              )}
            </div>

            {/* Password with Mic */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {t('password')}
              </label>
              {renderInputWithMic('password', formData.password, 'Min 8 chars, A-Z, a-z, 0-9, @#$...', 'password', <Lock size={18} />, errors.password)}
            </div>

            {/* Confirm Password with Mic */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Confirm Password
              </label>
              {renderInputWithMic('confirm_password', formData.confirm_password, 'Confirm password', 'password', <Lock size={18} />, errors.confirm_password)}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(30,64,175,0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: 14,
                border: 'none',
                background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
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
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(30,64,175,0.25)'
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
                  <UserPlus size={20} />
                  {t('signup')}
                </>
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 14,
            color: '#64748b',
            fontWeight: 500
          }}>
            {t('haveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1e40af',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                textDecoration: 'underline'
              }}
            >
              {t('loginHere')}
            </button>
          </div>
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

export default SignupPage;