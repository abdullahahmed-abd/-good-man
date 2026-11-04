import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { Footprints, Check, AlertCircle, RefreshCw } from 'lucide-react';
import pedometerEngine from '../../services/pedometer/pedometerEngine';
import { usePedometerStore } from '../../store/usePedometerStore';
import { useAppStore } from '../../store/useAppStore';
import sounds from '../../utils/soundEffects';

export default function CalibrationModal({ isOpen, onClose }) {
  const { user, updateUserProfile } = useAppStore();
  const setUserHeight = usePedometerStore(state => state.setUserHeight);

  const [calibrating, setCalibrating] = useState(false);
  const [stepsCounted, setStepsCounted] = useState(0);
  const [heightCm, setHeightCm] = useState(user.heightCm || 175);
  const [calibrationDone, setCalibrationDone] = useState(false);
  const [calibResult, setCalibResult] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setCalibrating(false);
      setCalibrationDone(false);
      pedometerEngine.calibrationMode = false;
    }
  }, [isOpen]);

  const handleStartCalibration = async () => {
    sounds.playTap();
    await pedometerEngine.start();
    pedometerEngine.startCalibration(20);
    setCalibrating(true);
    setStepsCounted(0);

    const unsub = pedometerEngine.subscribe((snapshot) => {
      setStepsCounted(pedometerEngine.calibrationStepsCounted);
      if (pedometerEngine.calibrationStepsCounted >= 20) {
        const res = pedometerEngine.finishCalibration();
        setCalibResult(res);
        setCalibrationDone(true);
        setCalibrating(false);
        sounds.playSuccess();
        unsub();
      }
    });
  };

  const handleSaveHeight = () => {
    setUserHeight(heightCm);
    updateUserProfile({ heightCm });
    sounds.playSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pedometer Calibration & Stride Tuning"
      icon="👟"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 text-slate-200">
        {/* Height & Stride calculation */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Step 1: Calibrate Stride from Height
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your biological stride length is calculated based on height using biomechanical standards (stride = height × 0.414).
          </p>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-32 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-slate-400">cm</span>
            <span className="text-xs font-bold text-emerald-400">
              = ~{((heightCm * 0.414) / 100).toFixed(2)} meters per stride
            </span>
          </div>
        </div>

        {/* 20-Step Live Calibration */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Step 2: Walk 20 Steps (Adaptive Sensitivity)
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Walk 20 natural steps with your phone in hand or pocket. The engine learns your impact force to filter out bumps.
          </p>

          {!calibrating && !calibrationDone && (
            <button
              onClick={handleStartCalibration}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center justify-center space-x-2 transition-all"
            >
              <Footprints className="w-4 h-4" />
              <span>Begin 20-Step Calibration Walk</span>
            </button>
          )}

          {calibrating && (
            <div className="text-center py-4 space-y-2">
              <div className="text-3xl font-black text-amber-300 animate-pulse">
                {stepsCounted} / 20 Steps
              </div>
              <p className="text-xs text-slate-400">
                Keep walking smoothly until the target is reached...
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${(stepsCounted / 20) * 100}%` }}
                />
              </div>
            </div>
          )}

          {calibrationDone && calibResult && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Calibration Complete!
              </span>
              <p>User sensitivity tuned: factor {calibResult.sensitivityFactor}x</p>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveHeight}
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass"
          >
            Apply & Save Configuration
          </button>
        </div>
      </div>
    </Modal>
  );
}

