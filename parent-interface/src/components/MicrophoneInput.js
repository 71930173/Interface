import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MicrophoneInput = ({ onTranscript, placeholder, value, onChange, disabled }) => {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef(value || '');
  const textareaRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    finalTranscriptRef.current = value || '';
  }, [value]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    rec.maxAlternatives = 1;

    let finalTranscript = '';

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
      finalTranscript = finalTranscriptRef.current;
    };

    rec.onresult = (event) => {
      let interimTranscript = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimText(interimTranscript);

      if (newFinal) {
        const currentText = finalTranscriptRef.current;
        const separator = currentText && !currentText.endsWith(' ') ? ' ' : '';
        const updatedValue = currentText + separator + newFinal;
        finalTranscript = updatedValue;
        finalTranscriptRef.current = updatedValue;
        setInterimText('');
        onChange?.(updatedValue);
        onTranscript?.(updatedValue);
      }
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow permissions.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'network') {
        setError('Network error. Please check connection.');
      } else if (event.error !== 'aborted') {
        setError(event.error);
      }
      setIsListening(false);
      setInterimText('');
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimText('');
      // Auto-restart if still supposed to be listening (for continuous mode)
      if (isListeningRef.current && recognitionRef.current) {
        try {
          setTimeout(() => {
            if (isListeningRef.current) {
              recognitionRef.current.start();
            }
          }, 200);
        } catch (e) {
          console.error('Auto-restart failed:', e);
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      setInterimText('');
    } else {
      setError(null);
      setInterimText('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Start error:', e);
        // If already started, stop and restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 300);
        } catch (e2) {
          setError('Could not start microphone. Please try again.');
          setIsListening(false);
        }
      }
    }
  }, [isListening]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    finalTranscriptRef.current = newValue;
    onChange?.(newValue);
    onTranscript?.(newValue);
  };

  const displayValue = value || '';
  const displayText = interimText ? (displayValue ? displayValue + ' ' + interimText : interimText) : displayValue;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Main input container - flex row, never column */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        width: '100%'
      }}>
        {/* Textarea container - takes all available space */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={displayText}
            onChange={handleTextChange}
            placeholder={placeholder || t('descriptionPlaceholder')}
            disabled={disabled}
            style={{
              width: '100%',
              minHeight: 120,
              padding: '14px 16px 32px 16px',
              borderRadius: 14,
              border: isListening 
                ? '2px solid #2563eb' 
                : error 
                  ? '2px solid #ef4444' 
                  : '2px solid #e2e8f0',
              background: isListening ? '#eff6ff' : 'white',
              fontSize: 15,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
              color: '#1e293b',
              boxShadow: isListening ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none',
              display: 'block',
              boxSizing: 'border-box',
              margin: 0
            }}
          />
          <div style={{
            textAlign: 'right',
            fontSize: 11,
            color: '#94a3b8',
            fontWeight: 500,
            marginTop: 4,
            paddingRight: 4
          }}>
            {(value || '').length} chars
          </div>
        </div>

        {/* Mic button - fixed size, never wraps */}
        <div style={{ 
          flexShrink: 0, 
          paddingTop: 4,
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          <motion.button
            type="button"
            whileHover={{ scale: disabled ? 1 : 1.08 }}
            whileTap={{ scale: disabled ? 1 : 0.92 }}
            onClick={toggleListening}
            disabled={disabled}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              border: 'none',
              background: isListening 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              boxShadow: isListening 
                ? '0 4px 16px rgba(239,68,68,0.4)' 
                : '0 4px 16px rgba(37,99,235,0.3)',
              transition: 'all 0.2s ease',
              outline: 'none',
              flexShrink: 0,
              position: 'relative'
            }}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <MicOff size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="mic"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mic size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: 13,
              fontWeight: 600,
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              gap: 3,
              alignItems: 'flex-end',
              height: 16
            }}>
              {[1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 16, 4] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                  }}
                  style={{
                    width: 3,
                    borderRadius: 2,
                    background: '#2563eb'
                  }}
                />
              ))}
            </div>
            <span>{t('listening') || 'Listening...'}</span>
            <span style={{ color: '#64748b', fontWeight: 400 }}>— Speak now</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            <Volume2 size={14} />
            {error === 'not-allowed' ? 'Microphone access denied. Please allow permissions.' : 
             error === 'no-speech' ? 'No speech detected. Please try again.' :
             error === 'network' ? 'Network error. Please check connection.' :
             typeof error === 'string' ? error : 'Speech recognition error. Please try again.'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MicrophoneInput;