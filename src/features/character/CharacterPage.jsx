import React, { useState, useEffect } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import BreathingExerciseModal from './BreathingExerciseModal';
import VirtueRatingModal from './VirtueRatingModal';
import GratitudeModal from './GratitudeModal';
import MementoMoriView from './MementoMoriView';
import { 
  Award, 
  Sparkles, 
  Wind, 
  Star, 
  Heart, 
  Hourglass, 
  PenTool, 
  Shield, 
  CheckCircle2, 
  Flame,
  Zap
} from 'lucide-react';
import { BADGES, VIRTUES } from '../../db/seedData';
import { getLevelInfo } from '../../utils/lifeScore';
import { useAppStore } from '../../store/useAppStore';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';

export default function CharacterPage() {
  const { user } = useAppStore();
  const [showBreathing, setShowBreathing] = useState(false);
  const [showVirtueModal, setShowVirtueModal] = useState(false);
  const [showGratitudeModal, setShowGratitudeModal] = useState(false);
  const [todayRating, setTodayRating] = useState(null);
  const [journals, setJournals] = useState([]);

  const levelInfo = getLevelInfo(user.totalXp);

  const loadCharacterData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const rating = await db.virtueRatings.where('date').equals(todayStr).first();
      setTodayRating(rating || null);

      const recentJournals = await db.journalEntries.orderBy('createdAt').reverse().limit(6).toArray();
      setJournals(recentJournals);
    } catch (e) {
      console.warn('Error loading character data:', e);
    }
  };

  useEffect(() => {
    loadCharacterData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
            <Award className="w-4 h-4" />
            <span>Character Growth & Spiritual Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Virtues, Mind & Accountability
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            "Waste no more time arguing what a good person should be. Be one." — Marcus Aurelius
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              sounds.playTap();
              setShowBreathing(true);
            }}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Breathing Meditation"
          >
            <Wind className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Breathe</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setShowGratitudeModal(true);
            }}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Gratitude & Kindness Log"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Gratitude</span>
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setShowVirtueModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all hover:brightness-110 active:scale-95"
          >
            <PenTool className="w-4 h-4" />
            <span>Evening Review</span>
          </button>
        </div>
      </div>

      {/* Hero: Level, Title & XP Tier */}
      <SpatialCard className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-[3px] shadow-neon-emerald">
              <div className="w-full h-full rounded-[21px] bg-slate-950 flex items-center justify-center text-4xl">
                {levelInfo.icon}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Level {levelInfo.level} Insaan
              </span>
              <h2 className="text-2xl font-black text-white">{levelInfo.title}</h2>
              <p className="text-xs text-slate-400">
                Total Acquired Wisdom: <span className="text-amber-300 font-bold">{user.totalXp} XP</span>
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-center sm:text-right">
            <span className="text-xs text-slate-400 font-semibold">
              {levelInfo.neededXp} XP to {levelInfo.nextTitle}
            </span>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-[2px]">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${levelInfo.percentToNext}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              {levelInfo.percentToNext}% of Tier Mastered
            </span>
          </div>
        </div>
      </SpatialCard>

      {/* Today's Virtue Ratings Status */}
      <SpatialCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Today's Virtue Standings</span>
            </h3>
            <span className="text-xs text-slate-400">Examined living through moral virtues</span>
          </div>

          <button
            onClick={() => setShowVirtueModal(true)}
            className="text-xs text-amber-400 font-bold hover:underline"
          >
            {todayRating ? 'Update Ratings' : 'Rate Today (+60 XP)'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {VIRTUES.map(v => {
            const score = todayRating ? (todayRating[v.id] || 4) : 4;
            return (
              <div key={v.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                <span className="text-2xl">{v.icon}</span>
                <span className="text-xs font-bold text-white block">{v.name}</span>
                <div className="flex justify-center space-x-0.5 text-amber-400">
                  {Array.from({ length: score }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SpatialCard>

      {/* Memento Mori Visualization */}
      <MementoMoriView />

      {/* Achievements & Milestones Showcase */}
      <SpatialCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Badges of Character & Discipline</span>
            </h3>
            <span className="text-xs text-slate-400">Milestones of self-overcoming</span>
          </div>
          <span className="text-xs text-slate-400">{BADGES.length} Badges Total</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {BADGES.map(badge => (
            <div
              key={badge.id}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                {badge.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                <p className="text-[11px] text-slate-400 leading-tight">{badge.desc}</p>
                <span className="text-[10px] text-amber-400 font-bold block pt-1">+{badge.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </SpatialCard>

      {/* Recent Journal & Reflection Entries */}
      {journals.length > 0 && (
        <SpatialCard className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-emerald-400" />
              <span>Recent Inscribed Reflections</span>
            </h3>
            <span className="text-xs text-slate-400">Offline & private to this device</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {journals.map(entry => (
              <div key={entry.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span className="text-emerald-400">{entry.title}</span>
                  <span>{entry.date}</span>
                </div>
                <p className="text-xs text-slate-300 font-serif-book whitespace-pre-line line-clamp-3">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </SpatialCard>
      )}

      {/* Modals */}
      <BreathingExerciseModal
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
      />

      <VirtueRatingModal
        isOpen={showVirtueModal}
        onClose={() => setShowVirtueModal(false)}
        onSaved={() => loadCharacterData()}
      />

      <GratitudeModal
        isOpen={showGratitudeModal}
        onClose={() => setShowGratitudeModal(false)}
        onSaved={() => loadCharacterData()}
      />
    </div>
  );
}

