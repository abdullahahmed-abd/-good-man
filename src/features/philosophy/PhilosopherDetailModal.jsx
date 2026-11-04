import React from 'react';
import Modal from '../../components/common/Modal';
import { Clock, BookOpen, Quote, Sparkles, CheckCircle2 } from 'lucide-react';
import SpatialCard from '../../components/common/SpatialCard';
import { useAppStore } from '../../store/useAppStore';

export default function PhilosopherDetailModal({ philosopher, isOpen, onClose }) {
  const addXp = useAppStore(state => state.addXp);

  if (!philosopher) return null;

  const handleExerciseCompleted = (exName) => {
    addXp(30, `Completed philosophy practice: ${exName}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={philosopher.name}
      icon={philosopher.avatar}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-slate-200">
        {/* Header Summary */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span>{philosopher.school}</span>
            <span>·</span>
            <span>{philosopher.era}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {philosopher.bio}
          </p>
        </div>

        {/* Timeline */}
        {philosopher.timeline && philosopher.timeline.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Timeline</span>
            </h4>
            <div className="space-y-2 pl-2 border-l border-white/15">
              {philosopher.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-4">
                  <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-amber-300">{item.year}</span>
                  <p className="text-xs text-slate-300">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Ideas */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Core Philosophical Teachings</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {philosopher.coreIdeas.map((idea, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {idea.title}
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {idea.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Quotes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-blue-400" />
            <span>Timeless Maxims</span>
          </h4>
          <div className="space-y-2">
            {philosopher.quotes.map((q, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 italic font-serif-book text-sm text-slate-300">
                "{q}"
              </div>
            ))}
          </div>
        </div>

        {/* Practical Exercises - How to Apply Today */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>How to Apply Today (Practical Exercises)</span>
          </h4>
          <div className="space-y-2.5">
            {philosopher.exercises.map((ex, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-300">{ex.name}</span>
                  <button
                    onClick={() => handleExerciseCompleted(ex.name)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Practice (+30 XP)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ex.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

