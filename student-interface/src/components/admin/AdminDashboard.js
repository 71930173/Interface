import React from 'react';
import { Shield, Users, BarChart3, Settings, ArrowRight, Activity, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import AnimatedCard from '../common/AnimatedCard';
import PageHeader from '../common/PageHeader';

const AdminDashboard = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    { label: lang === 'ar' ? 'إجمالي الموظفين' : 'Total Staff', value: '15', icon: Users, color: 'primary', trend: '+2' },
    { label: lang === 'ar' ? 'الطابور النشط' : 'Active Queues', value: '8', icon: Activity, color: 'secondary', trend: '+3' },
    { label: lang === 'ar' ? 'الطلاب' : 'Students', value: '1,240', icon: Users, color: 'accent', trend: '+45' },
    { label: lang === 'ar' ? 'الأولياء' : 'Parents', value: '320', icon: Users, color: 'dark', trend: '+12' },
  ];

  const quickLinks = [
    { title: lang === 'ar' ? 'إدارة الموظفين' : 'Manage Staff', desc: lang === 'ar' ? 'إضافة وتعديل الموظفين' : 'Add and edit staff', icon: Users, path: '/admin/staff', color: 'primary' },
    { title: lang === 'ar' ? 'الطلاب' : 'Students', desc: lang === 'ar' ? 'عرض وإدارة الطلاب' : 'View and manage students', icon: Users, path: '/admin/students', color: 'secondary' },
    { title: lang === 'ar' ? 'الأولياء' : 'Parents', desc: lang === 'ar' ? 'عرض وإدارة الأولياء' : 'View and manage parents', icon: Users, path: '/admin/parents', color: 'accent' },
    { title: lang === 'ar' ? 'المواعيد' : 'Appointments', desc: lang === 'ar' ? 'جميع المواعيد' : 'All appointments', icon: BarChart3, path: '/admin/appointments', color: 'dark' },
    { title: lang === 'ar' ? 'الإعدادات' : 'Settings', desc: lang === 'ar' ? 'إعدادات النظام' : 'System settings', icon: Settings, path: '/admin/settings', color: 'primary' },
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <PageHeader title={lang === 'ar' ? 'لوحة المسؤول' : 'Admin Dashboard'} subtitle="System Overview" icon={Shield} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <AnimatedCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
                    <span className="text-xs text-secondary-600 font-medium">{stat.trend}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-dark-900 mb-4">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
              <AnimatedCard className="p-5 cursor-pointer" onClick={() => navigate(link.path)}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${link.color}-100 flex items-center justify-center`}>
                    <link.icon className={`w-6 h-6 text-${link.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-dark-900">{link.title}</h3>
                    <p className="text-sm text-dark-500">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-dark-400" />
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
