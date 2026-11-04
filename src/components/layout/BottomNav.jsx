import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  BookOpen, 
  Activity, 
  CheckCircle2, 
  Calendar, 
  Wallet, 
  Award, 
  Settings,
  Sparkles
} from 'lucide-react';
import sounds from '../../utils/soundEffects';

const NAV_ITEMS = [
  { to: '/', label: 'Today', icon: Sparkles },
  { to: '/philosophy', label: 'Philosophy', icon: Compass },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/steps', label: 'Steps', icon: Activity },
  { to: '/habits', label: 'Habits', icon: CheckCircle2 },
  { to: '/schedule', label: 'Plan', icon: Calendar },
  { to: '/expenses', label: 'Wealth', icon: Wallet },
  { to: '/character', label: 'Virtues', icon: Award },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const handleNavClick = () => {
    sounds.playTap();
  };

  return (
    <nav className="md:hidden fixed bottom-4 inset-x-3 z-40 max-w-lg mx-auto">
      <div className="spatial-glass rounded-full px-2 py-1.5 shadow-2xl border border-white/15 flex items-center justify-around gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200
                ${isActive 
                  ? 'text-emerald-400 bg-white/10 scale-105' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

