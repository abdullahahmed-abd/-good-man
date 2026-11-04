import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Plus, Check, Zap, Sparkles } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';

const CATEGORIES = ['Wisdom', 'Health', 'Discipline', 'Focus', 'Kindness'];

export default function AddHabitModal({ isOpen, onClose, onHabitAdded }) {
  const addXp = useAppStore(state => state.addXp);
  const [title, setTitle] = useState('');
  const [identity, setIdentity] = useState('');
  const [cue, setCue] = useState('');
  const [craving, setCraving] = useState('');
  const [response, setResponse] = useState('');
  const [reward, setReward] = useState('');
  const [twoMinuteRule, setTwoMinuteRule] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newHabit = {
        id: `habit-${Date.now()}`,
        title: title.trim(),
        identity: identity.trim() || 'I am a person of excellence',
        cue: cue.trim() || 'Morning awakening',
        craving: craving.trim() || 'Mental clarity',
        response: response.trim() || title.trim(),
        reward: reward.trim() || 'Inner serenity',
        twoMinuteRule: twoMinuteRule.trim() || 'Show up for 2 minutes',
        category,
        frequency: 'daily',
        targetDaysPerWeek: 7,
        createdAt: Date.now(),
        archived: 0
      };

      await db.habits.add(newHabit);
      sounds.playSuccess();
      addXp(30, 'Forged new Atomic Habit');
      if (onHabitAdded) onHabitAdded(newHabit);
      onClose();
    } catch (err) {
      console.warn('Error saving habit:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Design New Atomic Habit"
      icon="⚡"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Habit Behavior *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read 10 pages of Stoic philosophy"
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Identity Statement */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
            Identity Statement (Who does this habit make you?)
          </label>
          <input
            type="text"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="e.g. I am a lifelong student of wisdom"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* The 4 Laws Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              1. The Cue (Make it obvious)
            </label>
            <input
              type="text"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="e.g. After my morning coffee"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              2. The Craving (Make it attractive)
            </label>
            <input
              type="text"
              value={craving}
              onChange={(e) => setCraving(e.target.value)}
              placeholder="e.g. Feeling grounded & prepared"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              3. The 2-Minute Rule Version (Make it easy)
            </label>
            <input
              type="text"
              value={twoMinuteRule}
              onChange={(e) => setTwoMinuteRule(e.target.value)}
              placeholder="e.g. Open the book & read 1 paragraph"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              4. The Reward (Make it satisfying)
            </label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="e.g. Check the box & enjoy calm"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Forge Identity Habit</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

