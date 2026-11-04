import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles,
  Compass, 
  BookOpen, 
  Activity, 
  CheckCircle2, 
  Calendar, 
  Wallet, 
  Award, 
  Settings,
  ShieldCheck
} from 'lucide-react';
import sounds from '../../utils/soundEffects';
import PwaInstallButton from '../common/PwaInstallButton';

const SIDEBAR_ITEMS = [
  { to: '/', label: 'Overview', icon: Sparkles, desc: 'Daily Focus & Life Score' },
  { to: '/philosophy', label: 'Philosophy', icon: Compass, desc: 'Stoics & Great Thinkers' },
  { to: '/books', label: 'Books & Summaries', icon: BookOpen, desc: 'Public Domain & Notes' },
  { to: '/steps', label: 'Pedometer Engine', icon: Activity, desc: 'Sensor & Vehicle Rejection' },
  { to: '/habits', label: 'Atomic Habits', icon: CheckCircle2, desc: 'Identity & Routine Stacks' },
  { to: '/schedule', label: 'Schedule & Focus', icon: Calendar, desc: 'Time Blocks & Pomodoro' },
  { to: '/expenses', label: 'Wealth & Budget', icon: Wallet, desc: 'Expenses & Savings Goals' },
  { to: '/character', label: 'Virtues & Mind', icon: Award, desc: 'Stoic Review & Memento Mori' },
  { to: '/account', label: 'Cloud & Account', icon: ShieldCheck, desc: 'Sync, Devices & Security' },
  { to: '/settings', label: 'Settings & Data', icon: Settings, desc: 'Profile & Full DB Backup' },
];

export default function Sidebar() {
  const handleClick = () => {
    sounds.playTap();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 fixed inset-y-0 left-0 z-30 spatial-glass border-r border-white/10 p-5">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 p-[2px] shadow-neon-emerald flex-shrink-0">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-bold text-lg text-emerald-400">
            इ
          </div>
        </div>
        <div>
          <h2 className="font-extrabold text-lg tracking-tight text-white font-classical">INSAAN</h2>
          <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">Self-Mastery System</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleClick}
              className={({ isActive }) => `
                flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-glass-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              <div className="flex flex-col text-left">
                <span className="font-semibold">{item.label}</span>
                <span className="text-[10px] text-slate-400 font-normal leading-tight hidden lg:inline">
                  {item.desc}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Quote Snippet & Install Prompt */}
      <div className="mt-auto pt-4 border-t border-white/10 px-2 space-y-3">
        <PwaInstallButton variant="card" />

        <div className="spatial-glass-subtle rounded-2xl p-3 border border-white/5">
          <p className="text-xs text-slate-300 italic font-serif-book">
            "Waste no more time arguing what a good person should be. Be one."
          </p>
          <span className="text-[10px] text-emerald-400 font-bold block mt-1">
            — Marcus Aurelius
          </span>
        </div>
      </div>
    </aside>
  );
}

