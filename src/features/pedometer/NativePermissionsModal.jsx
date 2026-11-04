import React from 'react';
import Modal from '../../components/common/Modal';
import { Footprints, Bell, ShieldCheck, ArrowRight } from 'lucide-react';
import nativeStepService from '../../services/pedometer/nativeStepService';

export default function NativePermissionsModal({ isOpen, onClose, onGranted }) {
  const handleRequest = async () => {
    try {
      await nativeStepService.requestPermissions();
      const status = await nativeStepService.checkPermissions();
      if (status.allGranted && onGranted) {
        onGranted();
      }
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sensor & Notification Access">
      <div className="space-y-4 text-slate-200 text-sm">
        <p className="text-slate-300">
          To count steps accurately in the background without draining your battery, Insaan requires two Android permissions:
        </p>

        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Physical Activity</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Accesses the hardware step counter chip and activity recognition for vehicle rejection.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Notifications</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Displays the persistent health notification bar with live steps, km, calories, and goal progress.
            </p>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium transition-all"
          >
            Not Now
          </button>
          <button
            onClick={handleRequest}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>Grant Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
