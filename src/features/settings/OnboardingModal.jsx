import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { VIRTUES } from '../../db/seedData';
import { usePedometerStore } from '../../store/usePedometerStore';

export default function OnboardingModal() {
  const completeOnboarding = useAppStore(state => state.completeOnboarding);
  const setUserHeight = usePedometerStore(state => state.setUserHeight);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'Seeker',
    heightCm: 175,
    weightKg: 70,
    stepGoal: 8000,
    birthDate: '1998-01-01',
    primaryVirtue: 'discipline',
    language: 'en'
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setUserHeight(formData.heightCm);
      completeOnboarding(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl spatial-glass p-6 sm:p-8 border border-white/20 shadow-2xl relative"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
              {step}/3
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              {step === 1 && 'Welcome to Insaan'}
              {step === 2 && 'Calibrate Body & Health'}
              {step === 3 && 'Soul & Core Virtues'}
            </span>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-left space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Who are you becoming?</h2>
              <p className="text-sm text-slate-400">
                Insaan is your offline sanctuary to align thoughts, actions, and virtues into a noble life.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name / Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Marcus, Aarav, Sarah"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Date (for Memento Mori Life Clock)</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Language Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, language: 'en' })}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition-all text-center ${
                      formData.language === 'en'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    English (Universal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, language: 'hinglish' })}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition-all text-center ${
                      formData.language === 'hinglish'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    Hinglish (Friendly)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Physical Calibration (Pedometer Stride & Goals) */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-left space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Physical Health Engine</h2>
              <p className="text-sm text-slate-400">
                Accurate stride calculations require your height. Steps will not count while traveling in vehicles.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Calculated stride: ~{((formData.heightCm * 0.414) / 100).toFixed(2)}m
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">For calorie burn</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Step Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {[6000, 8000, 10000].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData({ ...formData, stepGoal: goal })}
                      className={`p-2.5 rounded-2xl text-xs font-bold border transition-all ${
                        formData.stepGoal === goal
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {goal.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Virtues */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-left space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Choose Primary Virtue</h2>
              <p className="text-sm text-slate-400">
                Which pillar of character do you wish to cultivate most intentionally right now?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {VIRTUES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryVirtue: v.id })}
                  className={`p-3 rounded-2xl text-left border transition-all flex items-start space-x-2.5 ${
                    formData.primaryVirtue === v.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-neon-emerald'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{v.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{v.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">{v.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-glass hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>{step === 3 ? 'Enter Insaan' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

