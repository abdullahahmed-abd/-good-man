import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Target, Check } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';

export default function AddSavingsGoalModal({ isOpen, onClose, onGoalAdded }) {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    try {
      const goal = {
        id: `goal-${Date.now()}`,
        title: title.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount) || 0,
        targetDate,
        color: '#10b981',
        createdAt: Date.now()
      };

      await db.savingsGoals.add(goal);
      sounds.playSuccess();
      if (onGoalAdded) onGoalAdded(goal);
      onClose();
    } catch (err) {
      console.warn('Error saving goal:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Savings / Noble Goal"
      icon="🎯"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Purpose *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Emergency Peace Fund, Library Books Fund"
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Amount *</label>
            <input
              type="number"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="50000"
              className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Already Saved</label>
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="10000"
              className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Inscribe Goal</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

