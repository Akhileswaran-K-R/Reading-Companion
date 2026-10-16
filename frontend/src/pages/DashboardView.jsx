import React from 'react';
import { 
  Trophy, 
  BookOpen, 
  Flame, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  BookmarkPlus, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  RotateCcw 
} from 'lucide-react';
import { updateLibrary } from '../api/client';

export default function DashboardView({ 
  library = [], 
  onOpenBook, 
  activeBookId, 
  onSetActiveBook,
  onReloadLibrary 
}) {
  const completedBooks = library.filter(b => b.status === 'completed');
  const inProgressBooks = library.filter(b => b.status !== 'completed');
  
  const activeItem = library.find(b => b.book.id === activeBookId) 
    || library.find(b => b.status === 'currently_reading') 
    || library[0] 
    || null;

  const totalPagesRead = library.reduce((acc, b) => {
    if (b.status === 'completed') {
      return acc + (b.totalPages || 300);
    }
    return acc + (b.page || 1);
  }, 0);
  const totalBooksCount = library.length;
  const completedCount = completedBooks.length;

  const handleSelectActiveBook = async (bookId) => {
    if (onSetActiveBook) {
      await onSetActiveBook(bookId);
    }
  };

  const handleToggleStatus = async (bookId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'currently_reading' : 'completed';
    try {
      await updateLibrary(bookId, nextStatus);
      if (nextStatus === 'currently_reading' && onSetActiveBook) {
        await onSetActiveBook(bookId);
      }
      if (onReloadLibrary) {
        await onReloadLibrary();
      }
    } catch (e) {
      console.warn("Status toggle error:", e);
    }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto animate-fadeIn">
      {/* Dashboard Monumental Header & Fast Switcher */}
      <div className="border-b border-[#e8e6dc] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xs text-[#c96442] uppercase font-bold tracking-widest">
            <span>Reading Ledger</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#141413] font-normal tracking-tight">
            The Reader’s Cadence
          </h1>
          <p className="font-serif italic text-lg text-[#5e5d59]">
            Track reading milestones, pacing, and chapter recall points.
          </p>
        </div>

        {/* Global Active Book Quick Switcher */}
        {library.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#faf9f5] border border-[#e8e6dc] p-2.5 px-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-[#c96442]">
              <Bookmark size={15} />
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
                Active Book:
              </span>
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                value={activeItem?.book?.id || ''}
                onChange={(e) => handleSelectActiveBook(Number(e.target.value))}
                className="w-full sm:w-auto appearance-none bg-[#f5f4ed] border border-[#e8e6dc] hover:border-[#c96442] focus:border-[#c96442] pl-3.5 pr-9 py-2 rounded-xl font-serif text-sm font-medium text-[#141413] outline-none cursor-pointer transition-all"
              >
                {library.map((item) => (
                  <option key={item.book.id} value={item.book.id}>
                    {item.book.title} ({item.status === 'completed' ? 'Completed' : item.chapter || 'In Progress'})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5e5d59] pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Featured Current Reading Spotlight Card */}
      {activeItem && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#faf9f5] via-[#faf6f0] to-[#f5f0e6] rounded-3xl border border-[#ebdcc9] p-7 sm:p-8 shadow-[0_2px_12px_rgba(20,20,19,0.03)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              {activeItem.book.cover_image ? (
                <img 
                  src={activeItem.book.cover_image} 
                  alt={activeItem.book.title} 
                  className="w-20 h-28 object-cover rounded-xl shadow-md border border-[#e8e6dc] shrink-0" 
                />
              ) : (
                <div className="w-20 h-28 rounded-xl bg-[#f0eee6] border border-[#e8e6dc] flex items-center justify-center text-[#c96442] shrink-0 font-serif text-2xl font-bold">
                  {activeItem.book.title[0]}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fbeee6] border border-[#f0dfcc] text-[#c96442] text-[10px] font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider">
                    <BookmarkCheck size={12} />
                    Current Reading Focus
                  </span>
                  <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#5e5d59]">
                    {activeItem.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl text-[#141413]">
                  {activeItem.book.title}
                </h2>
                <p className="font-serif italic text-sm text-[#5e5d59]">
                  {activeItem.book.author} · Milestone: <span className="font-sans font-semibold text-[#141413] not-italic">{activeItem.chapter || 'Chapter I'} · pg. {activeItem.page || 1}</span> ({activeItem.percent || 0}% Read)
                </p>

                {/* Micro Progress Bar */}
                <div className="w-48 sm:w-64 h-1.5 bg-[#e8e6dc] rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-[#c96442] rounded-full transition-all duration-700" 
                    style={{ width: `${Math.max(3, activeItem.percent || 0)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => onOpenBook(activeItem.book.id, 'reader')}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <BookOpen size={14} />
                <span>Resume Reading</span>
              </button>

              <button
                onClick={() => onOpenBook(activeItem.book.id, 'summary')}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[#e8e6dc] bg-[#faf9f5] hover:bg-[#f0eee6] text-[#141413] font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]"
              >
                <Sparkles size={14} className="text-[#c96442]" />
                <span>Recall Points</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-8 space-y-4 shadow-[0_2px_12px_-2px_rgba(20,20,19,0.02)]">
          <div className="flex items-center justify-between text-[#c96442]">
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider">Books Completed</span>
            <Trophy size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-5xl text-[#141413]">{completedCount}</span>
            <span className="font-serif italic text-lg text-[#5e5d59]">of {totalBooksCount} volumes</span>
          </div>
          <div className="w-full h-1.5 bg-[#f0eee6] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#c96442] rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / Math.max(1, totalBooksCount)) * 100}%` }}
            />
          </div>
          <p className="font-sans text-xs text-[#5e5d59] leading-relaxed">
            Unlocks full chapter recall points and comprehensive plot syntheses.
          </p>
        </div>

        <div className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-8 space-y-4 shadow-[0_2px_12px_-2px_rgba(20,20,19,0.02)]">
          <div className="flex items-center justify-between text-[#c89d36]">
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider">Pages Read</span>
            <BookOpen size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-5xl text-[#141413]">{totalPagesRead}</span>
            <span className="font-serif italic text-lg text-[#5e5d59]">pg. read</span>
          </div>
          <p className="font-sans text-xs text-[#5e5d59] leading-relaxed pt-3">
            Tracked across all shelf volumes and reading bookmarks in your Sanctuary.
          </p>
        </div>

        <div className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-8 space-y-4 shadow-[0_2px_12px_-2px_rgba(20,20,19,0.02)]">
          <div className="flex items-center justify-between text-[#c96442]">
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider">Active Reading</span>
            <Flame size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-5xl text-[#141413]">{inProgressBooks.length}</span>
            <span className="font-serif italic text-lg text-[#5e5d59]">in progress</span>
          </div>
          <p className="font-sans text-xs text-[#5e5d59] leading-relaxed pt-3">
            Active volumes currently bound to your spoiler-safe reading horizon.
          </p>
        </div>
      </div>

      {/* In-Progress Volumes (Set Current Reading Book) */}
      <section className="space-y-6 pt-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#141413] font-normal">
              Volumes In Progress
            </h2>
            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#5e5d59]">
              {inProgressBooks.length} active volumes
            </span>
          </div>
          <p className="font-serif italic text-sm text-[#5e5d59]">
            Select any volume to make it your active session and synchronize your reader horizon.
          </p>
        </div>

        {inProgressBooks.length === 0 ? (
          <div className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-10 text-center space-y-3">
            <BookOpen size={32} className="mx-auto text-[#87867f]" />
            <h3 className="font-serif text-xl text-[#141413]">No volumes in progress</h3>
            <p className="font-sans text-xs text-[#5e5d59] max-w-md mx-auto">
              Add a volume from Project Gutenberg or your bookshelf to begin reading with spoiler-shielded recall points.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressBooks.map((item) => {
              const isCurrent = (item.book.id === (activeItem?.book?.id));

              return (
                <div
                  key={item.book.id}
                  className={`bg-[#faf9f5] rounded-3xl border p-7 flex flex-col justify-between transition-all group ${
                    isCurrent 
                      ? 'border-[#c96442] shadow-[0_3px_14px_rgba(201,100,66,0.08)] bg-gradient-to-b from-[#faf9f5] to-[#fbf7f2]' 
                      : 'border-[#e8e6dc] hover:border-[#c96442]/60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      {isCurrent ? (
                        <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442] bg-[#fbeee6] border border-[#f0dfcc] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <BookmarkCheck size={12} />
                          Current Reading Book
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectActiveBook(item.book.id)}
                          className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-wider text-[#141413] hover:text-[#c96442] bg-[#f0eee6] hover:bg-[#e8e6dc] px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <BookmarkPlus size={12} className="text-[#c96442]" />
                          Set as Current Book
                        </button>
                      )}

                      <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#87867f]">
                        {item.chapter || "Chapter I"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl text-[#141413] group-hover:text-[#c96442] transition-colors">
                        {item.book.title}
                      </h3>
                      <p className="font-serif italic text-sm text-[#5e5d59] mt-0.5">
                        {item.book.author}
                      </p>
                    </div>

                    {/* Progress Detail */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-['Plus_Jakarta_Sans'] text-[#5e5d59]">
                        <span>Reading Progress</span>
                        <span className="font-semibold text-[#141413]">{item.percent || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f0eee6] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#c96442] rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(4, item.percent || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#f0eee6] flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => handleToggleStatus(item.book.id, item.status)}
                      className="inline-flex items-center gap-1.5 text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#5e5d59] hover:text-[#141413] cursor-pointer"
                    >
                      <CheckCircle2 size={13} className="text-[#87867f]" />
                      <span>Mark Completed</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenBook(item.book.id, 'summary')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#e8e6dc] hover:bg-[#f0eee6] text-xs font-['Plus_Jakarta_Sans'] font-semibold text-[#141413] transition-all cursor-pointer"
                      >
                        <Sparkles size={12} className="text-[#c96442]" />
                        <span>Recall</span>
                      </button>

                      <button
                        onClick={() => onOpenBook(item.book.id, 'reader')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c96442] hover:bg-[#b35535] text-white text-xs font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                      >
                        <span>Resume</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Finished Volumes Showcase */}
      <section className="space-y-6 pt-4">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl text-[#141413] font-normal">
            Completed Volumes
          </h2>
          <p className="font-serif italic text-sm text-[#5e5d59]">
            Review chapter takeaways and memory-retention recall points.
          </p>
        </div>

        {completedBooks.length === 0 ? (
          <div className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-10 text-center space-y-3">
            <BookOpen size={32} className="mx-auto text-[#87867f]" />
            <h3 className="font-serif text-xl text-[#141413]">No completed volumes yet</h3>
            <p className="font-sans text-xs text-[#5e5d59] max-w-md mx-auto">
              Finish a volume in your Sanctuary to unlock structured chapter recall points and narrative syntheses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedBooks.map((item) => (
              <div
                key={item.book.id}
                className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-7 flex flex-col justify-between hover:border-[#c96442] transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442] bg-[#fbeee6] px-2.5 py-0.5 rounded-full">
                      Ready for Recall
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#87867f]">
                      {item.book.total_chunks || 0} Chunks
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#141413] group-hover:text-[#c96442] transition-colors">
                    {item.book.title}
                  </h3>
                  <p className="font-serif italic text-sm text-[#5e5d59]">
                    {item.book.author}
                  </p>
                  <p className="font-sans text-xs text-[#5e5d59] leading-relaxed bg-[#f5f4ed] rounded-xl p-3">
                    Structured chapter-by-chapter recall points and core themes are synthesized for your review.
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#f0eee6] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleToggleStatus(item.book.id, item.status)}
                    className="inline-flex items-center gap-1.5 text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#5e5d59] hover:text-[#141413] cursor-pointer"
                  >
                    <RotateCcw size={12} className="text-[#87867f]" />
                    <span>Set as Current (Re-read)</span>
                  </button>

                  <button
                    onClick={() => onOpenBook(item.book.id, 'summary')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    <span>Review Recall Points</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
