import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, ArrowRight, Users, Clock, Bell, 
  Shield, Zap, Globe, ChevronDown, Star, Heart,
  Ticket, MapPin, Smartphone, BarChart3, Menu, X, LogIn, UserPlus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const HomePage = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: lang === 'ar' ? 'الرئيسية' : 'Home', href: '#hero' },
    { label: lang === 'ar' ? 'كيف يعمل' : 'How It Works', href: '#how-it-works' },
    { label: lang === 'ar' ? 'المميزات' : 'Features', href: '#features' },
    { label: lang === 'ar' ? 'الأدوار' : 'Roles', href: '#roles' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: Users,
      title: lang === 'ar' ? 'طابور ذكي' : 'Smart Queue',
      desc: lang === 'ar' ? 'نظام طابور متقدم مع أولوية للوالدين' : 'Advanced queue system with parent priority'
    },
    {
      icon: Clock,
      title: lang === 'ar' ? 'وقت انتظار دقيق' : 'Accurate Wait Time',
      desc: lang === 'ar' ? 'توقعات دقيقة لوقت الانتظار في الوقت الفعلي' : 'Real-time accurate wait time estimates'
    },
    {
      icon: Bell,
      title: lang === 'ar' ? 'إشعارات فورية' : 'Instant Notifications',
      desc: lang === 'ar' ? 'تنبيهات SMS وإيميل وWhatsApp' : 'SMS, Email & WhatsApp alerts'
    },
    {
      icon: Shield,
      title: lang === 'ar' ? 'آمن وموثوق' : 'Secure & Reliable',
      desc: lang === 'ar' ? 'بيانات مشفرة ونظام آمن' : 'Encrypted data & secure system'
    },
    {
      icon: Globe,
      title: lang === 'ar' ? 'دعم ثنائي اللغة' : 'Bilingual Support',
      desc: lang === 'ar' ? 'العربية والإنجليزية' : 'Arabic & English'
    },
    {
      icon: Smartphone,
      title: lang === 'ar' ? 'تصميم متجاوب' : 'Responsive Design',
      desc: lang === 'ar' ? 'يعمل على جميع الأجهزة' : 'Works on all devices'
    }
  ];

  const roles = [
    {
      title: lang === 'ar' ? 'طالب' : 'Student',
      desc: lang === 'ar' ? 'سجل وانضم للطابور بسهولة' : 'Register and join queue easily',
      color: 'primary',
      link: '/login',
      icon: GraduationCap
    },
    {
      title: lang === 'ar' ? 'ولي أمر' : 'Parent',
      desc: lang === 'ar' ? 'أولوية خاصة في الطابور' : 'Special priority in queue',
      color: 'accent',
      link: '/parent/login',
      icon: Heart
    },
    {
      title: lang === 'ar' ? 'موظف' : 'Staff',
      desc: lang === 'ar' ? 'إدارة الطابور والخدمة' : 'Manage queue and service',
      color: 'secondary',
      link: '/staff/login',
      icon: Users
    },
    {
      title: lang === 'ar' ? 'مسؤول' : 'Admin',
      desc: lang === 'ar' ? 'لوحة تحكم وإحصائيات' : 'Dashboard & analytics',
      color: 'dark',
      link: '/admin/login',
      icon: Shield
    }
  ];

  const howItWorks = [
    {
      step: '01',
      icon: GraduationCap,
      title: lang === 'ar' ? 'سجل الدخول' : 'Login',
      desc: lang === 'ar' ? 'استخدم رقم الطالب وكلمة المرور' : 'Use your student ID and password'
    },
    {
      step: '02',
      icon: Ticket,
      title: lang === 'ar' ? 'اختر المشكلة' : 'Select Issue',
      desc: lang === 'ar' ? 'اختر نوع المشكلة التي تحتاج مساعدة فيها' : 'Choose the issue type you need help with'
    },
    {
      step: '03',
      icon: MapPin,
      title: lang === 'ar' ? 'تعرف على الموظف' : 'Know Your Staff',
      desc: lang === 'ar' ? 'شاهد اسم الموظف والموقع والطابور' : 'See staff name, location, and queue'
    },
    {
      step: '04',
      icon: Bell,
      title: lang === 'ar' ? 'انتظر التنبيه' : 'Wait for Alert',
      desc: lang === 'ar' ? 'سيتم إعلامك قبل 3 دقائق من دورك' : 'You will be notified 3 minutes before your turn'
    }
  ];

  return (
    <div className="bg-dark-900">
      {/* ===== NAVBAR - FIXED: Always visible with white text ===== */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-dark-900/95 backdrop-blur-xl shadow-lg border-b border-white/10' 
            : 'bg-dark-900/50 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                {lang === 'ar' ? 'الطابور الذكي' : 'Smart Queue'}
              </span>
            </Link>

            {/* Desktop Nav Links - FIXED: Always white text */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Actions - FIXED: Always visible */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                {t('login') || 'Login'}
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-all duration-300 shadow-glow"
              >
                <UserPlus className="w-4 h-4" />
                {lang === 'ar' ? 'تسجيل' : 'Sign Up'}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:text-white hover:bg-white/10 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-dark-900/98 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="block w-full text-left px-4 py-3 rounded-xl text-white hover:text-white hover:bg-white/10 transition-all"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-white/10 flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('login') || 'Login'}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    {lang === 'ar' ? 'تسجيل' : 'Sign Up'}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.1),transparent_50%)]" />

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.8
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${60 + (i % 3) * 10}%`
            }}
          />
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Star className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-white/80">
                {lang === 'ar' ? 'الإصدار 2.0 - نظام الويب المتقدم' : 'Version 2.0 - Advanced Web System'}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              {lang === 'ar' ? 'الطابور' : 'Smart'}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
                {lang === 'ar' ? 'الذكي' : 'Queue'}
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              {lang === 'ar' 
                ? 'نظام إدارة الطابور الجامعي المتقدم. سجل دخولك، اختر مشكلتك، وتابع طابورك في الوقت الفعلي مع إشعارات فورية.'
                : 'Advanced university queue management system. Login, select your issue, and track your queue in real-time with instant notifications.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {lang === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                {t('login')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-white/40 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-dark-800">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {lang === 'ar' ? 'كيف يعمل؟' : 'How It Works?'}
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              {lang === 'ar' ? 'أربع خطوات بسيطة للحصول على خدمتك' : 'Four simple steps to get your service'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="p-6 bg-dark-700/50 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-primary-500/30 transition-all duration-300">
                  <span className="text-5xl font-black text-white/10 absolute top-4 right-4">{step.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50">{step.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-primary-500/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-900">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {lang === 'ar' ? 'مميزات النظام' : 'System Features'}
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              {lang === 'ar' 
                ? 'حلول متكاملة لإدارة الطابور في الجامعة'
                : 'Comprehensive solutions for university queue management'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-dark-800 rounded-2xl border border-white/10 hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Priority Section */}
      <section className="py-20 bg-gradient-to-br from-accent-900/50 to-dark-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-accent-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {lang === 'ar' ? 'أولوية خاصة للوالدين' : 'Special Priority for Parents'}
            </h2>
            <p className="text-xl text-white/60 mb-8">
              {lang === 'ar' 
                ? 'الوالدين يحصلون على أولوية (1) في الطابور، أمام الطلاب (2). نظام عادل يضمن خدمة سريعة للجميع.'
                : 'Parents get priority (1) in queue, ahead of students (2). A fair system ensuring quick service for everyone.'}
            </p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-accent-500/20 border-2 border-accent-500/50 flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl font-black text-accent-400">1</span>
                </div>
                <p className="text-white font-semibold">{lang === 'ar' ? 'ولي أمر' : 'Parent'}</p>
                <p className="text-sm text-white/50">{lang === 'ar' ? 'أولوية قصوى' : 'Highest Priority'}</p>
              </div>
              <div className="text-4xl text-white/20">vs</div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border-2 border-primary-500/50 flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl font-black text-primary-400">2</span>
                </div>
                <p className="text-white font-semibold">{lang === 'ar' ? 'طالب' : 'Student'}</p>
                <p className="text-sm text-white/50">{lang === 'ar' ? 'أولوية عادية' : 'Standard Priority'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-dark-800">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {lang === 'ar' ? 'اختر دورك' : 'Choose Your Role'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={role.link}
                  className="block p-6 bg-dark-700 rounded-2xl border border-white/10 hover:border-primary-500/50 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${role.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <role.icon className={`w-7 h-7 text-${role.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-sm text-white/50 mb-4">{role.desc}</p>
                  <div className="flex items-center text-primary-400 text-sm font-medium">
                    {lang === 'ar' ? 'دخول' : 'Enter'}
                    <ArrowRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: lang === 'ar' ? 'طالب مسجل' : 'Students Registered' },
              { value: '50+', label: lang === 'ar' ? 'موظف نشط' : 'Active Staff' },
              { value: '99%', label: lang === 'ar' ? 'رضا العملاء' : 'Customer Satisfaction' },
              { value: '24/7', label: lang === 'ar' ? 'دعم فني' : 'Technical Support' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-black text-primary-400 mb-2">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-dark-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {lang === 'ar' ? 'جاهز للبدء؟' : 'Ready to Start?'}
            </h2>
            <p className="text-xl text-white/60 mb-10">
              {lang === 'ar' 
                ? 'انضم إلى آلاف الطلاب والموظفين الذين يستخدمون النظام'
                : 'Join thousands of students and staff using the system'}
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-primary-900 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all shadow-hard"
            >
              <Zap className="w-6 h-6" />
              {lang === 'ar' ? 'إنشاء حساب مجاني' : 'Create Free Account'}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;