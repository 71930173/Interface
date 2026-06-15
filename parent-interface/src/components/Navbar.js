import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useQueue } from '../context/QueueContext';
import { 
  LogOut,
  Home, 
  Clock, 
  Menu, 
  X,
  Globe
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, dir, t, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isRTL = dir === 'rtl';
  const isWaitingPage = location.pathname === '/waiting';

  // Don't show navbar on waiting page (immersive experience)
  if (isWaitingPage) return null;

  const navItems = [
    { path: '/dashboard', label: t('welcome'), icon: Home },
    { path: '/issue-select', label: t('selectIssue'), icon: Clock },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226,232,240,0.6)',
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
          }}>
            <Clock size={20} color="white" />
          </div>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#1e293b',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}>
              {t('appName')}
            </div>
            <div style={{
              fontSize: 10,
              color: '#64748b',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {t('tagline')}
            </div>
          </div>
        </motion.div>

        {/* Desktop Nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          justifyContent: 'center'
        }} className="desktop-nav">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'transparent',
                  color: isActive ? '#1d4ed8' : '#64748b',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      left: '20%',
                      right: '20%',
                      height: 3,
                      borderRadius: 3,
                      background: '#2563eb'
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLanguage}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              color: '#475569',
              fontFamily: 'inherit'
            }}
            title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            <Globe size={16} />
          </motion.button>

          {/* User Info */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }} className="user-info-desktop">
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 700
              }}>
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1e293b'
                }}>
                  {user.first_name} {user.last_name}
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#64748b'
                }}>
                  {t('parentPriority')}
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: '1.5px solid #fee2e2',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#dc2626'
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </motion.button>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: 'white',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'white',
              borderTop: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
            className="mobile-menu"
          >
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: location.pathname === item.path ? '#eff6ff' : 'transparent',
                      color: location.pathname === item.path ? '#1d4ed8' : '#64748b',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      width: '100%'
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .user-info-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;