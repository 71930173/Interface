import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ArrowLeft, 
  ArrowRight,
  Check,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Star,
  Shield
} from 'lucide-react';
import MicrophoneInput from '../components/MicrophoneInput';
import StepIndicator from '../components/StepIndicator';
import AnimatedBackground from '../components/AnimatedBackground';

const QueueConfirm = () => {
  const { user } = useAuth();
  const { createQueue, hasActiveQueue } = useQueue();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (hasActiveQueue()) {
      navigate('/waiting');
      return;
    }

    const issueStored = sessionStorage.getItem('selectedIssue');
    const staffStored = sessionStorage.getItem('selectedStaff');

    if (!issueStored || !staffStored) {
      navigate('/issue-select');
      return;
    }

    setSelectedIssue(JSON.parse(issueStored));
    setSelectedStaff(JSON.parse(staffStored));
  }, [navigate, hasActiveQueue]);

  const handleConfirm = async () => {
    if (!agreed) {
      setError('Please agree to the terms to proceed');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await createQueue({
      staff_id: selectedStaff.id,
      issue_type_id: selectedIssue.id,
      description: description,
      user_type: 'parent',
      is_parent_priority: true
    });

    setIsLoading(false);

    if (result.success) {
      sessionStorage.removeItem('selectedIssue');
      sessionStorage.removeItem('selectedStaff');
      navigate('/waiting');
    }
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
        maxWidth: 640,
        margin: '0 auto'
      }}>
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: isRTL ? 5 : -5 }}
          onClick={() => navigate('/staff-details')}
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

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={1} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 28 }}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(30,64,175,0.3)'
          }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 8,
            letterSpacing: '-0.5px'
          }}>
            {t('confirmQueue')}
          </h1>
          <p style={{
            fontSize: 15,
            color: '#475569',
            fontWeight: 500
          }}>
            Review your appointment details before confirming
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: 20,
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginBottom: 24
          }}
        >
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FileText size={18} color="#1e40af" />
            Appointment Summary
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {/* Parent Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={18} color="white" />
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 500,
                  marginBottom: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('fullName')}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  {user?.first_name} {user?.last_name}
                </div>
              </div>
            </div>

            {/* Issue Type */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Star size={18} color="#1e40af" />
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 500,
                  marginBottom: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('issueTypes')}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  {dir === 'rtl' && selectedIssue?.name_ar ? selectedIssue.name_ar : selectedIssue?.name}
                </div>
              </div>
            </div>

            {/* Staff & Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MapPin size={18} color="#16a34a" />
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 500,
                  marginBottom: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('assignedStaff')}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  {selectedStaff?.first_name} {selectedStaff?.last_name} — {selectedStaff?.room_number}, {selectedStaff?.block}
                </div>
              </div>
            </div>

            {/* Priority Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fef3c7, #fef9c3)',
              border: '1px solid #f59e0b'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Star size={18} color="white" />
              </div>
              <div>
                <div style={{
                  fontSize: 12,
                  color: '#92400e',
                  fontWeight: 500,
                  marginBottom: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {t('priority')}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#92400e'
                }}>
                  {t('parentPriority')} — {t('queuePosition')} 1 (after current student)
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: 20,
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            marginBottom: 24
          }}
        >
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <FileText size={18} color="#1e40af" />
            {t('addDescription')}
          </h3>
          <MicrophoneInput
            value={description}
            onChange={setDescription}
            placeholder={t('descriptionPlaceholder')}
          />
        </motion.div>

        {/* Agreement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: 24
          }}
        >
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            cursor: 'pointer'
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: agreed ? 'none' : '2px solid #cbd5e1',
              background: agreed ? 'linear-gradient(135deg, #1e40af, #1d4ed8)' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
              transition: 'all 0.2s'
            }}>
              {agreed && <Check size={16} color="white" strokeWidth={3} />}
            </div>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setError(null); }}
              style={{ display: 'none' }}
            />
            <div style={{
              fontSize: 14,
              color: '#334155',
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              I understand that as a parent, I will receive priority in the queue. I agree to arrive promptly when notified and understand that my queue position may change based on office availability.
            </div>
          </label>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fef2f2',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              border: '1px solid #fecaca'
            }}
          >
            <AlertTriangle size={18} color="#dc2626" />
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#dc2626'
            }}>
              {error}
            </span>
          </motion.div>
        )}

        {/* Confirm Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(30,64,175,0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '18px 28px',
            borderRadius: 16,
            border: 'none',
            background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
            color: 'white',
            fontSize: 17,
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontFamily: 'inherit',
            boxShadow: isLoading ? 'none' : '0 8px 24px rgba(30,64,175,0.25)',
            marginBottom: 40
          }}
        >
          {isLoading ? (
            <div className="animate-rotate" style={{
              width: 20, height: 20,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%'
            }} />
          ) : (
            <>
              <Check size={22} />
              {t('confirmQueue')}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default QueueConfirm;