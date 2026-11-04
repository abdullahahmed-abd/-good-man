import React from 'react';
import { getTimeOfDay } from '../../utils/dateUtils';
import { useAppStore } from '../../store/useAppStore';

export default function AuroraBackground() {
  const theme = useAppStore(state => state.theme);
  const timeOfDay = getTimeOfDay();

  // Color schemes for different times of day
  const getGradients = () => {
    if (theme === 'light') {
      switch (timeOfDay) {
        case 'dawn':
          return {
            blob1: 'bg-rose-200/50',
            blob2: 'bg-amber-200/40',
            blob3: 'bg-indigo-100/40'
          };
        case 'morning':
          return {
            blob1: 'bg-emerald-200/50',
            blob2: 'bg-sky-200/50',
            blob3: 'bg-lime-100/40'
          };
        case 'afternoon':
          return {
            blob1: 'bg-cyan-200/50',
            blob2: 'bg-blue-200/40',
            blob3: 'bg-amber-100/30'
          };
        case 'golden_hour':
          return {
            blob1: 'bg-amber-300/50',
            blob2: 'bg-rose-200/45',
            blob3: 'bg-purple-200/35'
          };
        default:
          return {
            blob1: 'bg-slate-300/40',
            blob2: 'bg-indigo-200/35',
            blob3: 'bg-sky-200/30'
          };
      }
    }

    // Dark mode spatial auroras
    switch (timeOfDay) {
      case 'dawn':
        return {
          blob1: 'bg-rose-600/15',
          blob2: 'bg-amber-500/15',
          blob3: 'bg-indigo-700/15'
        };
      case 'morning':
        return {
          blob1: 'bg-emerald-600/15',
          blob2: 'bg-teal-500/15',
          blob3: 'bg-sky-700/15'
        };
      case 'afternoon':
        return {
          blob1: 'bg-cyan-600/15',
          blob2: 'bg-blue-600/15',
          blob3: 'bg-emerald-800/15'
        };
      case 'golden_hour':
        return {
          blob1: 'bg-amber-600/18',
          blob2: 'bg-orange-700/18',
          blob3: 'bg-purple-800/18'
        };
      default: // night / evening
        return {
          blob1: 'bg-emerald-950/25',
          blob2: 'bg-indigo-950/30',
          blob3: 'bg-slate-900/30'
        };
    }
  };

  const gradients = getGradients();

  return (
    <div className="aurora-bg" aria-hidden="true">
      {/* Top Left Blob */}
      <div
        className={`aurora-blob w-[500px] h-[500px] -top-32 -left-32 animate-aurora-slow ${gradients.blob1}`}
        style={{ animationDuration: '22s' }}
      />
      {/* Top Right Blob */}
      <div
        className={`aurora-blob w-[600px] h-[600px] -top-20 -right-36 animate-aurora-slow ${gradients.blob2}`}
        style={{ animationDuration: '26s', animationDelay: '-7s' }}
      />
      {/* Bottom Center / Accent Blob */}
      <div
        className={`aurora-blob w-[550px] h-[550px] bottom-10 left-1/3 animate-aurora-slow ${gradients.blob3}`}
        style={{ animationDuration: '28s', animationDelay: '-14s' }}
      />
      
      {/* Subtle spatial star/grid texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}

