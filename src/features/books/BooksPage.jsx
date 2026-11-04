import React, { useState, useEffect } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import BookReader from './BookReader';
import AddCustomBookModal from './AddCustomBookModal';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Star, 
  Bookmark, 
  CheckCircle2, 
  Sparkles, 
  Clock,
  Layers
} from 'lucide-react';
import db from '../../db/database';
import { SEED_BOOKS } from '../../db/seedData';
import sounds from '../../utils/soundEffects';

const FILTER_TABS = ['All', 'Full Text (Public Domain)', 'Summaries & Takeaways', 'Reading', 'Finished'];

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [progressMap, setProgressMap] = useState(new Map());
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingBook, setReadingBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load books & reading progress from Dexie
  const loadBooksAndProgress = async () => {
    try {
      let storedBooks = await db.books.toArray();
      if (storedBooks.length === 0) {
        for (const b of SEED_BOOKS) {
          await db.books.put(b);
        }
        storedBooks = SEED_BOOKS;
      }
      setBooks(storedBooks);

      // Load progress
      const allProg = await db.readingProgress.toArray();
      const progMap = new Map(allProg.map(p => [p.bookId, p]));
      setProgressMap(progMap);
    } catch (err) {
      console.warn('Error loading books:', err);
    }
  };

  useEffect(() => {
    loadBooksAndProgress();
  }, []);

  // Filter logic
  const filteredBooks = books.filter(b => {
    const prog = progressMap.get(b.id);
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Full Text (Public Domain)') return b.isPublicDomain;
    if (activeFilter === 'Summaries & Takeaways') return !b.isPublicDomain;
    if (activeFilter === 'Reading') return prog && prog.status === 'reading';
    if (activeFilter === 'Finished') return prog && prog.status === 'finished';
    return true;
  });

  const handleOpenBook = (book) => {
    sounds.playTap();
    setReadingBook(book);
  };

  const finishedCount = Array.from(progressMap.values()).filter(p => p.status === 'finished').length;
  const inProgressCount = Array.from(progressMap.values()).filter(p => p.status === 'reading').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Wisdom Library & Summaries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Books, Reader & Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full public-domain classics and original synthesized takeaways for modern life.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            setShowAddModal(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-glass flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Book</span>
        </button>
      </div>

      {/* Reading Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SpatialCard className="p-3.5 space-y-1 text-center" glassStyle="subtle">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Library</span>
          <p className="text-xl font-black text-white">{books.length}</p>
        </SpatialCard>
        <SpatialCard className="p-3.5 space-y-1 text-center" glassStyle="subtle">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Currently Reading</span>
          <p className="text-xl font-black text-amber-300">{inProgressCount}</p>
        </SpatialCard>
        <SpatialCard className="p-3.5 space-y-1 text-center" glassStyle="subtle">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Books Mastered</span>
          <p className="text-xl font-black text-emerald-400">{finishedCount}</p>
        </SpatialCard>
        <SpatialCard className="p-3.5 space-y-1 text-center" glassStyle="subtle">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Offline Access</span>
          <p className="text-xl font-black text-blue-400">100% Local</p>
        </SpatialCard>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sounds.playTap();
                setActiveFilter(tab);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeFilter === tab
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, authors..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book) => {
          const prog = progressMap.get(book.id);
          const percent = prog ? prog.percent : 0;
          const status = prog ? prog.status : 'not_started';

          return (
            <SpatialCard
              key={book.id}
              onClick={() => handleOpenBook(book)}
              className="cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Book Spine / Cover Header */}
                <div className={`h-24 rounded-2xl bg-gradient-to-br ${book.coverColor || 'from-emerald-700 to-slate-900'} p-3 flex flex-col justify-between border border-white/15 relative overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-md">
                      {book.isPublicDomain ? 'Full Text Included' : 'Chapter Summaries'}
                    </span>
                    {status === 'finished' && (
                      <span className="p-1 rounded-full bg-emerald-500 text-slate-950 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white line-clamp-1 drop-shadow-md">
                      {book.title}
                    </h3>
                    <span className="text-[11px] text-white/80 font-medium">
                      {book.author}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{book.chapters ? book.chapters.length : 0} chapters</span>
                  <span className="font-semibold text-emerald-400">{book.category}</span>
                </div>
              </div>

              {/* Progress Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>{status === 'finished' ? 'Completed' : percent > 0 ? `${percent}% read` : 'Unread'}</span>
                  <span className="text-emerald-400 font-bold group-hover:underline">Read / Notes →</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </SpatialCard>
          );
        })}
      </div>

      {/* Reader View Fullscreen Modal */}
      {readingBook && (
        <BookReader
          book={readingBook}
          onClose={() => {
            setReadingBook(null);
            loadBooksAndProgress();
          }}
        />
      )}

      {/* Add Custom Book Modal */}
      <AddCustomBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBookAdded={() => loadBooksAndProgress()}
      />
    </div>
  );
}

