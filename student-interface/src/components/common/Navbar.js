import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Menu, X, User, LogOut, Settings, Globe,
  GraduationCap, Users, Shield, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { isAuthenticated, userType, user, logout } = useAuth();
  const { lang, t, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/login', icon: User, label: t('login') },
        { to: '/signup', icon: GraduationCap, label: t('signup') },
      ];
    }

    switch (userType) {
      case 'student':
        return [
          { to: '/student/dashboard', icon: Home, label: t('dashboard') },
          { to: '/student/queue', icon: Users, label: t('selectIssue') },
          { to: '/student/appointments', icon: GraduationCap, label: t('myAppointments') },
          { to: '/student/notifications', icon: Bell, label: t('notifications'), badge: unreadCount },
        ];
      case 'parent':
        return [
          { to: '/parent/dashboard', icon: Home, label: t('dashboard') },
          { to: '/parent/queue', icon: Users, label: t('selectIssue') },
          { to: '/parent/appointments', icon: GraduationCap, label: t('myAppointments') },
          { to: '/parent/notifications', icon: Bell, label: t('notifications'), badge: unreadCount },
        ];
      case 'staff':
        return [
          { to: '/staff/dashboard', icon: Home, label: t('dashboard') },
          { to: '/staff/queue', icon: Users, label: 'Queue Management' },
          { to: '/staff/notifications', icon: Bell, label: t('notifications'), badge: unreadCount },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', icon: Home, label: t('dashboard') },
          { to: '/admin/staff', icon: Users, label: 'Staff' },
          { to: '/admin/students', icon: GraduationCap, label: 'Students' },
          { to: '/admin/parents', icon: Shield, label: 'Parents' },
        ];
      default:
        return [];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = getNavLinks();
  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled || !isHome 
        ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-dark-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isScrolled || !isHome 
                ? 'bg-primary-600 shadow-glow' 
                : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <GraduationCap className={`w-6 h-6 ${isScrolled || !isHome ? 'text-white' : 'text-white'}`} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg font-bold transition-colors duration-300 ${
                isScrolled || !isHome ? 'text-dark-900' : 'text-white'
              }`}>
                {t('appName')}
              </h1>
              <p className={`text-xs transition-colors duration-300 ${
                isScrolled || !isHome ? 'text-dark-500' : 'text-white/70'
              }`}>
                {t('appSubtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-600'
                    : isScrolled || !isHome
                      ? 'text-dark-600 hover:bg-dark-100 hover:text-dark-900'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isScrolled || !isHome
                  ? 'text-dark-600 hover:bg-dark-100'
                  : 'text-white/80 hover:bg-white/10'
              }`}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isScrolled || !isHome
                  ? 'text-dark-600 hover:bg-dark-100'
                  : 'text-white/80 hover:bg-white/10'
              }`}
              title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                    isScrolled || !isHome
                      ? 'hover:bg-dark-100'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.firstName?.[0] || user?.first_name?.[0] || 'U'}
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${
                    isScrolled || !isHome ? 'text-dark-700' : 'text-white'
                  }`}>
                    {user?.firstName || user?.first_name || 'User'}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-hard border border-dark-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-dark-100">
                        <p className="font-semibold text-dark-900">
                          {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                        </p>
                        <p className="text-sm text-dark-500">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-lg capitalize">
                          {userType}
                        </span>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => navigate(`/${userType}/profile`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          {t('profile')}
                        </button>
                        <button
                          onClick={() => navigate(`/${userType}/settings`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          {t('settings')}
                        </button>
                        <hr className="my-2 border-dark-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isScrolled || !isHome
                      ? 'text-dark-700 hover:bg-dark-100'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isScrolled || !isHome
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-glow'
                      : 'bg-white text-primary-600 hover:bg-white/90'
                  }`}
                >
                  {t('signup')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all duration-300 ${
                isScrolled || !isHome
                  ? 'text-dark-700 hover:bg-dark-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-dark-100 shadow-hard"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === link.to
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-dark-700 hover:bg-dark-50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-auto w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-dark-100 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-dark-700 hover:bg-dark-50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    {t('login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    <GraduationCap className="w-5 h-5" />
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
