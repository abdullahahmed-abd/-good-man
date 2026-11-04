import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { Plus, Trash2, Check } from 'lucide-react';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';

export default function AddCustomBookModal({ isOpen, onClose, onBookAdded }) {
  const addXp = useAppStore(state => state.addXp);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Philosophy');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState([
    { title: 'Chapter 1: Introduction', summary: '' }
  ]);

  const handleAddChapter = () => {
    setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, summary: '' }]);
  };

  const handleRemoveChapter = (index) => {
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleChapterTitleChange = (index, val) => {
    const updated = [...chapters];
    updated[index].title = val;
    setChapters(updated);
  };

  const handleChapterContentChange = (index, val) => {
    const updated = [...chapters];
    updated[index].summary = val;
    setChapters(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    try {
      const newBook = {
        id: `custom-book-${Date.now()}`,
        title: title.trim(),
        author: author.trim(),
        category,
        description: description.trim() || 'Custom added book',
        isPublicDomain: false,
        isCustom: true,
        coverColor: 'from-emerald-700 to-indigo-950',
        chapters
      };

      await db.books.put(newBook);
      sounds.playSuccess();
      addXp(40, 'Added custom book');
      if (onBookAdded) onBookAdded(newBook);
      onClose();
    } catch (err) {
      console.warn('Failed saving custom book:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Book"
      icon="📚"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Letters to Lucilius, Discourses, etc."
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Author *</label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Epictetus"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Philosophy" className="bg-slate-900">Philosophy</option>
              <option value="Habits & Growth" className="bg-slate-900">Habits & Growth</option>
              <option value="Psychology" className="bg-slate-900">Psychology</option>
              <option value="Biographies" className="bg-slate-900">Biographies</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What core wisdom does this book provide?"
            className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Chapters Section */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Chapters & Summaries</span>
            <button
              type="button"
              onClick={handleAddChapter}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-emerald-400 font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chapter</span>
            </button>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {chapters.map((ch, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={ch.title}
                    onChange={(e) => handleChapterTitleChange(idx, e.target.value)}
                    placeholder="Chapter Title"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(idx)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={ch.summary}
                  onChange={(e) => handleChapterContentChange(idx, e.target.value)}
                  placeholder="Key takeaways or summary notes..."
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass flex items-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Add Book to Library</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

