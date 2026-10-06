import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLibrary } from '../api/client';
import { Search, Plus, Upload, Book, Loader, BookOpen } from 'lucide-react';

export default function Library() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLibrary()
      .then(res => {
        setBooks(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleContinueReading = (bookId) => {
    navigate(`/reader/${bookId}`);
  };

  // Dynamically split books to simulate reading progress states
  const activeBooks = books.slice(0, 2);
  const finishedBooks = books.slice(2);

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="max-w-[1440px] w-full mx-auto px-space-md sm:px-margin-desktop py-space-xl space-y-space-xl">
        {/* Top Archival Ledger Spread (Hero Card) */}
        <section className="bg-surface-container rounded-xl shadow-sm p-space-lg sm:p-space-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-space-xl relative z-10">
            {/* Left: Vignette & Core Archival Count */}
            <div className="flex flex-col sm:flex-row items-center gap-space-lg text-center sm:text-left">
              <div className="relative w-36 h-36 shrink-0 rounded-lg bg-surface-container-low shadow-sm flex items-center justify-center p-space-sm overflow-hidden">
                <img className="w-full h-full object-contain" alt="Delicate vintage botanical engraving" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzW6GMIVtOZ8v_2OmcVboK_bSZq0SEs8oYDSYd9sxBRXrHwrIhY9widnqQX531Yf53AwSSTJpFYd2JCsH_OWq9fjmusfUisVFSwYQIt7yWbdjw2QAr7Zq9XmBc1XJXfDagnHeh6iUs7PpVvO60zzdW5nxq3OUYqZ4ftv_MxTDvL3c90q2FBHzzzx1PxHgunm_Lm7WIRVU74UZLO3ZQp3CG0-39jUX9hLZtqh71oOacWl4QShvpYkCZ"/>
              </div>
              <div className="space-y-space-xs max-w-md">
                <div className="flex items-center justify-center sm:justify-start gap-space-xs">
                  <span className="font-label-eyebrow text-label-eyebrow text-primary uppercase tracking-widest">Annual Ledger</span>
                  <span className="text-outline text-body-sm">•</span>
                  <span className="font-label-sm text-label-sm text-outline tracking-wider">MCMXXVI / 2026</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  <span className="font-display-lg text-display-lg text-primary mr-1">{books.length}</span>
                  <span className="text-on-surface-variant font-headline-md text-headline-md font-normal">volumes in library</span>
                </h1>
                <p className="font-title-editorial text-title-editorial italic text-on-surface-variant leading-relaxed">
                  “A quiet pace yields deep roots. Every book added is a new journey.”
                </p>
                <div className="pt-space-xs">
                  <div className="w-full sm:w-72 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{width: `${Math.min((books.length / 24) * 100, 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Tactile Reading Rhythms (Inline Sparkline & Stats) */}
            <div className="w-full lg:w-auto grid grid-cols-3 gap-space-md sm:gap-space-lg bg-surface-container-lowest/80 rounded-lg p-space-md shadow-sm">
              <div className="flex flex-col">
                <span className="font-label-eyebrow text-label-eyebrow text-outline uppercase tracking-wider">Library Size</span>
                <span className="font-headline-md text-headline-md text-on-surface mt-1">{books.length}</span>
                <span className="font-body-sm text-body-sm text-secondary flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">book</span> volumes
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-eyebrow text-label-eyebrow text-outline uppercase tracking-wider">Sanctuary Streak</span>
                <span className="font-headline-md text-headline-md text-on-surface mt-1">28 <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">days</span></span>
                <span className="font-body-sm text-body-sm text-outline mt-0.5">Daily dusk folio</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-eyebrow text-label-eyebrow text-outline uppercase tracking-wider">Primary Affinity</span>
                <span className="font-headline-md text-headline-md text-on-surface mt-1 truncate max-w-[110px]">Lit. Fiction</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace Split: Left Reading Desk (8 cols) & Right Curator's Shelf (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Primary Reading Dossier (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-space-xl">
            {/* Active Spines: Currently Reading Feature */}
            <div className="space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary tracking-widest">Active Spines</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Currently Reading</h2>
                </div>
                {activeBooks.length > 0 && (
                    <a className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors flex items-center gap-space-xs" href="#">
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    <span>12 Marginalia Notes</span>
                    </a>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                    <Loader className="animate-spin mb-4" size={32} />
                    <p className="font-label-md text-label-md">Loading your volumes...</p>
                </div>
              ) : activeBooks.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-space-xl flex flex-col items-center text-center text-on-surface-variant shadow-sm">
                    <BookOpen size={48} className="mb-4 text-primary opacity-60" strokeWidth={1} />
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Active Volumes</h3>
                    <p className="font-body-md text-body-md text-outline max-w-sm">
                        Your desk is clear. Select a volume from your library or add a new one to begin your reading journey.
                    </p>
                </div>
              ) : activeBooks.map((book) => (
                <div key={book.id} className="bg-surface-container-low rounded-xl shadow-md p-space-md sm:p-space-lg flex flex-col sm:flex-row gap-space-lg relative group transition-all duration-300">
                  {/* Spine Mockup */}
                  <div className="w-full sm:w-44 h-64 shrink-0 rounded-md overflow-hidden shadow-[0_8px_20px_rgba(43,37,35,0.12)] relative bg-surface-container flex items-center justify-center">
                    <BookOpen size={40} className="text-primary opacity-80" strokeWidth={1} />
                    <div className="absolute top-2 left-2 px-space-xs py-0.5 rounded bg-surface/90 backdrop-blur-sm shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span className="font-label-sm text-label-sm text-on-surface">Ch. 1</span>
                    </div>
                  </div>
                  {/* Content Ledger */}
                  <div className="flex-1 flex flex-col justify-between py-space-xs">
                    <div className="space-y-space-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{book.author}</span>
                        <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full">Spoiler-Safe Enabled</span>
                      </div>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight leading-snug">
                        {book.title}
                      </h3>
                      <p className="font-title-editorial text-title-editorial italic text-on-surface-variant">
                        “{book.description ? book.description.substring(0, 80) + "..." : "A new journey awaits."}”
                      </p>
                    </div>
                    {/* Progress bar & metrics */}
                    <div className="space-y-space-sm pt-space-md">
                      <div className="flex items-center justify-between font-label-md text-label-md">
                        <span className="text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-outline">menu_book</span>
                          Page 1 of {book.total_pages || '?'}
                        </span>
                        <span className="text-primary font-bold">1% Complete</span>
                      </div>
                      <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{width: '1%'}}></div>
                      </div>
                      <div className="flex items-center justify-between pt-space-xs text-outline font-body-sm text-body-sm">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">schedule</span> ~? hrs remaining
                        </span>
                        <span>Paced at 48 pgs/day</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-space-sm pt-space-md">
                      <button onClick={() => handleContinueReading(book.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-md bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm" type="button">
                        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                        <span className="font-label-md text-label-md">Continue Reading</span>
                      </button>
                      <button className="p-space-sm rounded-md bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors shadow-sm" title="Log Marginalia Quote" type="button">
                        <span className="material-symbols-outlined text-[20px]">rate_review</span>
                      </button>
                      <button className="p-space-sm rounded-md bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors shadow-sm" title="Spoiler-safe Inquiry Desk" type="button">
                        <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Finished Volumes: Autumn Recents */}
            <div className="space-y-space-md pt-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary tracking-widest">Other Volumes</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Archive & Queue</h2>
                </div>
                <a className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors flex items-center gap-1" href="#">
                  <span>Full archive</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
              
              {!loading && finishedBooks.length === 0 && (
                <div className="text-center p-space-md bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant text-outline">
                  No other volumes found in your archive.
                </div>
              )}

              {/* Editorial Grid of Completed/Other Books */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {finishedBooks.map(book => (
                  <div key={book.id} className="bg-surface-container-low rounded-lg p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div className="flex gap-space-md">
                      <div className="w-20 h-28 shrink-0 rounded bg-surface-container overflow-hidden shadow-sm flex items-center justify-center">
                        <BookOpen size={24} className="text-primary opacity-50" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm text-outline">Archived</span>
                          <span className="flex items-center text-primary font-label-md text-label-md gap-0.5">
                            <span className="material-symbols-outlined text-[15px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span> 5.0
                          </span>
                        </div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight line-clamp-2">{book.title}</h4>
                        <p className="font-body-sm text-body-sm text-outline truncate">{book.author}</p>
                        <div className="pt-1 flex flex-wrap gap-1">
                          <span className="font-label-sm text-label-sm bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">Archived</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-space-md pt-space-xs bg-surface-container-lowest/60 rounded p-space-xs">
                      <p className="font-title-editorial text-title-editorial italic text-on-surface-variant text-xs leading-relaxed line-clamp-2">
                        “{book.description ? book.description : "No description available."}”
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Curator's Desk & Wishlist Shelf (Right 4 Cols) */}
          <aside className="lg:col-span-4 space-y-space-lg">
            {/* Shelf Header */}
            <div className="bg-surface-container rounded-xl p-space-lg shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary tracking-widest">Anticipated</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Desk Wishlist</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">Mock Data</span>
              </div>
              <p className="font-body-sm text-body-sm text-outline leading-relaxed">
                Reserved tomes awaiting physical room on your reading blotter before winter solstice.
              </p>
              {/* List of Wishlist Volumes */}
              <div className="space-y-space-md pt-space-xs">
                {/* Wishlist 1 */}
                <div className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex items-center gap-space-sm group">
                  <div className="w-12 h-16 shrink-0 rounded bg-surface-container overflow-hidden shadow-sm flex items-center justify-center">
                    <BookOpen size={16} className="text-outline opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-headline-sm text-headline-sm text-on-surface truncate">When We Cease to Understand the World</h5>
                    <p className="font-body-sm text-body-sm text-outline truncate">Benjamín Labatut</p>
                    <span className="font-label-sm text-label-sm text-secondary">Awaiting queue</span>
                  </div>
                  <button className="shrink-0 p-space-xs rounded bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface-variant transition-colors" title="Add to Desk" type="button">
                    <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                  </button>
                </div>
                {/* Wishlist 2 */}
                <div className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex items-center gap-space-sm group">
                  <div className="w-12 h-16 shrink-0 rounded bg-surface-container overflow-hidden shadow-sm flex items-center justify-center">
                    <BookOpen size={16} className="text-outline opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-headline-sm text-headline-sm text-on-surface truncate">Staring at the Sun</h5>
                    <p className="font-body-sm text-body-sm text-outline truncate">Irvin D. Yalom</p>
                    <span className="font-label-sm text-label-sm text-secondary">Philosophical inquiry</span>
                  </div>
                  <button className="shrink-0 p-space-xs rounded bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface-variant transition-colors" title="Add to Desk" type="button">
                    <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                  </button>
                </div>
              </div>
              <button className="w-full py-space-sm rounded-md bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md flex items-center justify-center gap-space-xs mt-space-sm" type="button">
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Procure New Volume</span>
              </button>
            </div>
            {/* Archival Quote & Annotation Prompt */}
            <div className="bg-surface-container-high/60 rounded-xl p-space-lg shadow-sm space-y-space-sm relative overflow-hidden">
              <span className="material-symbols-outlined absolute -bottom-3 -right-2 text-surface-variant text-[90px] select-none pointer-events-none opacity-40">format_quote</span>
              <span className="font-label-eyebrow text-label-eyebrow uppercase text-primary tracking-widest">Archivist's Motto</span>
              <p className="font-title-editorial text-title-editorial italic text-on-surface leading-snug">
                “We read not to consume pages, but to dwell in sentences that remember who we were.”
              </p>
              <div className="pt-space-xs flex items-center justify-between text-outline font-label-sm text-label-sm">
                <span>Folio No. 2026-IV</span>
                <span>Oxford Stacks</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
