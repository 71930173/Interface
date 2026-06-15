import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ArrowRight, Globe, Clock, Shield, Sparkles, X } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const LandingPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);

  const features = [
    { icon: QrCode, title: language === 'en' ? 'Scan & Go' : 'امسح وانطلق', desc: language === 'en' ? 'Simply scan the QR code to start your queue journey' : 'امسح رمز QR ببساطة لبدء رحلتك في الطابور' },
    { icon: Clock, title: language === 'en' ? 'Real-time Updates' : 'تحديثات فورية', desc: language === 'en' ? 'Track your position and estimated wait time live' : 'تتبع موقعك ووقت الانتظار المقدر مباشرة' },
    { icon: Shield, title: language === 'en' ? 'Parent Priority' : 'أولوية ولي الأمر', desc: language === 'en' ? 'Special priority queue for parents with faster service' : 'طابور أولوية خاص لأولياء الأمور مع خدمة أسرع' },
    { icon: Sparkles, title: language === 'en' ? 'Smart Notifications' : 'إشعارات ذكية', desc: language === 'en' ? 'Get notified when your turn is approaching' : 'احصل على إشعار عند اقتراب دورك' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)'
    }}>
      <AnimatedBackground variant="hero" />

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '0 20px 60px rgba(30,64,175,0.4)',
            position: 'relative'
          }}
        >
          <QrCode size={48} color="white" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: 32,
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 900,
            color: 'white',
            marginBottom: 12,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          {t('appName')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 40,
            maxWidth: 500,
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          {t('tagline')}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(30,64,175,0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/language')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 40px',
            borderRadius: 16,
            border: 'none',
            background: 'white',
            color: '#1e40af',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            fontFamily: 'inherit',
            marginBottom: 16
          }}
        >
          {t('startQueue')}
          <ArrowRight size={22} />
        </motion.button>

        {/* QR Code Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQR(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 28px',
            borderRadius: 14,
            border: '2px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginBottom: 48,
            backdropFilter: 'blur(10px)'
          }}
        >
          <QrCode size={20} />
          {language === 'en' ? 'Scan QR to Login' : 'امسح QR للدخول'}
        </motion.button>

        {/* Language Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 48
          }}
        >
          {['en', 'ar'].map((lang) => (
            <motion.button
              key={lang}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                border: language === lang ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                background: language === lang ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Globe size={16} />
              {lang === 'en' ? 'English' : 'العربية'}
            </motion.button>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            maxWidth: 900,
            width: '100%',
            padding: '0 20px'
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid rgba(255,255,255,0.25)',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Icon size={24} color="white" />
                </div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 8
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.5
                }}>
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '20px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 12,
          fontWeight: 500
        }}
      >
        {t('poweredBy')} &copy; {new Date().getFullYear()}
      </motion.footer>

      {/* QR Code Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowQR(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 24,
              padding: '32px 24px',
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowQR(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 8,
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 8
            }}>
              {language === 'en' ? 'Scan to Login' : 'امسح للدخول'}
            </h3>
            <p style={{
              fontSize: 14,
              color: '#64748b',
              marginBottom: 24
            }}>
              {language === 'en' 
                ? 'Scan this QR code with your phone camera to open the login page' 
                : 'امسح رمز QR بكاميرا هاتفك لفتح صفحة تسجيل الدخول'}
            </p>

            <div style={{
              background: 'white',
              padding: 16,
              borderRadius: 16,
              border: '2px solid #e2e8f0',
              display: 'inline-block'
            }}>
              <QRCodeSVG
    value={`http:/172.20.10.2:3000/login`}
    size={200}
    level="M"
    includeMargin={true}
    bgColor="#ffffff"
    fgColor="#1e293b"
/>
            </div>

            <p style={{
              fontSize: 12,
              color: '#94a3b8',
              marginTop: 16,
              fontWeight: 500
            }}>
              {window.location.origin}/login
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;