import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { parentAPI } from '../utils/api';
import { 
  ArrowLeft, 
  ArrowRight,
  User,
  DoorOpen,
  Building,
  Building2,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import AnimatedBackground from '../components/AnimatedBackground';

const StaffDetails = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedIssue');
    if (!stored) {
      navigate('/issue-select');
      return;
    }

    const issue = JSON.parse(stored);
    setSelectedIssue(issue);

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchStaff = async (issueTypeId) => {
      try {
        setIsLoading(true);
        const response = await parentAPI.getAvailableStaff(issueTypeId);
        const staffData = response.data?.staff || [];
        setStaffList(staffData);
        if (staffData.length === 1) {
          setSelectedStaff(staffData[0]);
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
        setStaffList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff(issue.id);
  }, [navigate]);

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
  };

  const handleContinue = () => {
    if (selectedStaff) {
      sessionStorage.setItem('selectedStaff', JSON.stringify(selectedStaff));
      navigate('/queue-confirm');
    }
  };

  const isRTL = dir === 'rtl';
  const steps = [t('selectIssue'), t('selectStaff'), t('waitingForTurn')];

  if (!selectedIssue) return null;

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
        maxWidth: 700,
        margin: '0 auto'
      }}>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: isRTL ? 5 : -5 }}
          onClick={() => navigate('/issue-select')}
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

        <StepIndicator steps={steps} currentStep={1} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 8,
            letterSpacing: '-0.5px'
          }}>
            {t('selectStaff')}
          </h1>
          <p style={{
            fontSize: 15,
            color: '#475569',
            fontWeight: 500
          }}>
            {dir === 'rtl' && selectedIssue.name_ar ? selectedIssue.name_ar : selectedIssue.name}
          </p>
        </motion.div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer" style={{
                height: 160,
                borderRadius: 20,
                background: '#f1f5f9'
              }} />
            ))}
          </div>
        ) : staffList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {staffList.map((staff, index) => {
              const isSelected = selectedStaff?.id === staff.id;
              const queuePercentage = Math.min((staff.current_queue / staff.max_queue_limit) * 100, 100);
              const isQueueFull = staff.current_queue >= staff.max_queue_limit;

              return (
                <motion.button
                  key={staff.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={!isQueueFull ? { scale: 1.01, y: -2 } : {}}
                  whileTap={!isQueueFull ? { scale: 0.99 } : {}}
                  onClick={() => !isQueueFull && handleSelectStaff(staff)}
                  disabled={isQueueFull}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '24px',
                    borderRadius: 20,
                    border: isSelected ? '2.5px solid #1e40af' : '2px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : 'white',
                    cursor: isQueueFull ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    width: '100%',
                    opacity: isQueueFull ? 0.6 : 1,
                    boxShadow: isSelected 
                      ? '0 8px 24px rgba(30,64,175,0.15)' 
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                    position: 'relative'
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
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CheckCircle size={16} color="white" />
                    </motion.div>
                  )}

                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: isSelected 
                      ? 'linear-gradient(135deg, #1e40af, #1d4ed8)' 
                      : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={28} color={isSelected ? 'white' : '#94a3b8'} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                      flexWrap: 'wrap'
                    }}>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#0f172a'
                      }}>
                        {staff.first_name} {staff.last_name}
                      </h3>

                      {staff.school && (
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: '#dbeafe',
                          color: '#1e40af',
                          fontSize: 11,
                          fontWeight: 600,
                          border: '1px solid #bfdbfe',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <GraduationCap size={12} />
                          {staff.school}
                        </span>
                      )}

                      {isQueueFull && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: '#fee2e2',
                          color: '#dc2626',
                          fontSize: 11,
                          fontWeight: 700
                        }}>
                          Full
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 8,
                      marginBottom: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DoorOpen size={14} color="#64748b" />
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                          {staff.room_number}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building size={14} color="#64748b" />
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                          {staff.block}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={14} color="#64748b" />
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                          {staff.floor}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} color="#64748b" />
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                          ~{staff.avg_service_time} min
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      <Users size={14} color="#64748b" />
                      <div style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: '#e2e8f0',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${queuePercentage}%`,
                          height: '100%',
                          borderRadius: 3,
                          background: queuePercentage > 80 ? '#ef4444' : queuePercentage > 50 ? '#f59e0b' : '#22c55e',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: queuePercentage > 80 ? '#dc2626' : queuePercentage > 50 ? '#d97706' : '#16a34a',
                        whiteSpace: 'nowrap'
                      }}>
                        {staff.current_queue}/{staff.max_queue_limit}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}

            <AnimatePresence>
              {selectedStaff && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  style={{
                    position: 'sticky',
                    bottom: 20,
                    zIndex: 10,
                    marginTop: 8
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
                    <span>{t('confirmQueue')}: {selectedStaff.first_name} {selectedStaff.last_name}</span>
                    {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <AlertCircle size={56} color="#cbd5e1" style={{ margin: '0 auto 20px' }} />
            <h3 style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 8
            }}>
              {t('noStaffAvailable')}
            </h3>
            <p style={{
              fontSize: 15,
              color: '#64748b',
              marginBottom: 24,
              fontWeight: 500
            }}>
              {t('noStaffForIssue').replace('{issue}', dir === 'rtl' && selectedIssue.name_ar ? selectedIssue.name_ar : selectedIssue.name)}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/issue-select')}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                background: 'white',
                color: '#475569',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {t('backToIssues')}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StaffDetails;