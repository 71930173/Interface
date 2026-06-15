import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, Pause, Play, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import AnimatedCard from '../common/AnimatedCard';
import PageHeader from '../common/PageHeader';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const stats = [
    { label: lang === 'ar' ? 'الطابور اليوم' : 'Queue Today', value: '12', icon: Users, color: 'primary' },
    { label: lang === 'ar' ? 'تم خدمتهم' : 'Served', value: '8', icon: CheckCircle, color: 'secondary' },
    { label: lang === 'ar' ? 'متوسط الوقت' : 'Avg Time', value: '5m', icon: Clock, color: 'accent' },
  ];

  const queue = [
    { id: 1, name: 'Ahmad Khalid', type: 'Admission', ticket: 'A-101', wait: '5 min', priority: 2 },
    { id: 2, name: 'Sarah Smith', type: 'Financial', ticket: 'A-102', wait: '10 min', priority: 1 },
    { id: 3, name: 'John Doe', type: 'Academic', ticket: 'A-103', wait: '15 min', priority: 2 },
  ];

  return (
    <div className="page-container">
      <div className="content-container">
        <PageHeader title={lang === 'ar' ? 'لوحة الموظف' : 'Staff Dashboard'}
          subtitle={`Welcome, ${user?.firstName || user?.first_name || 'Staff'}`}
          icon={Activity}
          actions={
            <div className="flex gap-2">
              <button onClick={() => setIsAvailable(!isAvailable)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isAvailable ? 'bg-secondary-100 text-secondary-700' : 'bg-danger-100 text-danger-700'}`}>
                {isAvailable ? (lang === 'ar' ? 'متاح' : 'Available') : (lang === 'ar' ? 'غير متاح' : 'Unavailable')}
              </button>
              <button onClick={() => setIsPaused(!isPaused)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!isPaused ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <AnimatedCard className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-dark-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </div>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark-900">{lang === 'ar' ? 'الطابور الحالي' : 'Current Queue'}</h2>
            <button onClick={() => navigate('/staff/queue')} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              {lang === 'ar' ? 'إدارة' : 'Manage'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {queue.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-dark-50 rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.priority === 1 ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
                  {item.priority === 1 ? 'P1' : 'P2'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark-900">{item.name}</p>
                  <p className="text-sm text-dark-500">{item.type} • #{item.ticket}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-dark-700">{item.wait}</p>
                  <p className="text-xs text-dark-500">{lang === 'ar' ? 'انتظار' : 'wait'}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-secondary-100 text-secondary-700 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};
export default StaffDashboard;
