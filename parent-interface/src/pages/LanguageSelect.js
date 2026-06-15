import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const LanguageSelect = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const navigate = useNavigate();

  const languages = [
    {
      code: 'en',
      name: 'English',
      native: 'English',
      flag: '🇬🇧',
      desc: 'Continue in English'
    },
    {
      code: 'ar',
      name: 'العربية',
      native: 'العربية',
      flag: '🇸🇦',
      desc: 'الاستمرار بالعربية'
    }
  ];

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <AnimatedBackground />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 500,
        width: '100%'
      }}>
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
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
          {dir === 'rtl' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {t('back')}
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 12px 32px rgba(30,64,175,0.3)'
          }}>
            <Globe size={36} color="white" />
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: 8,
            letterSpacing: '-0.5px'
          }}>
            {t('selectLanguage')}
          </h1>
          <p style={{
            fontSize: 15,
            color: '#64748b',
            fontWeight: 500
          }}>
            Choose your preferred language
          </p>
        </motion.div>

        {/* Language Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 32
        }}>
          {languages.map((lang, index) => {
            const isSelected = language === lang.code;
            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLanguage(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '20px 24px',
                  borderRadius: 16,
                  border: isSelected ? '2px solid #1e40af' : '2px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                  boxShadow: isSelected ? '0 4px 16px rgba(30,64,175,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: 36 }}>{lang.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: 4
                  }}>
                    {lang.native}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    {lang.desc}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={16} color="white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(30,64,175,0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
            color: 'white',
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(30,64,175,0.25)'
          }}
        >
          {t('next')}
          {dir === 'rtl' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
        </motion.button>
      </div>
    </div>
  );
};

export default LanguageSelect;