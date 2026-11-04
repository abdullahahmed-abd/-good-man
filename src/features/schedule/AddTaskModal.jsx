import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Plus, Check } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { getTodayStr } from '../../utils/dateUtils';
import { useAppStore } from '../../store/useAppStore';

const CATEGORIES = [
  'Study & Philosophy',
  'Prayer / Meditation',
  'Workout & Health',
  'Work & Deep Work',
  'Service & Kindness',
  'Family & Rest'
];

export default function AddTaskModal({ isOpen, onClose, onTaskAdded }) {
  const addXp = useAppStore(state => state.addXp);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:00');
  const [priority, setPriority] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newTask = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        category,
        startTime,
        endTime,
        priority,
        isRecurring,
        isCompleted: false,
        date: getTodayStr(),
        createdAt: Date.now()
      };

      await db.scheduleTasks.add(newTask);
      sounds.playSuccess();
      addXp(15, 'Scheduled a conscious discipline block');
      if (onTaskAdded) onTaskAdded(newTask);
      onClose();
    } catch (err) {
      console.warn('Failed adding task:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Time Block"
      icon="📅"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Meditations, Outdoor Run, Coding"
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded text-emerald-500 focus:ring-emerald-500"
          />
          <label htmlFor="recurring" className="text-xs text-slate-300">
            Repeat daily routine
          </label>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Inscribe Block</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

