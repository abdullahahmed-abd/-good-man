import React, { useState, useEffect } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import PomodoroModal from './PomodoroModal';
import AddTaskModal from './AddTaskModal';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Flame, 
  Sparkles,
  Zap,
  Timer
} from 'lucide-react';
import db from '../../db/database';
import { getTodayStr } from '../../utils/dateUtils';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';

export default function SchedulePage() {
  const addXp = useAppStore(state => state.addXp);
  const [tasks, setTasks] = useState([]);
  const [pomodoroMinsToday, setPomodoroMinsToday] = useState(0);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const todayStr = getTodayStr();

  const loadScheduleData = async () => {
    try {
      let storedTasks = await db.scheduleTasks.where('date').equals(todayStr).toArray();
      if (storedTasks.length === 0) {
        // Preload default schedule if empty
        const defaultBlocks = [
          {
            id: 'block-1',
            title: 'Morning Silence & Philosophy Reading',
            category: 'Study & Philosophy',
            startTime: '06:30',
            endTime: '07:15',
            priority: 'high',
            isCompleted: true,
            date: todayStr
          },
          {
            id: 'block-2',
            title: 'Mindful Walk & Physical Calibration',
            category: 'Workout & Health',
            startTime: '07:30',
            endTime: '08:15',
            priority: 'medium',
            isCompleted: false,
            date: todayStr
          },
          {
            id: 'block-3',
            title: 'Uninterrupted Deep Work Sprint',
            category: 'Work & Deep Work',
            startTime: '09:00',
            endTime: '11:30',
            priority: 'high',
            isCompleted: false,
            date: todayStr
          },
          {
            id: 'block-4',
            title: 'Evening Stoic Review & Gratitude Journal',
            category: 'Prayer / Meditation',
            startTime: '21:30',
            endTime: '22:00',
            priority: 'medium',
            isCompleted: false,
            date: todayStr
          }
        ];
        for (const b of defaultBlocks) {
          await db.scheduleTasks.add(b);
        }
        storedTasks = defaultBlocks;
      }

      storedTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setTasks(storedTasks);

      // Load today's pomodoro focus minutes
      const sessions = await db.pomodoroSessions.where('date').equals(todayStr).toArray();
      const totalMins = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      setPomodoroMinsToday(totalMins);
    } catch (e) {
      console.warn('Error loading schedule:', e);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [todayStr]);

  const handleToggleTask = async (task) => {
    sounds.playTap();
    const updatedStatus = !task.isCompleted;
    await db.scheduleTasks.update(task.id, { isCompleted: updatedStatus });
    if (updatedStatus) {
      sounds.playSuccess();
      addXp(20, 'Completed scheduled discipline block');
    }
    loadScheduleData();
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    sounds.playTap();
    await db.scheduleTasks.delete(taskId);
    loadScheduleData();
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const percentComplete = Math.round((completedCount / (tasks.length || 1)) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Focus Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
            <Calendar className="w-4 h-4" />
            <span>Time-Blocking & Intentional Routine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Schedule & Deep Focus
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            "Lay hold of today's task, and you will not need to depend so much on tomorrow." — Seneca
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              sounds.playTap();
              setShowPomodoro(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Timer className="w-4 h-4" />
            <span>Pomodoro Focus</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setShowAddTask(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Block</span>
          </button>
        </div>
      </div>

      {/* Focus & Completion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SpatialCard className="p-4 flex items-center justify-between" glassStyle="subtle">
          <div>
            <span className="text-xs text-slate-400">Scheduled Blocks</span>
            <p className="text-xl font-black text-white mt-0.5">
              {completedCount} / {tasks.length} Done
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400">{percentComplete}%</span>
        </SpatialCard>

        <SpatialCard className="p-4 flex items-center justify-between" glassStyle="subtle">
          <div>
            <span className="text-xs text-slate-400">Deep Work Today</span>
            <p className="text-xl font-black text-amber-300 mt-0.5">
              {pomodoroMinsToday} Mins
            </p>
          </div>
          <Zap className="w-5 h-5 text-amber-400" />
        </SpatialCard>

        <SpatialCard className="p-4 flex items-center justify-between" glassStyle="subtle">
          <div>
            <span className="text-xs text-slate-400">Discipline Level</span>
            <p className="text-xl font-black text-blue-400 mt-0.5">
              {percentComplete >= 75 ? 'Master' : 'Active'}
            </p>
          </div>
          <Flame className="w-5 h-5 text-blue-400" />
        </SpatialCard>
      </div>

      {/* Timeline View of Scheduled Blocks */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Today's Chronological Time Blocks</span>
        </h3>

        <div className="space-y-3">
          {tasks.map((task) => {
            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  task.isCompleted
                    ? 'spatial-glass-subtle opacity-75 border-white/5'
                    : 'spatial-glass border-white/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all ${
                      task.isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-transparent hover:border-emerald-400'
                    }`}
                  >
                    {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-emerald-400">{task.startTime} – {task.endTime}</span>
                      <span>·</span>
                      <span>{task.category}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <PomodoroModal
        isOpen={showPomodoro}
        onClose={() => {
          setShowPomodoro(false);
          loadScheduleData();
        }}
      />

      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskAdded={() => loadScheduleData()}
      />
    </div>
  );
}

