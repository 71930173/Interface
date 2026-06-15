import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ variant = 'default' }) => {
  const colors = variant === 'hero' 
    ? ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa']
    : ['#f1f5f9', '#e2e8f0', '#dbeafe', '#eff6ff'];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      {/* Gradient orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
          style={{
            position: 'absolute',
            width: 300 + i * 100,
            height: 300 + i * 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors[i % colors.length]}20 0%, transparent 70%)`,
            left: `${10 + i * 20}%`,
            top: `${10 + i * 15}%`,
            filter: 'blur(60px)',
          }}
        />
      ))}

      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${variant === 'hero' ? 'rgba(255,255,255,0.05)' : 'rgba(148,163,184,0.15)'} 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />
    </div>
  );
};

export default AnimatedBackground;