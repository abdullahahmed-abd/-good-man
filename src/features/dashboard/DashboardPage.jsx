import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles, 
  Activity, 
  BookOpen, 
  CheckCircle2, 
  Compass, 
  Award, 
  ChevronRight, 
  Play, 
  Pause, 
  Flame, 
  TrendingUp, 
  Calendar,
  Zap,
  PenTool
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar 
} from 'recharts';
import SpatialCard from '../../components/common/SpatialCard';
import ProgressRing from '../../components/common/ProgressRing';
import { useAppStore } from '../../store/useAppStore';
import { usePedometerStore } from '../../store/usePedometerStore';
import { calculateLifeScore, calculateCharacterRadar, getLevelInfo } from '../../utils/lifeScore';
import { DAILY_QUOTES, PHILOSOPHY_CONCEPTS } from '../../db/seedData';
import { getTodayStr, generatePastDays } from '../../utils/dateUtils';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';

export default function DashboardPage() {
  const { user, addXp } = useAppStore();
  const { steps, isRunning, toggleEngine, motionState, calories, distanceKm, activeMinutes } = usePedometerStore();

  const [habits, setHabits] = useState([]);
  const [completedHabitIds, setCompletedHabitIds] = useState(new Set());
  const [tasks, setTasks] = useState([]);
  const [dailyQuote, setDailyQuote] = useState(DAILY_QUOTES[0]);
  const [todayReflectionDone, setTodayReflectionDone] = useState(false);
  const [pastHeatmapData, setPastHeatmapData] = useState([]);
  const todayStr = getTodayStr();

  // Load dashboard data from Dexie
  useEffect(() => {
    async function loadData() {
      try {
        // Daily quote based on day of year
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        setDailyQuote(DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]);

        // Load active habits
        const storedHabits = await db.habits.where('archived').notEqual(1).toArray();
        if (storedHabits.length === 0) {
          // Add default starter atomic habits if empty
          const starterHabits = [
            {
              id: 'habit-read',
              title: 'Read 5 pages of philosophy',
              identity: 'I am a wise seeker of truth',
              cue: 'After morning coffee',
              craving: 'Clarity of mind',
              response: 'Read at least 5 pages in Insaan',
              reward: 'Inner tranquility',
              twoMinuteRule: 'Open the book and read 1 paragraph',
              category: 'Wisdom',
              frequency: 'daily',
              createdAt: Date.now()
            },
            {
              id: 'habit-walk',
              title: 'Walk 8,000 mindful steps',
              identity: 'I am an energized and resilient person',
              cue: 'Leaving the desk or after lunch',
              craving: 'Physical vitality',
              response: 'Walk outside without phone distractions',
              reward: 'Clear thoughts and restful sleep',
              twoMinuteRule: 'Lace up walking shoes and step outside',
              category: 'Health',
              frequency: 'daily',
              createdAt: Date.now()
            },
            {
              id: 'habit-review',
              title: 'Evening Stoic review',
              identity: 'I am an examined, accountable soul',
              cue: 'Before lying down to sleep',
              craving: 'Self-governance',
              response: 'Write 3 lines in the evening journal',
              reward: 'Peaceful conscience',
              twoMinuteRule: 'Write 1 sentence: what did I do well?',
              category: 'Discipline',
              frequency: 'daily',
              createdAt: Date.now()
            }
          ];
          for (const h of starterHabits) {
            await db.habits.put(h);
          }
          setHabits(starterHabits);
        } else {
          setHabits(storedHabits);
        }

        // Today's completed habit logs
        const todayLogs = await db.habitLogs.where('date').equals(todayStr).toArray();
        setCompletedHabitIds(new Set(todayLogs.filter(l => l.completed).map(l => l.habitId)));

        // Today's tasks
        const todayTasks = await db.scheduleTasks.where('date').equals(todayStr).toArray();
        setTasks(todayTasks);

        // Check journal entries
        const journals = await db.journalEntries.where('date').equals(todayStr).toArray();
        setTodayReflectionDone(journals.length > 0);

        // Generate activity heatmap from past days
        const pastDays = generatePastDays(70);
        const allSteps = await db.steps.toArray();
        const stepMap = new Map(allSteps.map(s => [s.date, s.steps]));

        const heatmap = pastDays.map(date => {
          const stepVal = stepMap.get(date) || 0;
          let intensity = 0;
          if (stepVal > 9000) intensity = 4;
          else if (stepVal > 6000) intensity = 3;
          else if (stepVal > 3000) intensity = 2;
          else if (stepVal > 500) intensity = 1;
          return { date, steps: stepVal, intensity };
        });
        setPastHeatmapData(heatmap);

      } catch (err) {
        console.warn('Dashboard data load note:', err);
      }
    }
    loadData();
  }, [todayStr]);

  // Toggle habit completion
  const handleToggleHabit = async (habitId) => {
    sounds.playTap();
    const isCompleted = completedHabitIds.has(habitId);
    const updated = new Set(completedHabitIds);

    if (isCompleted) {
      updated.delete(habitId);
      const log = await db.habitLogs.where('[habitId+date]').equals([habitId, todayStr]).first();
      if (log) await db.habitLogs.delete(log.id);
    } else {
      updated.add(habitId);
      await db.habitLogs.add({ habitId, date: todayStr, completed: true, value: 1 });
      sounds.playSuccess();
      addXp(25, 'Habit completed');
    }
    setCompletedHabitIds(updated);
  };

  const completedCount = completedHabitIds.size;
  const totalHabits = habits.length;

  const lifeScore = calculateLifeScore({
    steps,
    stepGoal: user.stepGoal,
    habitsCompleted: completedCount,
    habitsTotal: totalHabits,
    tasksCompleted: tasks.filter(t => t.isCompleted).length,
    tasksTotal: tasks.length,
    hasJournaledToday: todayReflectionDone,
    hasReadToday: true,
    virtueRatingAvg: 4.2
  });

  const radarData = calculateCharacterRadar({
    booksReadCount: 2,
    readingMinutes: 35,
    habitsStreak: 5,
    completedTasks: tasks.filter(t => t.isCompleted).length,
    steps,
    stepGoal: user.stepGoal,
    budgetAdherencePercent: 88,
    kindnessDeedsCount: 2,
    pomodoroMinutes: 45
  });

  const levelInfo = getLevelInfo(user.totalXp);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero: Character Life Score & Radar Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Spatial Score Card */}
        <SpatialCard className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{levelInfo.icon}</span>
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                  Character Growth
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {levelInfo.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Level {levelInfo.level} · {levelInfo.neededXp} XP until {levelInfo.nextTitle}
              </p>
            </div>

            {/* Life Score Circular Ring */}
            <ProgressRing
              progress={lifeScore}
              size={110}
              strokeWidth={10}
              strokeColor="#10b981"
              trackColor="rgba(255, 255, 255, 0.08)"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">{lifeScore}</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Life Score</span>
              </div>
            </ProgressRing>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Overall Integrity & Discipline</span>
              <span className="text-emerald-400 font-bold">{lifeScore}% Harmonized</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${lifeScore}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-center">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-400">Habits</span>
              <p className="text-base font-bold text-white">
                {completedCount}/{totalHabits}
              </p>
            </div>
            <div className="space-y-0.5 border-x border-white/10">
              <span className="text-xs text-slate-400">Steps</span>
              <p className="text-base font-bold text-emerald-300">
                {steps.toLocaleString()}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-slate-400">Daily Review</span>
              <p className="text-base font-bold text-amber-300">
                {todayReflectionDone ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>
        </SpatialCard>

        {/* Right: 6-Dimension Radar Chart */}
        <SpatialCard className="lg:col-span-5 flex flex-col justify-between" glassStyle="subtle">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Soul Matrix</span>
            </h3>
            <span className="text-[11px] text-slate-400">6 Pillars</span>
          </div>

          <div className="w-full h-[210px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                />
                <Radar
                  name="Character"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center pt-2">
            <NavLink
              to="/character"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1"
            >
              <span>Explore Virtues & Stoic Practices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </SpatialCard>
      </div>

      {/* Daily Philosophy Quote Banner */}
      <SpatialCard className="bg-gradient-to-r from-amber-950/30 to-stone-900/40 border border-amber-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Daily Stoic Wisdom
              </span>
            </div>
            <p className="text-base sm:text-lg font-serif-book italic text-slate-100">
              "{dailyQuote.text}"
            </p>
            <p className="text-xs text-slate-400 font-semibold">
              — {dailyQuote.author}, <span className="italic">{dailyQuote.source}</span>
            </p>
          </div>

          <NavLink
            to="/philosophy"
            className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center space-x-1.5"
          >
            <span>Open Library</span>
            <ChevronRight className="w-4 h-4" />
          </NavLink>
        </div>
      </SpatialCard>

      {/* Two Column Grid: Live Pedometer Widget + Daily Atomic Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Live Step Counter Widget */}
        <SpatialCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Pedometer Engine</h3>
                <span className="text-[11px] text-slate-400">Sensor & Vehicle Rejection</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                motionState === 'VEHICLE' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : isRunning 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-white/10 text-slate-400 border-white/15'
              }`}>
                {motionState}
              </span>

              <button
                onClick={toggleEngine}
                className={`p-2 rounded-xl transition-all ${
                  isRunning 
                    ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
                title={isRunning ? 'Pause Engine' : 'Start Step Engine'}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <span className="text-4xl font-black text-white tracking-tight">
                {steps.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 ml-2">/ {user.stepGoal.toLocaleString()} goal</span>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">{distanceKm} km</span> · {calories} kcal
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (steps / user.stepGoal) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-1 text-xs">
            <span className="text-slate-400">Active: {activeMinutes} mins</span>
            <NavLink to="/steps" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
              <span>View Diagnostics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </SpatialCard>

        {/* Daily Atomic Habits Quick Row */}
        <SpatialCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Atomic Habits</h3>
                <span className="text-[11px] text-slate-400">Identity-based check-ins</span>
              </div>
            </div>

            <NavLink to="/habits" className="text-xs text-amber-400 font-bold hover:underline">
              Manage
            </NavLink>
          </div>

          <div className="space-y-2 pt-1">
            {habits.slice(0, 3).map((habit) => {
              const isDone = completedHabitIds.has(habit.id);
              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isDone
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-slate-200'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                      {habit.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    {habit.category}
                  </span>
                </div>
              );
            })}
          </div>
        </SpatialCard>
      </div>

      {/* Activity Heatmap (GitHub style) */}
      <SpatialCard className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Discipline Heatmap (Past 70 Days)</h3>
          </div>
          <span className="text-xs text-slate-400">Consistency creates character</span>
        </div>

        <div className="pt-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 min-w-[500px]">
            {pastHeatmapData.map((day, idx) => {
              let colorClass = 'bg-white/10';
              if (day.intensity === 1) colorClass = 'bg-emerald-950/80 border border-emerald-800/40';
              if (day.intensity === 2) colorClass = 'bg-emerald-700/80';
              if (day.intensity === 3) colorClass = 'bg-emerald-500';
              if (day.intensity === 4) colorClass = 'bg-emerald-400 shadow-neon-emerald';

              return (
                <div
                  key={day.date}
                  className={`w-3.5 h-3.5 rounded-md ${colorClass} transition-all hover:scale-125 cursor-pointer`}
                  title={`${day.date}: ${day.steps} steps`}
                />
              );
            })}
          </div>
        </div>
      </SpatialCard>
    </div>
  );
}

