import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { PenTool, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import db from '../../db/database';
import { getTodayStr } from '../../utils/dateUtils';
import sounds from '../../utils/soundEffects';

export default function DailyReflectionModal({ reflection, isOpen, onClose }) {
  const addXp = useAppStore(state => state.addXp);
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  if (!reflection) return null;

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      const todayStr = getTodayStr();
      await db.journalEntries.add({
        id: `refl-${Date.now()}`,
        date: todayStr,
        type: 'daily_reflection',
        title: `Reflection on ${reflection.virtue || 'Virtue'}`,
        content: content.trim(),
        prompt: reflection.prompt,
        createdAt: Date.now()
      });

      sounds.playSuccess();
      addXp(50, 'Completed Daily Philosophy Reflection');
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setContent('');
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Error saving reflection:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Philosophy Reflection"
      icon="🕯️"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Prompt Card */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
            Prompt by {reflection.philosopher} · Focus: {reflection.virtue}
          </span>
          <p className="text-sm font-semibold text-white leading-relaxed font-serif-book">
            "{reflection.prompt}"
          </p>
        </div>

        {/* Text Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Your Journal Response</label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Examine your actions today with rigorous honesty and gentle compassion..."
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={!content.trim() || saved}
            className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-glass flex items-center space-x-2 transition-all ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Journal Inscribed (+50 XP)</span>
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                <span>Commit to Inner Citadel (+50 XP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

