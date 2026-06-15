import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { parentAPI } from '../utils/api';
import { 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle,
  UserPlus,
  GraduationCap,
  DollarSign,
  Laptop,
  Users,
  HelpCircle,
  FileText,
  Phone,
  Mail,
  Calendar,
  Building,
  BookOpen
} from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import AnimatedBackground from '../components/AnimatedBackground';

// Map react-icons/fa names to lucide-react components
const ICON_MAP = {
  'FaUserPlus': UserPlus,
  'FaDollarSign': DollarSign,
  'FaGraduationCap': GraduationCap,
  'FaLaptopCode': Laptop,
  'FaUsers': Users,
  'FaQuestionCircle': HelpCircle,
  'FaFileAlt': FileText,
  'FaPhone': Phone,
  'FaEnvelope': Mail,
  'FaCalendar': Calendar,
  'FaBuilding': Building,
  'FaBook': BookOpen,
};

// Fallback mapping by ID for hardcoded defaults
const ID_CONFIG = {
  1: { icon: UserPlus, color: '#1e40af', label: 'Admission' },
  2: { icon: DollarSign, color: '#16a34a', label: 'Financial' },
  3: { icon: GraduationCap, color: '#d97706', label: 'Academic' },
  4: { icon: Laptop, color: '#9333ea', label: 'IT Support' },
  5: { icon: Users, color: '#db2777', label: 'Student Affairs' },
  6: { icon: HelpCircle, color: '#64748b', label: 'Other' },
};

// Generate colors from the database color
const getColors = (color) => {
  if (!color) return {
    bg: '#f8fafc',
    icon: '#64748b',
    border: '#94a3b8',
    gradient: 'from-slate-500 to-slate-600'
  };

  return {
    bg: color + '15',
    icon: color,
    border: color,
    gradient: 'from-blue-500 to-blue-600'
  };
};

const getIssueConfig = (issue) => {
  // Try database icon first
  if (issue.icon && ICON_MAP[issue.icon]) {
    return {
      icon: ICON_MAP[issue.icon],
      colors: getColors(issue.color),
      label: issue.name || 'Unknown'
    };
  }

  // Fallback by ID
  if (issue.id && ID_CONFIG[issue.id]) {
    return {
      ...ID_CONFIG[issue.id],
      colors: getColors(ID_CONFIG[issue.id].color),
    };
  }

  // Fallback by normalized name
  const normalizedName = (issue.name || '').toLowerCase().replace(/\s+/g, '');
  const nameToId = {
    'admission': 1,
    'financial': 2,
    'academic': 3,
    'itsupport': 4,
    'it': 4,
    'studentaffairs': 5,
    'student': 5,
    'other': 6
  };
  const id = nameToId[normalizedName];
  if (id && ID_CONFIG[id]) {
    return {
      ...ID_CONFIG[id],
      colors: getColors(ID_CONFIG[id].color),
    };
  }

  // Default
  return {
    icon: HelpCircle,
    colors: getColors('#64748b'),
    label: issue.name || 'Unknown'
  };
};

const IssueSelect = () => {
  const { hasActiveQueue } = useQueue();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const [issueTypes, setIssueTypes] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssueTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await parentAPI.getIssueTypes();
      const data = response.data || [];

      // Ensure each issue has proper config using database icon/color
      const processed = data.map(issue => ({
        ...issue,
        _config: getIssueConfig(issue)
      }));

      setIssueTypes(processed);
    } catch (err) {
      console.error('Error fetching issue types:', err);
      // Fallback demo data with configs
      setIssueTypes([
        { id: 1, name: 'Admission', name_ar: 'القبول', description: 'New student admission, transfer, documents', icon: 'FaUserPlus', color: '#1e40af', _config: getIssueConfig({ id: 1, name: 'Admission', icon: 'FaUserPlus', color: '#1e40af' }) },
        { id: 2, name: 'Financial', name_ar: 'المالية', description: 'Tuition fees, payments, scholarships', icon: 'FaDollarSign', color: '#16a34a', _config: getIssueConfig({ id: 2, name: 'Financial', icon: 'FaDollarSign', color: '#16a34a' }) },
        { id: 3, name: 'Academic', name_ar: 'الأكاديمية', description: 'Grades, courses, registration', icon: 'FaGraduationCap', color: '#d97706', _config: getIssueConfig({ id: 3, name: 'Academic', icon: 'FaGraduationCap', color: '#d97706' }) },
        { id: 4, name: 'IT Support', name_ar: 'دعم تقني', description: 'Portal issues, email, technical problems', icon: 'FaLaptopCode', color: '#9333ea', _config: getIssueConfig({ id: 4, name: 'IT Support', icon: 'FaLaptopCode', color: '#9333ea' }) },
        { id: 5, name: 'Student Affairs', name_ar: 'شؤون الطلاب', description: 'Student activities, complaints, certificates', icon: 'FaUsers', color: '#db2777', _config: getIssueConfig({ id: 5, name: 'Student Affairs', icon: 'FaUsers', color: '#db2777' }) },
        { id: 6, name: 'Other', name_ar: 'أخرى', description: 'Other issues not listed above', icon: 'FaQuestionCircle', color: '#64748b', _config: getIssueConfig({ id: 6, name: 'Other', icon: 'FaQuestionCircle', color: '#64748b' }) },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssueTypes();
  }, [fetchIssueTypes]);

  const handleSelect = (issue) => {
    setSelectedIssue(issue);
  };

  const handleContinue = () => {
    if (!selectedIssue) return;
    sessionStorage.setItem('selectedIssue', JSON.stringify(selectedIssue));
    navigate('/staff-details');
  };

  const isRTL = dir === 'rtl';
  const steps = [t('selectIssue'), t('confirmQueue'), t('waitingForTurn')];

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      position: 'relative',
      padding: '20px'
    }}>
      <AnimatedBackground />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 800,
        margin: '0 auto'
      }}>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: isRTL ? 5 : -5 }}
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 10,
            border: '1.5px solid #e2e8f0',
            background: 'white',
            color: '#64748b',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 20,
            fontFamily: 'inherit'
          }}
        >
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          {t('back')}
        </motion.button>

        <StepIndicator steps={steps} currentStep={0} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 8,
            letterSpacing: '-0.5px'
          }}>
            {t('selectIssue')}
          </h1>
          <p style={{
            fontSize: 15,
            color: '#475569',
            fontWeight: 500,
            maxWidth: 400,
            margin: '0 auto'
          }}>
            {t('selectIssueDesc')}
          </p>
        </motion.div>

        {hasActiveQueue() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fef3c7',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              border: '1px solid #f59e0b'
            }}
          >
            <AlertTriangle size={20} color="#d97706" />
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#92400e'
            }}>
              {t('alreadyInQueue')}
            </span>
          </motion.div>
        )}

        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="shimmer" style={{
                height: 140,
                borderRadius: 16,
                background: '#f1f5f9'
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16
          }}>
            {issueTypes.map((issue, index) => {
              const config = issue._config || getIssueConfig(issue);
              const Icon = config.icon;
              const colors = config.colors;
              const isSelected = selectedIssue?.id === issue.id;
              const displayName = dir === 'rtl' && issue.name_ar ? issue.name_ar : issue.name;

              return (
                <motion.button
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -4,
                    boxShadow: `0 12px 32px ${colors.border}40`
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(issue)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '28px 20px',
                    borderRadius: 18,
                    border: isSelected ? `2.5px solid ${colors.border}` : '2px solid #e2e8f0',
                    background: isSelected ? colors.bg : 'white',
                    cursor: 'pointer',
                    position: 'relative',
                    fontFamily: 'inherit',
                    gap: 14,
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 8px 24px ${colors.border}25` : '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: 12,
                        [isRTL ? 'left' : 'right']: 12,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: colors.border,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </motion.div>
                  )}

                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: isSelected ? colors.border : colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}>
                    <Icon size={26} color={isSelected ? 'white' : colors.icon} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: 6
                    }}>
                      {displayName}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#64748b',
                      lineHeight: 1.4,
                      fontWeight: 500
                    }}>
                      {issue.description}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {selectedIssue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: 'sticky',
                bottom: 20,
                marginTop: 32,
                zIndex: 10
              }}
            >
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(30,64,175,0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                style={{
                  width: '100%',
                  padding: '18px 28px',
                  borderRadius: 16,
                  border: 'none',
                  background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                  color: 'white',
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  fontFamily: 'inherit',
                  boxShadow: '0 8px 24px rgba(30,64,175,0.25)'
                }}
              >
                <span>{t('next')}: {dir === 'rtl' && selectedIssue.name_ar ? selectedIssue.name_ar : selectedIssue.name}</span>
                {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IssueSelect;