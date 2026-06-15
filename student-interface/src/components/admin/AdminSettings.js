import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../common/PageHeader';

const AdminSettings = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="content-container">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <PageHeader title={lang === 'ar' ? 'إعدادات النظام' : 'System Settings'} icon={Settings} />
        <div className="bg-white rounded-2xl shadow-soft border border-dark-100 p-6">
          <h3 className="font-bold text-dark-900 mb-4">{lang === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
              <div>
                <p className="font-semibold text-dark-700">{lang === 'ar' ? 'أولوية الوالدين' : 'Parent Priority'}</p>
                <p className="text-sm text-dark-500">{lang === 'ar' ? 'تفعيل أولوية الوالدين في الطابور' : 'Enable parent priority in queue'}</p>
              </div>
              <div className="w-12 h-6 bg-secondary-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
              <div>
                <p className="font-semibold text-dark-700">{lang === 'ar' ? 'الحد الأقصى للطابور' : 'Max Queue Limit'}</p>
                <p className="text-sm text-dark-500">{lang === 'ar' ? 'الحد الأقصى لعدد الأشخاص في الطابور' : 'Maximum people per queue'}</p>
              </div>
              <span className="text-lg font-bold text-primary-600">20</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
              <div>
                <p className="font-semibold text-dark-700">{lang === 'ar' ? 'الإلغاء التلقائي' : 'Auto Cancel'}</p>
                <p className="text-sm text-dark-500">{lang === 'ar' ? 'إلغاء الموعد بعد (دقائق)' : 'Cancel appointment after (minutes)'}</p>
              </div>
              <span className="text-lg font-bold text-primary-600">30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminSettings;
