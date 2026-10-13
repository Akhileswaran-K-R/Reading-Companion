import React from 'react';
import { Trophy, BookOpen, Flame, ArrowRight } from 'lucide-react';

export default function DashboardView({ library, onOpenBook }) {
  const completedBooks = library.filter(b => b.status === 'completed');
  
  const totalPagesRead = library.reduce((acc, b) => acc + (b.page || (b.status === 'completed' ? (b.totalPages || 300) : 50)), 0);
  const totalBooksCount = library.length || 3;
  const completedCount = completedBooks.length;
  
  return (
    <div className="space-y-12 max-w-6xl mx-auto animate-fadeIn">
      {/* Dashboard Monumental Header */}
      <div className="border-b border-[#e8e6dc] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
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
      </div>

      {/* Metrics Triad (Clarified, Warm Editorial Style) */}
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
            Averaging 32 pg. per session across your active library volumes.
          </p>
        </div>

        <div className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-8 space-y-4 shadow-[0_2px_12px_-2px_rgba(20,20,19,0.02)]">
          <div className="flex items-center justify-between text-[#c96442]">
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider">Active Streak</span>
            <Flame size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-5xl text-[#141413]">14</span>
            <span className="font-serif italic text-lg text-[#5e5d59]">days streak</span>
          </div>
          <p className="font-sans text-xs text-[#5e5d59] leading-relaxed pt-3">
            Read daily to maintain consistent reading habits and recall retention.
          </p>
        </div>
      </div>

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
                      {item.book.total_chunks || 198} Chunks
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

                <div className="pt-6 mt-4 border-t border-[#f0eee6] flex items-center justify-between">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#5e5d59]">
                    Status: 100% Read
                  </span>
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
