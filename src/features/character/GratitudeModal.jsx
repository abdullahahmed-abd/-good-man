import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Heart, Check, Sun, Sparkles } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { getTodayStr } from '../../utils/dateUtils';
import { useAppStore } from '../../store/useAppStore';

export default function GratitudeModal({ isOpen, onClose, onSaved }) {
  const addXp = useAppStore(state => state.addXp);
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [goodDeed, setGoodDeed] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    const todayStr = getTodayStr();

    try {
      const items = [gratitude1, gratitude2, gratitude3].filter(Boolean);
      if (items.length > 0) {
        await db.journalEntries.add({
          id: `gratitude-${Date.now()}`,
          date: todayStr,
          type: 'gratitude',
          title: 'Morning Gratitude & Reverence',
          content: items.map((g, i) => `${i + 1}. ${g}`).join('\n'),
          createdAt: Date.now()
        });
      }

      if (goodDeed.trim()) {
        await db.journalEntries.add({
          id: `kindness-${Date.now()}`,
          date: todayStr,
          type: 'kindness',
          title: 'Good Deed of the Day',
          content: goodDeed.trim(),
          createdAt: Date.now()
        });
      }

      sounds.playSuccess();
      addXp(40, 'Logged Gratitude & Good Deed');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.warn('Error saving gratitude:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gratitude & Kindness Log"
      icon="🌱"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4 text-slate-200">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sun className="w-4 h-4" />
            <span>3 Things You Revere Today</span>
          </label>
          <input
            type="text"
            value={gratitude1}
            onChange={(e) => setGratitude1(e.target.value)}
            placeholder="1. The morning light, a warm drink, good health..."
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={gratitude2}
            onChange={(e) => setGratitude2(e.target.value)}
            placeholder="2. A kind word from a friend or stranger..."
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={gratitude3}
            onChange={(e) => setGratitude3(e.target.value)}
            placeholder="3. The freedom to choose my thoughts today..."
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="block text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span>Good Deed of the Day (Kindness Challenge)</span>
          </label>
          <textarea
            rows={3}
            value={goodDeed}
            onChange={(e) => setGoodDeed(e.target.value)}
            placeholder="What act of selfless service, encouragement, or generosity did you perform today?"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Inscribe Gratitude (+40 XP)</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

