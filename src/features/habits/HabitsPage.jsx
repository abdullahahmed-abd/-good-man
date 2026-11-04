import React, { useState, useEffect } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import AddHabitModal from './AddHabitModal';
import { 
  CheckCircle2, 
  Flame, 
  Plus, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  Info,
  Zap,
  RotateCcw
} from 'lucide-react';
import db from '../../db/database';
import { getTodayStr, calculateStreak } from '../../utils/dateUtils';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';

export default function HabitsPage() {
  const { addXp, triggerConfetti } = useAppStore();
  const [habits, setHabits] = useState([]);
  const [logsMap, setLogsMap] = useState(new Map());
  const [streaksMap, setStreaksMap] = useState(new Map());
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedHabitId, setExpandedHabitId] = useState(null);

  const todayStr = getTodayStr();

  // Generate current 7 days (last 6 days + today)
  const currentWeekDays = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    currentWeekDays.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: i === 0
    });
  }

  const loadHabitsData = async () => {
    try {
      const stored = await db.habits.where('archived').notEqual(1).toArray();
      setHabits(stored);

      // Load all habit logs
      const allLogs = await db.habitLogs.toArray();
      const logsByHabit = new Map();
      const streaks = new Map();

      stored.forEach(h => {
        const hLogs = allLogs.filter(l => l.habitId === h.id && l.completed);
        const dates = hLogs.map(l => l.date);
        logsByHabit.set(h.id, new Set(dates));
        streaks.set(h.id, calculateStreak(dates));
      });

      setLogsMap(logsByHabit);
      setStreaksMap(streaks);
    } catch (e) {
      console.warn('Error loading habits:', e);
    }
  };

  useEffect(() => {
    loadHabitsData();
  }, [todayStr]);

  const handleToggleDay = async (habitId, dateStr) => {
    sounds.playTap();
    const habitLogs = logsMap.get(habitId) || new Set();
    const isCompleted = habitLogs.has(dateStr);

    if (isCompleted) {
      const existing = await db.habitLogs
        .where('[habitId+date]')
        .equals([habitId, dateStr])
        .first();
      if (existing) await db.habitLogs.delete(existing.id);
    } else {
      await db.habitLogs.add({
        habitId,
        date: dateStr,
        completed: true,
        value: 1
      });
      sounds.playSuccess();
      addXp(25, 'Maintained habit streak');

      // Check if streak reaches 7 days
      const currentStreak = streaksMap.get(habitId) || 0;
      if (currentStreak + 1 === 7) {
        triggerConfetti();
      }
    }

    loadHabitsData();
  };

  const handleDeleteHabit = async (habitId, e) => {
    e.stopPropagation();
    sounds.playTap();
    await db.habits.update(habitId, { archived: 1 });
    loadHabitsData();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
            <CheckCircle2 className="w-4 h-4" />
            <span>Atomic Habits & Behavioral Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Habit Stacks & Identity
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            "You do not rise to the level of your goals. You fall to the level of your systems." — James Clear
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            setShowAddModal(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-glass flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Design New Habit</span>
        </button>
      </div>

      {/* 2-Minute Rule Banner */}
      <SpatialCard className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-start space-x-3 text-xs">
          <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-amber-300 block">
              The Golden Rule: Never Miss Twice
            </span>
            <p className="text-slate-300 leading-relaxed">
              When fatigue strikes, scale your habit down to the 2-minute rule version. Reading 1 paragraph preserves your identity as a reader. Showing up imperfectly is infinitely better than skipping.
            </p>
          </div>
        </div>
      </SpatialCard>

      {/* Habits List */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const isExpanded = expandedHabitId === habit.id;
          const streak = streaksMap.get(habit.id) || 0;
          const datesSet = logsMap.get(habit.id) || new Set();

          return (
            <SpatialCard
              key={habit.id}
              className="p-5 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: Habit Info */}
                <div 
                  onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                  className="space-y-1.5 cursor-pointer flex-1"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {habit.category}
                    </span>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {streak} Day Streak
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white">
                    {habit.title}
                  </h3>

                  <p className="text-xs text-emerald-400 font-semibold italic">
                    "{habit.identity}"
                  </p>
                </div>

                {/* Right: 7-Day Quick Check-in Circles */}
                <div className="flex items-center space-x-2 self-start sm:self-center">
                  {currentWeekDays.map((day) => {
                    const isChecked = datesSet.has(day.dateStr);
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => handleToggleDay(habit.id, day.dateStr)}
                        className={`w-9 h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-neon-emerald scale-105'
                            : day.isToday
                              ? 'bg-white/10 border-2 border-emerald-500/50 text-slate-300'
                              : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                        title={`${day.dateStr}: ${isChecked ? 'Completed' : 'Pending'}`}
                      >
                        <span className="text-[9px] uppercase font-bold">{day.dayName}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expandable 4 Laws Blueprint */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-xs animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Cue (Obvious)</span>
                      <p className="text-slate-200 mt-1">{habit.cue}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Craving (Attractive)</span>
                      <p className="text-slate-200 mt-1">{habit.craving}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">3. 2-Min Rule (Easy)</span>
                      <p className="text-emerald-400 font-semibold mt-1">{habit.twoMinuteRule}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Reward (Satisfying)</span>
                      <p className="text-slate-200 mt-1">{habit.reward}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={(e) => handleDeleteHabit(habit.id, e)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Archive Habit
                    </button>
                  </div>
                </div>
              )}
            </SpatialCard>
          );
        })}
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onHabitAdded={() => loadHabitsData()}
      />
    </div>
  );
}

