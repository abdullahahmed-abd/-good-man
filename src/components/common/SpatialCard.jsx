import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function SpatialCard({
  children,
  className = '',
  enableTilt = true,
  onClick,
  glassStyle = 'default', // 'default' | 'subtle' | 'glow'
  ...props
}) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e) => {
    if (!enableTilt || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt: max 5 degrees
    const rX = ((y - centerY) / centerY) * -5;
    const rY = ((x - centerX) / centerX) * 5;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const getGlassClass = () => {
    if (glassStyle === 'subtle') return 'spatial-glass-subtle';
    return 'spatial-glass-card';
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        rotateX: enableTilt && !shouldReduceMotion ? rotateX : 0,
        rotateY: enableTilt && !shouldReduceMotion ? rotateY : 0,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 250 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`rounded-3xl p-5 relative overflow-hidden ${getGlassClass()} ${className}`}
      {...props}
    >
      {/* Light sheen effect on hover */}
      {isHovered && !shouldReduceMotion && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2), transparent 70%)'
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

