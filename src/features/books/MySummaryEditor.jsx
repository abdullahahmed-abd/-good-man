import React, { useState, useEffect } from 'react';
import { PenTool, Check, Download, Copy, Sparkles } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';

export default function MySummaryEditor({ bookId, chapterIndex, chapterTitle }) {
  const addXp = useAppStore(state => state.addXp);
  const [content, setContent] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load existing note from IndexedDB
  useEffect(() => {
    async function loadNote() {
      try {
        const note = await db.userBookNotes
          .where('[bookId+chapterIndex]')
          .equals([bookId, chapterIndex])
          .first();
        if (note && note.content) {
          setContent(note.content);
          setLastSavedTime(note.updatedAt);
        } else {
          setContent('');
          setLastSavedTime(null);
        }
      } catch (err) {
        console.warn('Error loading note:', err);
      }
    }
    loadNote();
  }, [bookId, chapterIndex]);

  // Auto-save debouncer
  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);

    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(async () => {
      try {
        const now = Date.now();
        const existing = await db.userBookNotes
          .where('[bookId+chapterIndex]')
          .equals([bookId, chapterIndex])
          .first();

        if (existing) {
          await db.userBookNotes.update(existing.id, {
            content: text,
            updatedAt: now
          });
        } else {
          await db.userBookNotes.add({
            bookId,
            chapterIndex,
            title: chapterTitle,
            content: text,
            updatedAt: now
          });
          addXp(20, 'Wrote chapter summary note');
        }
        setLastSavedTime(now);
      } catch (e) {
        console.warn('Failed auto-saving note:', e);
      }
    }, 1000);
  };

  const handleCopyMarkdown = () => {
    const markdown = `# Notes: ${chapterTitle}\n\n${content}`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    sounds.playTap();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const markdown = `# Notes on ${chapterTitle}\nBook ID: ${bookId}\nDate: ${new Date().toLocaleDateString()}\n\n${content}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${bookId}-ch${chapterIndex + 1}.md`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playTap();
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PenTool className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            My Personal Summary & Insights
          </h4>
        </div>

        <div className="flex items-center space-x-2">
          {lastSavedTime && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-3 h-3" /> Saved locally
            </span>
          )}
          <button
            onClick={handleCopyMarkdown}
            disabled={!content.trim()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 text-xs transition-colors"
            title="Copy as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadMarkdown}
            disabled={!content.trim()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 text-xs transition-colors"
            title="Export Markdown File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <textarea
        rows={6}
        value={content}
        onChange={handleContentChange}
        placeholder="Write what resonated with you from this chapter, how it changes your behavior, or personal takeaways..."
        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
      />
    </div>
  );
}

