import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Plus, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import BookCover3D from '../components/BookCover3D';

export default function SanctuaryDeckView({ 
  library = [], 
  activeBookId,
  onSetActiveBook
}) {
  const navigate = useNavigate();

  const paletteSpines = [
    { bg: "#1f2d24", accent: "#d4af37" },
    { bg: "#36221c", accent: "#ffdbd0" },
    { bg: "#232634", accent: "#c89d36" },
    { bg: "#3c2a3e", accent: "#e5c07b" },
  ];

  const handleSelectActive = (bookId) => {
    if (onSetActiveBook) {
      onSetActiveBook(bookId);
    }
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
            Physical 3D bookcraft. Hover to tilt bindings. Tap any volume to enter reading mode and conversational marginalia.
          </p>
        </div>

        {/* Section Navigation Actions (Routes instead of overlays) */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/bookmark')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#faf9f5] border border-[#e8e6dc] hover:border-[#c96442] hover:bg-[#f0eee6] text-[#141413] font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <BookmarkPlus size={16} className="text-[#c96442]" />
            <span>Set Bookmark</span>
          </button>

          <button
            onClick={() => navigate('/ingest')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Ingest New Book</span>
          </button>
        </div>
      </div>

      {/* 3D Physical Book Spines Deck Gallery or Empty State */}
      {library.length === 0 ? (
        <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-12 sm:p-16 text-center space-y-6 max-w-2xl mx-auto shadow-xs my-8 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-[#f5f4ed] border border-[#e8e6dc] flex items-center justify-center text-[#c96442] mx-auto shadow-xs">
            <BookOpen size={30} strokeWidth={1.8} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-3xl text-[#141413] font-normal">
              Your Sanctuary is Empty
            </h3>
            <p className="font-serif italic text-base text-[#5e5d59] max-w-md mx-auto leading-relaxed">
              No volumes have been added to your library yet. Search thousands of classic volumes on Project Gutenberg or upload your own EPUB or text file to begin.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/ingest')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Ingest Your First Volume</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center py-6">
          {library.map((item, index) => {
            const b = item.book;
            const styling = paletteSpines[index % paletteSpines.length];
            const isCompleted = item.status === 'completed';
            const isActive = item.is_current || (b.id === activeBookId);

            return (
              <div 
                key={b.id} 
                className={`flex flex-col items-center space-y-4 p-5 rounded-3xl transition-all border ${
                  isActive 
                    ? 'border-[#c96442]/50 bg-[#faf9f5]/80 shadow-md ring-1 ring-[#c96442]/20' 
                    : 'border-transparent hover:border-[#e8e6dc] hover:bg-[#faf9f5]/50'
                }`}
              >
                {/* 3D Tilting Book Cover */}
                <BookCover3D
                  title={b.title}
                  author={b.author}
                  chapter={item.chapter || (isCompleted ? "Completed" : "CHAPTER I")}
                  chapterPage={isCompleted ? null : (item.page || 1)}
                  chapterPages={item.chapterPages}
                  bookPage={isCompleted ? item.totalPages : (item.bookPage || item.page || 1)}
                  page={isCompleted ? item.totalPages : (item.bookPage || item.page || 1)}
                  totalPages={item.totalPages || 100}
                  coverColor={styling.bg}
                  accentColor={styling.accent}
                  coverImage={b.cover_image}
                  onClick={() => navigate(`/reader/${b.id}`)}
                />

                {/* Spine Caption & Status Tag */}
                <div className="text-center space-y-2 max-w-[240px] w-full">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className={`inline-block font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      isCompleted ? 'bg-[#e8e6dc] text-[#5e5d59]' : 'bg-[#ffdbd0] text-[#7e2c0e]'
                    }`}>
                      {isCompleted ? 'Completed' : `${item.percent !== undefined ? item.percent : 0}% Read`}
                    </span>

                    {isActive ? (
                      <span className="inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#fbeee6] text-[#c96442] border border-[#c96442]/30">
                        <BookmarkCheck size={11} />
                        <span>Current</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectActive(b.id)}
                        className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#5e5d59] hover:text-[#c96442] underline cursor-pointer"
                      >
                        Make Active
                      </button>
                    )}
                  </div>
                  
                  {/* Title links directly to Reader */}
                  <h4 
                    onClick={() => navigate(`/reader/${b.id}`)}
                    className="font-serif text-lg text-[#141413] leading-snug line-clamp-1 hover:text-[#c96442] transition-colors cursor-pointer"
                    title="Click to enter Reader and Q&A"
                  >
                    {b.title}
                  </h4>

                  <p className="font-serif italic text-xs text-[#5e5d59]">
                    {b.author}
                  </p>

                  <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#87867f]">
                    {item.chapter || "CHAPTER I"} · pg. {item.page || 1}
                  </p>

                  {/* Direct Action Buttons - Clean In-Flow Navigation */}
                  <div className="pt-2 flex items-center justify-center gap-2 border-t border-[#f0eee6]">
                    <button
                      onClick={() => navigate(`/reader/${b.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#c96442] hover:bg-[#b35535] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                      title="Enter Reader and conversational marginalia"
                    >
                      <BookOpen size={12} />
                      <span>Read</span>
                    </button>

                    <button
                      onClick={() => navigate(`/summary/${b.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#e8e6dc] hover:bg-[#f0eee6] text-[#141413] text-xs font-semibold font-['Plus_Jakarta_Sans'] transition-all cursor-pointer"
                      title="View chapter recall points and milestones"
                    >
                      <Sparkles size={12} className="text-[#c96442]" />
                      <span>Recall</span>
                    </button>

                    <button
                      onClick={() => navigate(`/bookmark/${b.id}`)}
                      className="p-1.5 rounded-xl border border-[#e8e6dc] hover:bg-[#f0eee6] text-[#5e5d59] hover:text-[#c96442] transition-all cursor-pointer"
                      title="Set bookmark position"
                    >
                      <BookmarkPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
