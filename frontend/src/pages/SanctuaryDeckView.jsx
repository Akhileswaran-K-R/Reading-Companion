import React, { useState } from 'react';
import { BookOpen, Sparkles, Plus, Upload, Search, X, ShieldCheck, BookmarkPlus, ChevronDown } from 'lucide-react';
import BookCover3D from '../components/BookCover3D';
import { updateBookmark } from '../api/client';

const BOOK_CHAPTERS_MAP = {
  1: [
    "Letter I", "Letter II", "Letter III", "Letter IV",
    "Chapter I", "Chapter II", "Chapter III", "Chapter IV",
    "Chapter V", "Chapter VI", "Chapter VII", "Chapter VIII",
    "Chapter IX", "Chapter X", "Chapter XI", "Chapter XII",
    "Chapter XIII", "Chapter XIV", "Chapter XV", "Chapter XVI",
    "Chapter XVII", "Chapter XVIII", "Chapter XIX", "Chapter XX",
    "Chapter XXI", "Chapter XXII", "Chapter XXIII", "Chapter XXIV"
  ],
  2: [
    "Chapter I", "Chapter II", "Chapter III", "Chapter IV", "Chapter V",
    "Chapter VI", "Chapter VII", "Chapter VIII", "Chapter IX", "Chapter X",
    "Chapter XI", "Chapter XII", "Chapter XIII", "Chapter XIV", "Chapter XV",
    "Chapter XX", "Chapter XXV", "Chapter XXX", "Chapter XXXV", "Chapter XL",
    "Chapter XLV", "Chapter L", "Chapter LV", "Chapter LX", "Chapter LXI"
  ],
  3: [
    "Preface", "Chapter I", "Chapter II", "Chapter III", "Chapter IV",
    "Chapter V", "Chapter VI", "Chapter VII", "Chapter VIII", "Chapter IX",
    "Chapter X", "Chapter XI", "Chapter XII", "Chapter XIII", "Chapter XIV",
    "Chapter XV", "Chapter XVI", "Chapter XVII", "Chapter XVIII", "Chapter XIX", "Chapter XX"
  ],
  4: [
    "Chapter I", "Chapter II", "Chapter III", "Chapter IV", "Chapter V",
    "Chapter VI", "Chapter VII", "Chapter VIII", "Chapter IX"
  ]
};

export default function SanctuaryDeckView({ 
  library, 
  onSelectBook, 
  onAddBook, 
  onUploadBook, 
  onUpdateBookmark,
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  onSearch, 
  searching 
}) {
  const [selectedQuickViewBook, setSelectedQuickViewBook] = useState(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showBookmarkAdder, setShowBookmarkAdder] = useState(false);
  const [targetBookId, setTargetBookId] = useState(library[0]?.book?.id || 1);
  const [targetChapter, setTargetChapter] = useState(library[0]?.chapter || 'Chapter IV');
  const [targetPage, setTargetPage] = useState(library[0]?.page || 52);
  const [bookmarkSuccess, setBookmarkSuccess] = useState(false);

  const getChaptersForBook = (bookId) => {
    if (BOOK_CHAPTERS_MAP[bookId]) {
      return BOOK_CHAPTERS_MAP[bookId];
    }
    return Array.from({ length: 15 }, (_, i) => `Chapter ${i + 1}`);
  };

  const availableChapters = getChaptersForBook(targetBookId);

  const handleBookChange = (newBookId) => {
    setTargetBookId(newBookId);
    const item = library.find(i => i.book.id === newBookId);
    const chaps = getChaptersForBook(newBookId);
    if (item?.chapter && chaps.includes(item.chapter)) {
      setTargetChapter(item.chapter);
    } else {
      setTargetChapter(chaps[0] || 'Chapter I');
    }
    if (item?.page) {
      setTargetPage(item.page);
    }
  };

  const paletteSpines = [
    { bg: "#1f2d24", accent: "#d4af37" },
    { bg: "#36221c", accent: "#ffdbd0" },
    { bg: "#232634", accent: "#c89d36" },
    { bg: "#3c2a3e", accent: "#e5c07b" },
  ];

  const handleSaveBookmark = (e) => {
    e.preventDefault();
    setBookmarkSuccess(true);
    if (onUpdateBookmark) {
      onUpdateBookmark(targetBookId, targetChapter, targetPage);
    }
    try {
      updateBookmark(targetBookId, { chapter: targetChapter, page: targetPage });
    } catch (err) {
      console.warn("Bookmark update local sync:", err);
    }
    setTimeout(() => {
      setBookmarkSuccess(false);
      setShowBookmarkAdder(false);
    }, 900);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Sanctuary Header & Actions */}
      <div className="border-b border-[#e8e6dc] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xs text-[#c96442] uppercase font-bold tracking-widest">
            <span>The Library Sanctuary · Tactile Spines</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#141413] font-normal tracking-tight">
            The Living Deck
          </h1>
          <p className="font-serif italic text-lg text-[#5e5d59]">
            Physical 3D bookcraft. Hover to tilt bindings. Tap any volume title or cover to inspect details and begin reading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bookmark Adder in Sanctuary */}
          <button
            onClick={() => setShowBookmarkAdder(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#faf9f5] border border-[#e8e6dc] hover:border-[#c96442] hover:bg-[#f0eee6] text-[#141413] font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <BookmarkPlus size={16} className="text-[#c96442]" />
            <span>Set Bookmark</span>
          </button>

          <button
            onClick={() => setShowAddDrawer(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Ingest New Book</span>
          </button>
        </div>
      </div>

      {/* 3D Physical Book Spines Deck Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center py-6">
        {library.map((item, index) => {
          const b = item.book;
          const styling = paletteSpines[index % paletteSpines.length];
          const isCompleted = item.status === 'completed';

          return (
            <div key={b.id} className="flex flex-col items-center space-y-4">
              <BookCover3D
                title={b.title}
                author={b.author}
                chapter={item.chapter || (isCompleted ? "Completed" : "Chapter IV")}
                page={item.page || (isCompleted ? 340 : 52)}
                totalPages={item.totalPages || 340}
                coverColor={styling.bg}
                accentColor={styling.accent}
                coverImage={b.cover_image}
                onClick={() => setSelectedQuickViewBook(item)}
              />

              {/* Spine Caption & Status Tag */}
              <div className="text-center space-y-1 max-w-[240px]">
                <span className={`inline-block font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  isCompleted ? 'bg-[#e8e6dc] text-[#5e5d59]' : 'bg-[#ffdbd0] text-[#7e2c0e]'
                }`}>
                  {isCompleted ? '100% Recalled' : `${item.percent || 51}% Read`}
                </span>
                
                {/* Clicking on title opens the Quick Glance & Q&A Dossier */}
                <h4 
                  onClick={() => setSelectedQuickViewBook(item)}
                  className="font-serif text-lg text-[#141413] leading-snug line-clamp-1 hover:text-[#c96442] transition-colors cursor-pointer"
                  title="Click to view summary and ask questions"
                >
                  {b.title}
                </h4>

                <p className="font-serif italic text-xs text-[#5e5d59]">
                  {b.author}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookmark Adder Modal */}
      {showBookmarkAdder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-overlay">
          <div className="relative w-full max-w-lg bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-8 shadow-2xl space-y-6 animate-modal">
            <button
              onClick={() => setShowBookmarkAdder(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
                Sanctuary Horizon
              </span>
              <h3 className="font-serif text-2xl text-[#141413]">
                Update Reading Bookmark
              </h3>
              <p className="font-serif italic text-xs text-[#5e5d59]">
                Locks conversational chatbot answers safely up to this milestone.
              </p>
            </div>

            <form onSubmit={handleSaveBookmark} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase text-[#5e5d59]">
                  Select Volume
                </label>
                <div className="relative">
                  <select
                    value={targetBookId}
                    onChange={(e) => handleBookChange(Number(e.target.value))}
                    className="w-full appearance-none bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-xl px-4 py-2.5 text-sm font-serif text-[#141413] outline-none transition-all cursor-pointer pr-10"
                  >
                    {library.map((item) => (
                      <option key={item.book.id} value={item.book.id}>
                        {item.book.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#87867f]">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase text-[#5e5d59]">
                    Select Chapter
                  </label>
                  <div className="relative">
                    <select
                      value={targetChapter}
                      onChange={(e) => setTargetChapter(e.target.value)}
                      className="w-full appearance-none bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-xl px-4 py-2.5 text-sm font-serif text-[#141413] outline-none transition-all cursor-pointer pr-10"
                    >
                      {availableChapters.map((chap) => (
                        <option key={chap} value={chap}>
                          {chap}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#87867f]">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase text-[#5e5d59]">
                    Page (pg.)
                  </label>
                  <input
                    type="number"
                    value={targetPage}
                    onChange={(e) => setTargetPage(Number(e.target.value))}
                    placeholder="e.g. 52"
                    className="w-full bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-xl px-4 py-2.5 text-sm font-['Plus_Jakarta_Sans'] text-[#141413] outline-none transition-all"
                  />
                </div>
              </div>

              {bookmarkSuccess && (
                <div className="animate-seal p-3.5 rounded-2xl bg-[#fbeee6] border border-[#c96442]/30 text-[#c96442] text-xs font-['Plus_Jakarta_Sans'] font-semibold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c96442] animate-ping" />
                  <span>Bookmark synchronized to {targetChapter} · pg. {targetPage}!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#c96442] hover:bg-[#b35535] active:scale-[0.98] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-xs cursor-pointer"
              >
                Save Bookmark Horizon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Glance & Deep Entry Slide-out Modal Drawer */}
      {selectedQuickViewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-overlay">
          <div className="relative w-full max-w-2xl bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-modal">
            <button
              onClick={() => setSelectedQuickViewBook(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-2">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
                Quick Glance Dossier
              </span>
              <h2 className="font-serif text-3xl text-[#141413]">
                {selectedQuickViewBook.book.title}
              </h2>
              <p className="font-serif italic text-base text-[#5e5d59]">
                {selectedQuickViewBook.book.author}
              </p>
            </div>

            {/* Book Progress & Safe Horizon Details */}
            <div className="p-4 rounded-2xl bg-[#f5f4ed] border border-[#e8e6dc] flex items-center justify-between text-xs font-['Plus_Jakarta_Sans']">
              <div className="space-y-0.5">
                <span className="text-[#5e5d59] block">Current Reading Horizon:</span>
                <span className="text-sm font-bold text-[#141413]">
                  {selectedQuickViewBook.chapter || "Chapter IV"} · pg. {selectedQuickViewBook.page || 52}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbd0] text-[#7e2c0e] font-bold text-[11px]">
                <ShieldCheck size={14} />
                <span>Spoiler Shield Active</span>
              </div>
            </div>

            {/* Book Brief Overview */}
            <div className="space-y-2">
              <h4 className="font-serif text-lg text-[#141413]">Volume Summary & Key Takeaway</h4>
              <p className="font-serif text-base text-[#5e5d59] leading-relaxed">
                {selectedQuickViewBook.note || "Deep exploration of existential themes and human ambition. Full sliding-window FAISS vector indexes are generated and ready for contextual Q&A."}
              </p>
            </div>

            {/* Action Buttons to Go Deep */}
            <div className="pt-4 border-t border-[#f0eee6] flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  onSelectBook(selectedQuickViewBook.book.id, 'reader');
                  setSelectedQuickViewBook(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <BookOpen size={16} />
                <span>Enter Sanctuary & Ask Q&A</span>
              </button>

              <button
                onClick={() => {
                  onSelectBook(selectedQuickViewBook.book.id, 'summary');
                  setSelectedQuickViewBook(null);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[#e8e6dc] hover:bg-[#f0eee6] text-[#141413] font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]"
              >
                <Sparkles size={16} className="text-[#c96442]" />
                <span>Recall Points</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Ingest Books Drawer Modal */}
      {showAddDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-overlay">
          <div className="relative w-full max-w-xl bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-8 shadow-2xl space-y-6 animate-modal">
            <button
              onClick={() => setShowAddDrawer(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
                Ingestion Engine
              </span>
              <h3 className="font-serif text-2xl text-[#141413]">
                Add Volume to Sanctuary
              </h3>
            </div>

            {/* Gutenberg Search */}
            <form onSubmit={onSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Gutenberg title, thinker, or ID..."
                  className="w-full bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-2xl pl-4 pr-12 py-3 text-sm font-sans text-[#141413] outline-none"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-2 top-2.5 p-2 text-[#5e5d59] hover:text-[#c96442] cursor-pointer"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Upload File */}
            <div className="pt-2">
              <label className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[#87867f]/30 hover:border-[#c96442] hover:bg-[#f0eee6] transition-all cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
                <Upload size={18} />
                <span>Upload Local EPUB or PDF</span>
                <input type="file" accept=".epub,.pdf" className="hidden" onChange={onUploadBook} />
              </label>
            </div>

            {/* Catalog Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-56 overflow-y-auto space-y-2 pt-2 border-t border-[#f0eee6]">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-wider text-[#5e5d59]">
                  Results
                </span>
                {searchResults.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f5f4ed] text-xs border border-[#e8e6dc]"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-serif text-sm font-medium text-[#141413] truncate">{res.title}</p>
                      <p className="font-sans text-[11px] text-[#5e5d59] truncate">{res.authors?.[0]?.name || "Unknown"}</p>
                    </div>
                    <button
                      onClick={() => {
                        onAddBook(res.id);
                        setShowAddDrawer(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-[11px] font-bold uppercase cursor-pointer"
                    >
                      Ingest
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
