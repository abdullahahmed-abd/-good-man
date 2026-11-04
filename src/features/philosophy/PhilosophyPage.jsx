import React, { useState } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import PhilosopherDetailModal from './PhilosopherDetailModal';
import DailyReflectionModal from './DailyReflectionModal';
import { 
  PHILOSOPHERS, 
  PHILOSOPHY_CONCEPTS, 
  DAILY_REFLECTIONS 
} from '../../db/seedData';
import { Compass, BookOpen, Sparkles, Search, ChevronRight, PenTool } from 'lucide-react';
import sounds from '../../utils/soundEffects';

const SCHOOL_FILTERS = ['All', 'Stoicism', 'Classical Greek', 'Existentialism', 'Deontology / Enlightenment', 'Epicureanism'];

export default function PhilosophyPage() {
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhilosopher, setActivePhilosopher] = useState(null);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [expandedConceptId, setExpandedConceptId] = useState(null);

  // Daily reflection selection
  const dailyReflection = DAILY_REFLECTIONS[0];

  const filteredPhilosophers = PHILOSOPHERS.filter(p => {
    const matchesSchool = selectedSchool === 'All' || p.school.toLowerCase().includes(selectedSchool.toLowerCase());
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.school.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSchool && matchesSearch;
  });

  const handleOpenPhilosopher = (philosopher) => {
    sounds.playTap();
    setActivePhilosopher(philosopher);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
            <Compass className="w-4 h-4" />
            <span>Western Philosophy & Wisdom</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            The Philosophical Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Ancient tools to govern the mind, conquer anxiety, and forge enduring virtue.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            setShowReflectionModal(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-glass flex items-center space-x-2 hover:brightness-110 active:scale-95 transition-all"
        >
          <PenTool className="w-4 h-4" />
          <span>Daily Examination (+50 XP)</span>
        </button>
      </div>

      {/* Philosophy Concept Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Foundational Mental Frameworks</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click to unfold</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PHILOSOPHY_CONCEPTS.map((c) => {
            const isExpanded = expandedConceptId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  sounds.playTap();
                  setExpandedConceptId(isExpanded ? null : c.id);
                }}
                className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                  isExpanded 
                    ? 'spatial-glass border-emerald-500/50 shadow-neon-emerald' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold">{c.origin}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300 animate-fade-in">
                    <p className="leading-relaxed">{c.definition}</p>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                      <span className="font-bold block text-[10px] uppercase text-emerald-400">Daily Practice:</span>
                      {c.dailyPractice}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* School Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {SCHOOL_FILTERS.map((school) => (
            <button
              key={school}
              onClick={() => {
                sounds.playTap();
                setSelectedSchool(school);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedSchool === school
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {school}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search philosopher, ideas..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Philosophers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPhilosophers.map((phil) => (
          <SpatialCard
            key={phil.id}
            onClick={() => handleOpenPhilosopher(phil)}
            className="cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-105 transition-transform">
                    {phil.avatar}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {phil.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 block">{phil.era}</span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {phil.school}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {phil.summary}
              </p>

              {/* Sample quote snippet */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 font-serif-book italic text-xs text-slate-400 line-clamp-2">
                "{phil.quotes[0]}"
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Explore bio, timeline & exercises</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </SpatialCard>
        ))}
      </div>

      {/* Philosopher Detail Modal */}
      <PhilosopherDetailModal
        philosopher={activePhilosopher}
        isOpen={Boolean(activePhilosopher)}
        onClose={() => setActivePhilosopher(null)}
      />

      {/* Daily Reflection Modal */}
      <DailyReflectionModal
        reflection={dailyReflection}
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
      />
    </div>
  );
}

