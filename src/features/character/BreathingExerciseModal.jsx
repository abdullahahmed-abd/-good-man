import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';

const PATTERNS = [
  { name: 'Box Breathing (4-4-4-4)', inhale: 4, hold1: 4, exhale: 4, hold2: 4, desc: 'Used by Navy SEALs to stay calm under intense pressure' },
  { name: '4-7-8 Relaxing', inhale: 4, hold1: 7, exhale: 8, hold2: 0, desc: 'Natural tranquilizer for the nervous system and deep sleep' },
  { name: 'Resonant Coherence (5-5)', inhale: 5, hold1: 0, exhale: 5, hold2: 0, desc: 'Optimizes heart rate variability (HRV) and emotional balance' }
];

export default function BreathingExerciseModal({ isOpen, onClose }) {
  const addXp = useAppStore(state => state.addXp);
  const [selectedPattern, setSelectedPattern] = useState(PATTERNS[0]);
  const [phase, setPhase] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale' | 'Hold'
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setPhaseSeconds(prev => {
          if (prev <= 1) {
            // Transition phase
            sounds.playTap();
            if (phase === 'Inhale') {
              if (selectedPattern.hold1 > 0) {
                setPhase('Hold');
                return selectedPattern.hold1;
              } else {
                setPhase('Exhale');
                return selectedPattern.exhale;
              }
            } else if (phase === 'Hold' && selectedPattern.hold1 > 0) {
              setPhase('Exhale');
              return selectedPattern.exhale;
            } else if (phase === 'Exhale') {
              if (selectedPattern.hold2 > 0) {
                setPhase('Hold Empty');
                return selectedPattern.hold2;
              } else {
                setCyclesCompleted(c => c + 1);
                setPhase('Inhale');
                return selectedPattern.inhale;
              }
            } else {
              setCyclesCompleted(c => c + 1);
              setPhase('Inhale');
              return selectedPattern.inhale;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, selectedPattern]);

  const toggleExercise = () => {
    sounds.playTap();
    if (!isActive) {
      sounds.playBowl();
      setPhase('Inhale');
      setPhaseSeconds(selectedPattern.inhale);
    } else {
      if (cyclesCompleted >= 2) {
        addXp(30, 'Completed mindful breathing exercise');
      }
    }
    setIsActive(!isActive);
  };

  const getCircleScale = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'Inhale') return 'scale-125';
    if (phase === 'Exhale') return 'scale-90';
    return 'scale-115';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsActive(false);
        onClose();
      }}
      title="Mindful Respiration & Ataraxia"
      icon="🌬️"
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-center text-slate-200">
        {/* Pattern Selector */}
        <div className="flex justify-center space-x-1.5">
          {PATTERNS.map(p => (
            <button
              key={p.name}
              onClick={() => {
                sounds.playTap();
                setSelectedPattern(p);
                setPhase('Inhale');
                setPhaseSeconds(p.inhale);
                setIsActive(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedPattern.name === p.name
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          {selectedPattern.desc}
        </p>

        {/* Animated Breathing Orb */}
        <div className="py-6 flex justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer Aura Ring */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/30 to-amber-500/20 blur-xl transition-all duration-1000 ${getCircleScale()}`}
            />
            {/* Core Expanding Circle */}
            <div
              className={`w-36 h-36 rounded-full border-2 border-emerald-400/60 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-1000 ${getCircleScale()} shadow-neon-emerald`}
            >
              <span className="text-sm font-extrabold text-white tracking-widest uppercase">
                {isActive ? phase : 'Ready'}
              </span>
              <span className="text-2xl font-black text-emerald-300 font-mono mt-0.5">
                {isActive ? `${phaseSeconds}s` : 'Start'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Cycles Completed: <span className="font-bold text-emerald-400">{cyclesCompleted}</span>
        </div>

        {/* Play / Pause Control */}
        <div className="flex justify-center pt-2">
          <button
            onClick={toggleExercise}
            className={`px-8 py-3.5 rounded-2xl font-extrabold text-xs shadow-glass flex items-center space-x-2 transition-all ${
              isActive 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Breath</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Begin Practice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

