import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Users, Clock, Bell, ArrowRight, Zap, Heart, MapPin, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { parentAPI } from '../../services/api';
import AnimatedCard from '../common/AnimatedCard';
import PageHeader from '../common/PageHeader';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';

const ParentDashboard = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await parentAPI.getActiveAppointment();
      setActiveAppointment(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className="page-container">
      <div className="content-container">
        <PageHeader
          title={`${lang === 'ar' ? 'مرحباً' : 'Welcome'}, ${user?.firstName || user?.first_name || 'Parent'}!`}
          subtitle={lang === 'ar' ? 'لديك أولوية خاصة في الطابور' : 'You have special priority in the queue'}
          icon={Heart}
          actions={
            <button onClick={() => navigate('/parent/queue')} className="btn-primary gap-2">
              <Zap className="w-4 h-4" /> {lang === 'ar' ? 'الانضمام للطابور' : 'Join Queue'}
            </button>
          }
        />

        <div className="bg-accent-50 border-2 border-accent-300 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 text-accent-600" />
            <span className="font-bold text-accent-700 text-lg">
              {lang === 'ar' ? 'أولوية الوالدين مفعلة' : 'Parent Priority Enabled'}
            </span>
          </div>
          <p className="text-accent-600">
            {lang === 'ar' 
              ? 'كولي أمر، لديك أولوية (1) في الطابور أمام الطلاب (2). هذا يعني خدمة أسرع لك.'
              : 'As a parent, you have priority (1) in queue ahead of students (2). This means faster service for you.'}
          </p>
        </div>

        {activeAppointment ? (
          <AnimatedCard className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-dark-900 text-lg">{lang === 'ar' ? 'موعدك النشط' : 'Your Active Appointment'}</h3>
                <p className="text-dark-500">Ticket #{activeAppointment.ticket_number}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-dark-50 rounded-xl text-center">
                <MapPin className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                <p className="text-sm font-semibold">{activeAppointment.staff_name}</p>
              </div>
              <div className="p-3 bg-dark-50 rounded-xl text-center">
                <Clock className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                <p className="text-sm font-semibold">{activeAppointment.estimated_wait_minutes} min</p>
              </div>
              <div className="p-3 bg-dark-50 rounded-xl text-center">
                <Users className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                <p className="text-sm font-semibold">#{activeAppointment.queue_position}</p>
              </div>
            </div>
            <button onClick={() => navigate(`/parent/queue-status/${activeAppointment.id}`)}
              className="w-full mt-4 btn-primary gap-2">
              <ArrowRight className="w-4 h-4" /> {lang === 'ar' ? 'تتبع الطابور' : 'Track Queue'}
            </button>
          </AnimatedCard>
        ) : (
          <EmptyState
            icon={Ticket}
            title={lang === 'ar' ? 'لا يوجد موعد نشط' : 'No Active Appointment'}
            description={lang === 'ar' ? 'انضم للطابور الآن للحصول على أولويتك' : 'Join the queue now to get your priority'}
            action={
              <button onClick={() => navigate('/parent/queue')} className="btn-primary gap-2">
                <Zap className="w-4 h-4" /> {lang === 'ar' ? 'الانضمام للطابور' : 'Join Queue'}
              </button>
            }
          />
        )}
      </div>
    </div>
  );
};
export default ParentDashboard;
