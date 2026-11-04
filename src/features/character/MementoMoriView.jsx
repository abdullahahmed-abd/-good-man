import React from 'react';
import { Hourglass, Sparkles, AlertCircle } from 'lucide-react';
import SpatialCard from '../../components/common/SpatialCard';
import { useAppStore } from '../../store/useAppStore';

export default function MementoMoriView() {
  const { user } = useAppStore();

  const birthDate = user.birthDate ? new Date(user.birthDate) : new Date('1998-01-01');
  const now = new Date();
  const lifespanYears = user.expectedLifespan || 80;
  const totalWeeks = lifespanYears * 52;

  // Calculate elapsed weeks
  const elapsedMs = now - birthDate;
  const elapsedWeeks = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24 * 7)));
  const remainingWeeks = Math.max(0, totalWeeks - elapsedWeeks);
  const percentLived = Math.min(100, Math.round((elapsedWeeks / totalWeeks) * 100));

  // Compact grouped view: 80 rows (one per year), each year has a visual progress bar or mini dots
  const years = Array.from({ length: lifespanYears }, (_, i) => i + 1);
  const currentAge = Math.floor(elapsedWeeks / 52);

  return (
    <SpatialCard className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Hourglass className="w-4 h-4" />
            <span>Memento Mori — The Cosmic Life Clock</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Your Life in Weeks (80 Years)
          </h3>
          <p className="text-xs text-slate-400">
            "You could leave life right now. Let that determine what you do and say and think." — Marcus Aurelius
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-amber-400">{remainingWeeks.toLocaleString()}</span>
          <span className="text-xs text-slate-400 block font-semibold">Weeks Remaining</span>
        </div>
      </div>

      {/* Progress Bar of Life */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Age {currentAge} ({elapsedWeeks.toLocaleString()} weeks lived)</span>
          <span className="text-amber-400 font-bold">{percentLived}% Completed</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-[2px]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full transition-all duration-700"
            style={{ width: `${percentLived}%` }}
          />
        </div>
      </div>

      {/* Compact Life-in-Weeks Matrix Visualization */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          <span>Decade 1 → 8 (Each block = 1 year of 52 weeks)</span>
          <span className="text-emerald-400 font-bold">Today is Week #{elapsedWeeks}</span>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 p-3 rounded-2xl bg-slate-950/60 border border-white/5 max-h-56 overflow-y-auto">
          {years.map(yr => {
            const isPast = yr <= currentAge;
            const isCurrent = yr === currentAge + 1;
            return (
              <div
                key={yr}
                className={`h-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 shadow-neon-amber scale-110 z-10'
                    : isPast
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : 'bg-white/5 text-slate-600 border border-white/5'
                }`}
                title={`Year ${yr} (${yr * 52} weeks)`}
              >
                {yr}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-400 italic font-serif-book">
        "It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and a sufficiently generous estimate has been given to us for the highest achievements, if it were all well invested." — Seneca
      </div>
    </SpatialCard>
  );
}

