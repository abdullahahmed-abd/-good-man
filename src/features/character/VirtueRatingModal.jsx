import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Star, Check, Award, Shield } from 'lucide-react';
import { VIRTUES } from '../../db/seedData';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { getTodayStr } from '../../utils/dateUtils';
import { useAppStore } from '../../store/useAppStore';

export default function VirtueRatingModal({ isOpen, onClose, onSaved }) {
  const addXp = useAppStore(state => state.addXp);
  const [ratings, setRatings] = useState({
    wisdom: 4,
    discipline: 4,
    courage: 3,
    kindness: 5,
    gratitude: 4,
    humility: 4
  });

  const [eveningReview, setEveningReview] = useState({
    well: '',
    faltered: '',
    improve: ''
  });

  const handleRatingChange = (virtueId, val) => {
    sounds.playTap();
    setRatings({ ...ratings, [virtueId]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const todayStr = getTodayStr();

    try {
      // Save virtue ratings
      await db.virtueRatings.put({
        id: `virtue-${todayStr}`,
        date: todayStr,
        ...ratings,
        reflection: eveningReview.well || 'Evening examination complete',
        timestamp: Date.now()
      });

      // Save Evening Review Journal entry
      if (eveningReview.well || eveningReview.faltered || eveningReview.improve) {
        await db.journalEntries.add({
          id: `review-${Date.now()}`,
          date: todayStr,
          type: 'evening_review',
          title: 'Stoic Evening Examination',
          content: `1. What I did well:\n${eveningReview.well}\n\n2. Where I faltered:\n${eveningReview.faltered}\n\n3. How to improve tomorrow:\n${eveningReview.improve}`,
          createdAt: Date.now()
        });
      }

      sounds.playSuccess();
      addXp(60, 'Completed Daily Virtue Examination & Evening Review');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.warn('Error saving virtue rating:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Virtue Rating & Stoic Evening Review"
      icon="🏛️"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSave} className="space-y-6 text-slate-200">
        {/* 6 Virtues Rating Row */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Rate Your Actions Today (1 to 5 Stars)
          </h4>

          <div className="space-y-2.5">
            {VIRTUES.map(v => (
              <div key={v.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">{v.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{v.name}</span>
                    <span className="text-[10px] text-slate-400">{v.desc}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(v.id, star)}
                      className="p-1 rounded-md transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= (ratings[v.id] || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stoic Evening Review 3 Prompts */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stoic Evening Accounting (Seneca's Review)
          </h4>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                1. What did you do with honor and wisdom today?
              </label>
              <input
                type="text"
                value={eveningReview.well}
                onChange={(e) => setEveningReview({ ...eveningReview, well: e.target.value })}
                placeholder="Where did you exercise patience, honesty or kindness?"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                2. Where did you falter or act out of pettiness / impulse?
              </label>
              <input
                type="text"
                value={eveningReview.faltered}
                onChange={(e) => setEveningReview({ ...eveningReview, faltered: e.target.value })}
                placeholder="Acknowledge it plainly without self-hate..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                3. How will you respond with greater integrity tomorrow?
              </label>
              <input
                type="text"
                value={eveningReview.improve}
                onChange={(e) => setEveningReview({ ...eveningReview, improve: e.target.value })}
                placeholder="Specific adjustments for tomorrow's challenges..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Record Evening Review (+60 XP)</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

