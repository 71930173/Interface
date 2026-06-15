import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '20px 0',
      flexWrap: 'wrap'
    }}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <React.Fragment key={index}>
            {/* Step circle */}
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1.1 : 1,
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isCompleted 
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : isCurrent 
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : '#f1f5f9',
                color: isCompleted || isCurrent ? 'white' : '#94a3b8',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: isCurrent 
                  ? '0 4px 16px rgba(37,99,235,0.3)' 
                  : isCompleted 
                    ? '0 4px 16px rgba(34,197,94,0.3)'
                    : 'none',
                border: isPending ? '2px solid #e2e8f0' : 'none',
                flexShrink: 0
              }}
            >
              {isCompleted ? (
                <Check size={18} strokeWidth={3} />
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Step label */}
            <span style={{
              fontSize: 13,
              fontWeight: isCurrent ? 700 : 500,
              color: isCurrent ? '#1d4ed8' : isCompleted ? '#16a34a' : '#94a3b8',
              whiteSpace: 'nowrap'
            }}>
              {step}
            </span>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div style={{
                width: 24,
                height: 2,
                borderRadius: 1,
                background: isCompleted ? '#22c55e' : '#e2e8f0',
                margin: '0 4px',
                flexShrink: 0
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;