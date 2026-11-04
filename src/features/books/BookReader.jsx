import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Type, 
  Menu,
  CheckCircle,
  Share2
} from 'lucide-react';
import MySummaryEditor from './MySummaryEditor';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';

export default function BookReader({ book, onClose }) {
  const addXp = useAppStore(state => state.addXp);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState('text-base'); // 'text-sm' | 'text-base' | 'text-lg' | 'text-xl'
  const [lineHeight, setLineHeight] = useState('leading-relaxed'); // 'leading-normal' | 'leading-relaxed' | 'leading-loose'
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'sepia' | 'light'
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const chapters = book.chapters || [];
  const currentChapter = chapters[currentChapterIdx] || { title: 'Chapter', content: '', summary: '' };

  // Load reading progress
  useEffect(() => {
    async function loadProgress() {
      try {
        const prog = await db.readingProgress.get(book.id);
        if (prog) {
          if (prog.currentChapter < chapters.length) {
            setCurrentChapterIdx(prog.currentChapter);
          }
        }
      } catch (e) {
        console.warn('Error loading progress:', e);
      }
    }
    loadProgress();
  }, [book.id, chapters.length]);

  // Update progress
  const handleChapterChange = async (newIdx) => {
    if (newIdx < 0 || newIdx >= chapters.length) return;
    sounds.playTap();
    setCurrentChapterIdx(newIdx);

    const percent = Math.round(((newIdx + 1) / chapters.length) * 100);
    const isFinished = newIdx === chapters.length - 1;

    try {
      await db.readingProgress.put({
        bookId: book.id,
        currentChapter: newIdx,
        totalChapters: chapters.length,
        percent,
        status: isFinished ? 'finished' : 'reading',
        updatedAt: Date.now()
      });

      addXp(15, `Read chapter ${newIdx + 1}`);
    } catch (e) {
      console.warn('Error saving progress:', e);
    }
  };

  const getThemeClass = () => {
    if (themeMode === 'sepia') return 'reader-sepia';
    if (themeMode === 'light') return 'reader-light';
    return 'reader-dark text-slate-100';
  };

  const percent = Math.round(((currentChapterIdx + 1) / (chapters.length || 1)) * 100);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${getThemeClass()} transition-colors duration-200`}>
      {/* Top Reader Navbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Back to books"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md">{book.title}</h3>
            <span className="text-[11px] opacity-70 block">{book.author}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Chapter Menu Drawer Trigger */}
          <button
            onClick={() => setShowChapterMenu(!showChapterMenu)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            title="Chapters list"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Typography Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            title="Reader Display Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar Top */}
      <div className="w-full h-1 bg-white/10">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Reader Typography Settings Dropdown */}
      {showSettings && (
        <div className="p-4 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl text-white space-y-3 z-30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Theme</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setThemeMode('dark')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${themeMode === 'dark' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white'}`}
              >
                Dark
              </button>
              <button
                onClick={() => setThemeMode('sepia')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${themeMode === 'sepia' ? 'bg-amber-600 text-white' : 'bg-white/10 text-white'}`}
              >
                Sepia
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${themeMode === 'light' ? 'bg-slate-200 text-slate-900' : 'bg-white/10 text-white'}`}
              >
                Light
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Font Size</span>
            <div className="flex space-x-2">
              {['text-sm', 'text-base', 'text-lg', 'text-xl'].map((sz, i) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center ${fontSize === sz ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white'}`}
                >
                  {i === 0 ? 'S' : i === 1 ? 'M' : i === 2 ? 'L' : 'XL'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapter Selection Drawer */}
      {showChapterMenu && (
        <div className="p-4 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl text-white max-h-60 overflow-y-auto space-y-1.5 z-30">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Chapters</span>
          {chapters.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => {
                handleChapterChange(idx);
                setShowChapterMenu(false);
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                idx === currentChapterIdx 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <span>{ch.title}</span>
              {idx === currentChapterIdx && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}

      {/* Main Reading Canvas */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-12 py-8 max-w-3xl mx-auto w-full space-y-8">
        {/* Chapter Header */}
        <div className="space-y-2 border-b border-current/15 pb-4">
          <span className="text-xs uppercase font-extrabold tracking-widest opacity-70">
            Chapter {currentChapterIdx + 1} of {chapters.length} ({percent}%)
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-book tracking-tight">
            {currentChapter.title}
          </h2>
        </div>

        {/* Content Body */}
        {book.isPublicDomain ? (
          /* Full Text for Public Domain Book */
          <div className={`font-serif-book ${fontSize} ${lineHeight} whitespace-pre-line tracking-wide opacity-95`}>
            {currentChapter.content}
          </div>
        ) : (
          /* Chapter Key Takeaway Summary for Copyrighted Book */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              Original chapter takeaways & framework summary (synthesized for personal reflection).
            </div>
            <div className={`font-serif-book ${fontSize} ${lineHeight} whitespace-pre-line tracking-wide leading-relaxed`}>
              {currentChapter.summary}
            </div>
          </div>
        )}

        {/* User Chapter Notes & Summary Section */}
        <div className="mt-12 pt-8 border-t border-current/20">
          <MySummaryEditor
            bookId={book.id}
            chapterIndex={currentChapterIdx}
            chapterTitle={currentChapter.title}
          />
        </div>
      </div>

      {/* Bottom Floating Chapter Pagination Bar */}
      <div className="p-4 border-t border-white/10 backdrop-blur-md flex items-center justify-between max-w-3xl mx-auto w-full">
        <button
          onClick={() => handleChapterChange(currentChapterIdx - 1)}
          disabled={currentChapterIdx === 0}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-semibold opacity-75">
          {currentChapterIdx + 1} / {chapters.length}
        </span>

        <button
          onClick={() => handleChapterChange(currentChapterIdx + 1)}
          disabled={currentChapterIdx === chapters.length - 1}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-30 text-xs flex items-center space-x-1.5 transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

