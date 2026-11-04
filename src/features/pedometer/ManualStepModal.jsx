import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { usePedometerStore } from '../../store/usePedometerStore';
import sounds from '../../utils/soundEffects';

export default function ManualStepModal({ isOpen, onClose }) {
  const { steps, manualSetSteps } = usePedometerStore();
  const [newCount, setNewCount] = useState(steps);

  const handleSubmit = (e) => {
    e.preventDefault();
    manualSetSteps(Number(newCount) || 0);
    sounds.playSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Step Correction"
      icon="✏️"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-300">
          If you walked without your phone or need to synchronize with a smartwatch, adjust your step count for today:
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Today's Step Count</label>
          <input
            type="number"
            min={0}
            max={100000}
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xl text-center focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass"
          >
            Update Steps
          </button>
        </div>
      </form>
    </Modal>
  );
}

