import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { BatteryCharging, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import nativeStepService from '../../services/pedometer/nativeStepService';

export default function BatteryOptimizationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('samsung');

  const handleRequestUnrestricted = async () => {
    await nativeStepService.requestIgnoreBatteryOptimization();
  };

  const handleOpenSettings = async () => {
    await nativeStepService.openAppSettings();
  };

  const OEM_GUIDES = {
    samsung: {
      name: 'Samsung',
      steps: [
        'Open Settings → Apps → Insaan.',
        'Tap on "Battery".',
        'Select "Unrestricted" (prevents Android from killing the step service in deep sleep).',
        'In Settings → Battery → Background usage limits: Ensure Insaan is not in "Sleeping apps".'
      ]
    },
    xiaomi: {
      name: 'Xiaomi / MIUI',
      steps: [
        'Open Settings → Apps → Manage apps → Insaan.',
        'Enable "Autostart".',
        'Tap "Battery saver" → select "No restrictions".',
        'In Security app → Boost speed → Settings gear → Lock Insaan in Recent apps.'
      ]
    },
    oneplus: {
      name: 'OnePlus / OxygenOS',
      steps: [
        'Open Settings → Battery → More settings → Optimize battery use.',
        'Locate Insaan and select "Don\'t optimize".',
        'In App info → Battery usage: enable "Allow background activity" and "Allow auto-launch".'
      ]
    },
    oppo: {
      name: 'Oppo / Realme',
      steps: [
        'Open Settings → Battery → App battery management → Insaan.',
        'Enable "Allow background activity" and "Allow auto-launch".',
        'Lock Insaan in the Recent apps switcher to prevent task clearing.'
      ]
    },
    vivo: {
      name: 'Vivo / iQOO',
      steps: [
        'Open Settings → Battery → Background power consumption management.',
        'Find Insaan and select "High background power usage".',
        'In Settings → More settings → Applications → Autostart: Allow Insaan.'
      ]
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keep Steps Running in Background">
      <div className="space-y-4 text-slate-200 text-sm">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Aggressive Android battery savers kill background health services when the screen turns off. Setting battery to <strong>Unrestricted</strong> guarantees zero missed steps.
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRequestUnrestricted}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <BatteryCharging className="w-4 h-4" />
            <span>Request Unrestricted</span>
          </button>
          <button
            onClick={handleOpenSettings}
            className="py-2.5 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>App Settings</span>
          </button>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Manufacturer Specific Guidance
          </h4>

          {/* OEM Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.entries(OEM_GUIDES).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === key
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {data.name}
              </button>
            ))}
          </div>

          {/* Guide Content */}
          <div className="mt-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            {OEM_GUIDES[activeTab].steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-medium transition-all"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}

