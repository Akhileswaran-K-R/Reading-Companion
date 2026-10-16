import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Bookmark, BookmarkCheck, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { getChapters, updateBookmark } from '../api/client';

export default function BookmarkView({ library = [], onUpdateBookmark, activeBookId }) {
  const navigate = useNavigate();
  const { bookId: paramBookId } = useParams();

  const initialBookId = paramBookId ? Number(paramBookId) : (activeBookId || library[0]?.book?.id || null);
  const [targetBookId, setTargetBookId] = useState(initialBookId);
  const [targetChapter, setTargetChapter] = useState('CHAPTER I');
  const [targetPage, setTargetPage] = useState(1);
  const [chaptersCache, setChaptersCache] = useState({});
  const [bookmarkSuccess, setBookmarkSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Synchronize targetBook when param or activeBook changes
  useEffect(() => {
    if (paramBookId) {
      setTargetBookId(Number(paramBookId));
    } else if (library.length > 0 && !targetBookId) {
      setTargetBookId(activeBookId || library[0]?.book?.id);
    }
  }, [paramBookId, library, activeBookId, targetBookId]);

  // Load current chapter & page for targetBook
  useEffect(() => {
    const current = library.find(item => item.book?.id === targetBookId);
    if (current) {
      if (current.chapter) setTargetChapter(current.chapter);
      if (current.page) setTargetPage(current.page);
    }
  }, [targetBookId, library]);

  // Fetch chapters for target book
  useEffect(() => {
    if (targetBookId && !chaptersCache[targetBookId]) {
      getChapters(targetBookId)
        .then((res) => {
          if (res?.data) {
            const chapNames = res.data.map((c) => c.chapter).filter(Boolean);
            setChaptersCache((prev) => ({ ...prev, [targetBookId]: chapNames }));
            if (!chapNames.includes(targetChapter) && chapNames.length > 0) {
              setTargetChapter(chapNames[0]);
            }
          }
        })
        .catch((err) => console.warn('Failed fetching chapters:', err));
    }
  }, [targetBookId, chaptersCache, targetChapter]);

  const availableChapters = (targetBookId && chaptersCache[targetBookId]) || [targetChapter || 'CHAPTER I'];
  const currentItem = library.find(item => item.book?.id === targetBookId);

  const handleBookChange = (newBookId) => {
    setTargetBookId(newBookId);
    setBookmarkSuccess(false);
  };

  const handleSaveBookmark = async (e) => {
    e.preventDefault();
    if (!targetBookId) return;
    setSaving(true);
    try {
      await updateBookmark(targetBookId, { chapter: targetChapter, page: targetPage });
      if (onUpdateBookmark) {
        onUpdateBookmark(targetBookId, targetChapter, targetPage);
      }
      setBookmarkSuccess(true);
      setTimeout(() => setBookmarkSuccess(false), 4000);
    } catch (err) {
      console.error('Bookmark update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!library || library.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-[#f5f4ed] border border-[#e8e6dc] flex items-center justify-center text-[#c96442] shadow-sm">
          <BookOpen size={28} />
        </div>
        <div className="space-y-3">
          <h2 className="font-serif text-3xl text-[#141413] tracking-tight">No Volumes in Sanctuary</h2>
          <p className="font-serif italic text-base text-[#5e5d59] max-w-md mx-auto">
            You must ingest a volume into your sanctuary before synchronizing physical bookmark positions.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/ingest')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
          >
            <span>Ingest Your First Volume</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between border-b border-[#e8e6dc] pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sanctuary')}
            className="p-2.5 rounded-xl bg-[#faf9f5] border border-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] hover:bg-[#f0eee6] transition-all cursor-pointer shadow-xs"
            title="Return to Sanctuary"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
              Horizon Synchronizer
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141413] font-normal tracking-tight">
              Set Reading Bookmark
            </h1>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbeee6] text-[#c96442] font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider">
          <Bookmark size={13} />
          <span>Spoiler Guard Active</span>
        </span>
      </div>

      <p className="font-serif italic text-base text-[#5e5d59]">
        Synchronize your physical reading position. The AI companion uses this bookmark to strictly lock conversational answers and prevent spoilers.
      </p>

      {/* Main Settings Card */}
      <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-8 sm:p-10 shadow-[0_2px_12px_-2px_rgba(20,20,19,0.02)] space-y-8">
        <form onSubmit={handleSaveBookmark} className="space-y-6">
          {/* Volume Selector */}
          <div className="space-y-2">
            <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
              Active Volume
            </label>
            <div className="relative">
              <select
                value={targetBookId}
                onChange={(e) => handleBookChange(Number(e.target.value))}
                className="w-full appearance-none bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-2xl px-5 py-3.5 text-base font-serif text-[#141413] outline-none transition-all cursor-pointer pr-12 shadow-xs"
              >
                {library.map((item) => (
                  <option key={item.book.id} value={item.book.id}>
                    {item.book.title} ({item.book.author})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#87867f]">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Chapter and Page Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
                Milestone Chapter
              </label>
              <div className="relative">
                <select
                  value={targetChapter}
                  onChange={(e) => setTargetChapter(e.target.value)}
                  className="w-full appearance-none bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-2xl px-5 py-3.5 text-base font-serif text-[#141413] outline-none transition-all cursor-pointer pr-12 shadow-xs"
                >
                  {availableChapters.map((chap) => (
                    <option key={chap} value={chap}>
                      {chap}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#87867f]">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
                Page Number (pg.)
              </label>
              <input
                type="number"
                min={1}
                value={targetPage}
                onChange={(e) => setTargetPage(Math.max(1, Number(e.target.value)))}
                placeholder="e.g. 1"
                className="w-full bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-2xl px-5 py-3.5 text-base font-['Plus_Jakarta_Sans'] font-medium text-[#141413] outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Success Banner */}
          {bookmarkSuccess && (
            <div className="p-4 rounded-2xl bg-[#fbeee6] border border-[#c96442]/30 text-[#c96442] text-sm font-['Plus_Jakarta_Sans'] font-semibold flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <BookmarkCheck size={18} className="text-[#c96442]" />
                <span>Bookmark horizon synchronized to {targetChapter} · pg. {targetPage}!</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/reader/${targetBookId}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#c96442] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b35535] cursor-pointer"
              >
                <span>Read</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 py-4 rounded-2xl bg-[#c96442] hover:bg-[#b35535] active:scale-[0.98] text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Synchronizing Horizon...' : 'Save Bookmark Horizon'}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/reader/${targetBookId}`)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#f5f4ed] border border-[#e8e6dc] hover:bg-[#f0eee6] text-[#141413] font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Open Reader
            </button>
          </div>
        </form>

        {/* Current Volume Snapshot */}
        {currentItem && (
          <div className="pt-6 border-t border-[#f0eee6] flex items-center justify-between text-xs text-[#5e5d59] font-['Plus_Jakarta_Sans']">
            <span>Volume Progress: <strong className="text-[#141413]">{currentItem.percent || 0}%</strong></span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/summary/${targetBookId}`)}
                className="inline-flex items-center gap-1 text-[#c96442] hover:underline font-semibold cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Recall Points</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
