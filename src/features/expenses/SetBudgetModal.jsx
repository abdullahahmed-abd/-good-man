import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Check } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';

const CATEGORIES = [
  'Philosophy & Books',
  'Health & Fitness',
  'Food & Groceries',
  'Rent & Home',
  'Travel & Commute',
  'Charity & Generosity',
  'Investment & Savings',
  'Other Living'
];

export default function SetBudgetModal({ isOpen, onClose, onBudgetsUpdated }) {
  const [budgets, setBudgets] = useState({
    'Philosophy & Books': 2000,
    'Health & Fitness': 3000,
    'Food & Groceries': 10000,
    'Rent & Home': 18000,
    'Travel & Commute': 4000,
    'Charity & Generosity': 2500,
    'Investment & Savings': 15000,
    'Other Living': 3000
  });

  const handleChange = (cat, val) => {
    setBudgets({ ...budgets, [cat]: Number(val) || 0 });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      for (const [cat, limit] of Object.entries(budgets)) {
        await db.budgets.put({ category: cat, monthlyLimit: limit });
      }
      sounds.playSuccess();
      if (onBudgetsUpdated) onBudgetsUpdated();
      onClose();
    } catch (err) {
      console.warn('Error saving budgets:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monthly Category Budgets"
      icon="📊"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-3">
        <p className="text-xs text-slate-300">
          Set disciplined ceilings for each category to maintain financial serenity.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {CATEGORIES.map(cat => (
            <div key={cat} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs font-semibold text-slate-300 truncate">{cat}</span>
              <input
                type="number"
                value={budgets[cat] || 0}
                onChange={(e) => handleChange(cat, e.target.value)}
                className="w-28 px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white font-bold text-xs text-right focus:outline-none focus:border-emerald-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Budgets</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

