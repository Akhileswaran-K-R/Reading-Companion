import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Plus } from 'lucide-react';
import BookCover3D from '../components/BookCover3D';
import ThreeScene from '../components/ThreeScene';

export default function LandingHeroView({ 
  onEnterSanctuary, 
  onOpenDashboard, 
  featuredBook,
  booksReadCount = 0,
  totalGoal = 12
}) {
  const navigate = useNavigate();
  return (
    <div className="space-y-16 animate-fadeIn">
      {/* =========================================================================
          HERO: READ WITH INTENT (WARM EDITORIAL + 3D FOLIO)
      ========================================================================= */}
      <section className="relative overflow-hidden pt-6 pb-12">
        {/* Three.js Background Ambient Mesh */}
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-[550px] opacity-40 pointer-events-none z-0">
          <ThreeScene />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Statement */}
          <div className="lg:col-span-7 space-y-8">
            {/* Monumental Headline */}
            <div className="space-y-4">
              <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl text-[#141413] font-normal tracking-tight leading-[0.98]">
                Read with <br />
                <span className="italic text-[#c96442]">Intent.</span>
              </h1>
              <p className="font-serif text-xl sm:text-2xl text-[#5e5d59] font-normal max-w-xl pt-2 leading-relaxed">
                A sanctuary for habit-forming readers. Spoiler-guarded conversational marginalia bounded to your bookmark, and instant points of recall.
              </p>
            </div>

            {/* Metric Banner: Clean & Typographic */}
            <div className="flex flex-wrap items-center gap-8 py-4 border-y border-[#e8e6dc]">
              <div>
                <span className="font-serif text-5xl font-normal text-[#141413] block">
                  {booksReadCount}
                  <span className="text-2xl text-[#5e5d59] font-light"> / {totalGoal}</span>
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
                  Volumes Mastered This Year
                </span>
              </div>

              <div className="h-10 w-px bg-[#e8e6dc] hidden sm:block"></div>

              <div>
                <span className="font-serif text-5xl font-normal text-[#c96442] block">
                  {featuredBook?.percent !== undefined ? `${featuredBook.percent}%` : '0%'}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#5e5d59]">
                  {featuredBook ? `Active Folio: ${featuredBook.currentChapter} · pg. ${featuredBook.page}` : 'Active Folio: No volume active'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {featuredBook ? (
                <button
                  onClick={() => onEnterSanctuary ? onEnterSanctuary() : navigate(`/reader/${featuredBook.id}`)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <span>Resume Reading</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/ingest')}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#c96442] hover:bg-[#b35535] text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Ingest a Book</span>
                </button>
              )}

              <button
                onClick={() => onOpenDashboard ? onOpenDashboard() : navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#faf9f5] border border-[#e8e6dc] hover:bg-[#f0eee6] text-[#141413] font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                <Sparkles size={16} className="text-[#c96442]" />
                <span>Reading Ledger</span>
              </button>
            </div>
          </div>

          {/* Right Hero Folio: 3D Tilting Book Cover */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative z-10">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-[#c96442]/10 blur-2xl pointer-events-none"></div>

              <BookCover3D
                title={featuredBook?.title || "Your Sanctuary Awaits"}
                author={featuredBook?.author || "Empty Library Shelf"}
                chapter={featuredBook?.currentChapter || "Volume I"}
                chapterPage={featuredBook?.page || 0}
                chapterPages={featuredBook?.chapterPages}
                bookPage={featuredBook?.bookPage || featuredBook?.page || 0}
                page={featuredBook?.bookPage || featuredBook?.page || 0}
                totalPages={featuredBook?.totalPages || 0}
                coverColor="#231f20"
                accentColor="#c89d36"
                coverImage={featuredBook?.coverArt || null}
                onClick={() => onEnterSanctuary ? onEnterSanctuary() : navigate(featuredBook?.id ? `/reader/${featuredBook.id}` : '/ingest')}
              />
            </div>

            <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#87867f] mt-8 text-center uppercase tracking-wider font-semibold">
              {featuredBook ? "Hover to tilt physical binding · Click cover to resume reading" : "Hover to tilt binding · Click to ingest your first book"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
