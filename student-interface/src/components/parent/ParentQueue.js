import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import IssueTypeSelection from '../student/IssueTypeSelection';

const ParentQueue = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="content-container">
        <button onClick={() => navigate('/parent/dashboard')} className="flex items-center gap-2 text-dark-500 hover:text-dark-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>
        <IssueTypeSelection />
      </div>
    </div>
  );
};
export default ParentQueue;
