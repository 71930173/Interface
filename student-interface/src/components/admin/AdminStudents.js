import React from 'react';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../common/PageHeader';
import EmptyState from '../common/EmptyState';

const AdminStudents = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="content-container">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <PageHeader title={lang === 'ar' ? 'الطلاب' : 'Students'} icon={GraduationCap} />
        <EmptyState icon={GraduationCap} title={lang === 'ar' ? 'لا يوجد طلاب' : 'No Students'} />
      </div>
    </div>
  );
};
export default AdminStudents;
