import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Plus, Check } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { getTodayStr } from '../../utils/dateUtils';
import { useAppStore } from '../../store/useAppStore';

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

export default function AddTransactionModal({ isOpen, onClose, onTransactionAdded }) {
  const { user, addXp } = useAppStore();
  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI / Digital');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayStr());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    try {
      const tx = {
        id: `tx-${Date.now()}`,
        type,
        amount: numericAmount,
        category,
        paymentMethod,
        note: note.trim() || category,
        date,
        createdAt: Date.now()
      };

      await db.transactions.add(tx);
      sounds.playSuccess();
      addXp(15, 'Recorded financial discipline log');
      if (onTransactionAdded) onTransactionAdded(tx);
      onClose();
    } catch (err) {
      console.warn('Failed saving transaction:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
      icon="💰"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Amount ({user.currency || 'INR'}) *
          </label>
          <input
            type="number"
            required
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-extrabold text-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="UPI / Digital" className="bg-slate-900">UPI / Digital</option>
              <option value="Card" className="bg-slate-900">Card</option>
              <option value="Cash" className="bg-slate-900">Cash</option>
              <option value="Bank Transfer" className="bg-slate-900">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Date & Note */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Meditations paperback"
              className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

