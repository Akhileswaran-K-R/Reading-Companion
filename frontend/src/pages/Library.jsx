import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLibrary, searchBooks, addBook, uploadBook, updateLibrary, askQuestion } from '../api/client';
import { Search, Plus, Upload, BookOpen, Sparkles, Bookmark, ArrowRight, ShieldCheck, CheckCircle2, Send, CornerDownLeft, Filter } from 'lucide-react';

export default function Library() {
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Hero Quick-Question State
  const [heroPrompt, setHeroPrompt] = useState('');
  const [heroAnswer, setHeroAnswer] = useState(null);
  const [heroLoading, setHeroLoading] = useState(false);

  // The Living Folio: Featured Active Reading Horizon
  const featuredVolume = {
    id: 1,
    title: "Frankenstein; or, The Modern Prometheus",
    author: "Mary Wollstonecraft Shelley",
    currentChapter: "Chapter IV",
    page: 52,
    totalPages: 280,
    progressPercent: 51,
    coverArt: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=700",
    excerpt: "Two years passed in this manner, during which I paid no visit to Geneva, but was engaged, heart and soul, in the pursuit of some discoveries which I hoped to make. None but those who have experienced them can conceive of the enticements of science.",
    citationChunk: 15
  };

  const sampleCollection = [
    {
      book: {
        id: 1,
        title: "Frankenstein; or, The Modern Prometheus",
        author: "Mary Wollstonecraft Shelley",
        status: "ready",
        total_chunks: 142,
        cover_image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
      },
      status: "currently_reading",
      chapter: "Chapter IV",
      page: 52,
      totalPages: 280,
      percent: 51,
      note: "Exploring the generation of life in the laboratory."
    },
    {
      book: {
        id: 2,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        status: "ready",
        total_chunks: 198,
        cover_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
      },
      status: "completed",
      chapter: "Chapter LXI",
      page: 340,
      totalPages: 340,
      percent: 100,
      note: "Full chapter recall points and narrative synthesis ready."
    },
    {
      book: {
        id: 3,
        title: "The Picture of Dorian Gray",
        author: "Oscar Wilde",
        status: "ready",
        total_chunks: 110,
        cover_image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600"
      },
      status: "to_read",
      chapter: "Chapter I",
      page: 1,
      totalPages: 254,
      percent: 0,
      note: "Lord Henry’s aesthetic philosophy at Basil Hallward's studio."
    }
  ];

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const { data } = await getLibrary();
      if (data && data.length > 0) {
        setLibrary(data);
      } else {
        setLibrary(sampleCollection);
      }
    } catch (e) {
      setLibrary(sampleCollection);
    }
  };

  const handleHeroQuery = async (e) => {
    e?.preventDefault();
    if (!heroPrompt.trim() || heroLoading) return;
    setHeroLoading(true);
    setHeroAnswer(null);

    try {
      const res = await askQuestion(featuredVolume.id, heroPrompt);
      if (res.data?.answer) {
        setHeroAnswer(res.data.answer);
      } else {
        throw new Error();
      }
    } catch {
      // Offline fallback simulation
      setTimeout(() => {
        let text = "At this point in Chapter IV, Victor is solely consumed with chemistry and bodily anatomy at Ingolstadt. His professors Waldman and Krempe provided the foundational encouragement.";
        if (heroPrompt.toLowerCase().includes("monster") || heroPrompt.toLowerCase().includes("creature")) {
          text = "Victor has not yet given breath to his creation. That momentous turning point unfolds in Chapter V. Keep reading!";
        }
        setHeroAnswer(text);
        setHeroLoading(false);
      }, 600);
      return;
    }
    setHeroLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await searchBooks(searchQuery);
      setSearchResults(data.results || []);
    } catch {
      // Keep state clean
    }
    setSearching(false);
  };

  const handleAddBook = async (gutenbergId) => {
    try {
      const { data: book } = await addBook(gutenbergId);
      await updateLibrary(book.id, 'currently_reading');
      loadLibrary();
      setSearchResults([]);
      setSearchQuery('');
    } catch {
      alert("Unable to ingest selected book.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { data: book } = await uploadBook(file);
      await updateLibrary(book.id, 'currently_reading');
      loadLibrary();
    } catch {
      alert("File upload failed. Ensure the format is EPUB or PDF.");
    }
  };

  const filteredItems = library.filter((item) => {
    if (activeFilter === 'reading') return item.status === 'currently_reading';
    if (activeFilter === 'completed') return item.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-16 pb-12">
      {/* =========================================================================
          HERO SANCTUARY CENTERPIECE: THE LIVING FOLIO DESK
          A monumental, tactile open-folio centerpiece acting as the visual anchor.
      ========================================================================= */}
      <section className="relative">
        {/* Subtle Ambient Paper Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-[#e8e6dc]/50 blur-xl opacity-70 pointer-events-none"></div>

        <div className="relative bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl shadow-[0_4px_24px_-4px_rgba(20,20,19,0.04)] overflow-hidden">
          {/* Folio Header Spine */}
          <div className="px-8 py-5 border-b border-[#f0eee6] bg-[#fbf9f2] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c96442]"></span>
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#141413]">
                Sanctuary Horizon
              </span>
              <span className="text-[#87867f]">·</span>
              <span className="font-mono text-xs text-[#5e5d59]">
                Active Bookmark at {featuredVolume.currentChapter}, p. {featuredVolume.page}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbd0] text-[#7e2c0e] font-sans text-xs font-semibold">
                <ShieldCheck size={14} />
                <span>Spoiler Shield Locked</span>
              </div>
            </div>
          </div>

          {/* Living Folio Open Desk (Two-Wing Architectural Spread) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#f0eee6]">
            {/* Left Wing: The Tactile Volume & Reading Resume */}
            <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-8 bg-[#faf9f5]">
              <div className="space-y-4">
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#c96442] block">
                  Currently Open On Your Desk
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#141413] font-normal leading-[1.15] tracking-tight">
                  {featuredVolume.title}
                </h1>
                <p className="font-serif italic text-lg text-[#5e5d59]">
                  {featuredVolume.author}
                </p>

                {/* Habit Gauge */}
                <div className="pt-4 space-y-2 max-w-md">
                  <div className="flex items-center justify-between text-xs font-sans text-[#5e5d59]">
                    <span className="font-mono font-medium">
                      {featuredVolume.currentChapter} · pg. {featuredVolume.page} of {featuredVolume.totalPages}
                    </span>
                    <span className="font-bold text-[#141413]">
                      {featuredVolume.progressPercent}% completed
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c96442] rounded-full transition-all duration-700"
                      style={{ width: `${featuredVolume.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Conduit */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/reader/${featuredVolume.id}`}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#c96442] hover:bg-[#d97757] text-[#faf9f5] font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-[0.99]"
                >
                  <BookOpen size={16} />
                  <span>Resume Reading Session</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to={`/summary/${featuredVolume.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-[#e8e6dc] hover:bg-[#f0eee6] text-[#141413] font-sans text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Sparkles size={15} className="text-[#c96442]" />
                  <span>View Recall Dossier</span>
                </Link>
              </div>
            </div>

            {/* Right Wing: The Living Marginalia Excerpt & Immediate Query Desk */}
            <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-[#fdfcf9]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#5e5d59]">
                    Where You Left Off
                  </span>
                  <span className="font-mono text-xs text-[#87867f]">
                    Excerpt · Chunk #{featuredVolume.citationChunk}
                  </span>
                </div>

                {/* Exact Reading Excerpt */}
                <blockquote className="border-l-2 border-[#c96442] pl-4 py-1">
                  <p className="font-serif text-lg sm:text-[19px] leading-relaxed text-[#141413] italic">
                    "{featuredVolume.excerpt}"
                  </p>
                </blockquote>

                {/* Answer Banner if query executed */}
                {heroAnswer && (
                  <div className="p-4 rounded-2xl bg-[#f5f4ed] border border-[#e8e6dc] space-y-1 animate-fadeIn">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#c96442]">
                      Spoiler-Free Response
                    </span>
                    <p className="font-serif text-sm text-[#141413] leading-relaxed">
                      {heroAnswer}
                    </p>
                  </div>
                )}
              </div>

              {/* Immediate Marginalia Composer */}
              <div className="space-y-2 pt-2">
                <span className="font-sans text-[11px] font-medium text-[#5e5d59] block">
                  Ask a spoiler-guarded question up to Chapter IV:
                </span>
                <form onSubmit={handleHeroQuery} className="relative flex items-center">
                  <input
                    type="text"
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    placeholder="e.g., What was Waldman's advice to Victor?"
                    className="w-full bg-[#faf9f5] border border-[#e8e6dc] focus:border-[#c96442] rounded-2xl pl-4 pr-12 py-3 text-sm font-sans text-[#141413] placeholder-[#87867f] outline-none transition-all shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={heroLoading || !heroPrompt.trim()}
                    className="absolute right-1.5 p-2 rounded-xl bg-[#c96442] hover:bg-[#d97757] text-white disabled:opacity-40 transition-all"
                  >
                    <Send size={15} />
                  </button>
                </form>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroPrompt("Who is Professor Waldman to Victor?");
                    }}
                    className="text-[11px] font-sans text-[#5e5d59] hover:text-[#c96442] underline underline-offset-4 decoration-[#e8e6dc]"
                  >
                    Try: "Who is Waldman?"
                  </button>
                  <span className="text-[#dbdad3]">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroPrompt("Does Victor create the monster here?");
                    }}
                    className="text-[11px] font-sans text-[#5e5d59] hover:text-[#c96442] underline underline-offset-4 decoration-[#e8e6dc]"
                  >
                    Try: "Does he create the creature yet?"
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE LIBRARY REPOSITORY & COLLECTION LEDGER
      ========================================================================= */}
      <section className="space-y-8">
        {/* Section Navigation & Ingestion Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#e8e6dc]">
          <div className="space-y-1">
            <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
              The Reading Ledger
            </span>
            <h2 className="font-serif text-3xl text-[#141413] font-normal tracking-tight">
              Shelves & Volumes
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs (Epilogue) */}
            <div className="inline-flex rounded-xl p-1 bg-[#faf9f5] border border-[#e8e6dc]">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#c96442] text-white shadow-xs'
                    : 'text-[#5e5d59] hover:text-[#141413]'
                }`}
              >
                All Volumes ({library.length})
              </button>
              <button
                onClick={() => setActiveFilter('reading')}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                  activeFilter === 'reading'
                    ? 'bg-[#c96442] text-white shadow-xs'
                    : 'text-[#5e5d59] hover:text-[#141413]'
                }`}
              >
                Active Spines
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                  activeFilter === 'completed'
                    ? 'bg-[#c96442] text-white shadow-xs'
                    : 'text-[#5e5d59] hover:text-[#141413]'
                }`}
              >
                Completed Recalls
              </button>
            </div>

            {/* Quick Upload Drop */}
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#faf9f5] border border-[#e8e6dc] hover:border-[#c96442] text-xs font-sans font-bold uppercase tracking-wider text-[#5e5d59] hover:text-[#141413] transition-all cursor-pointer">
              <Upload size={14} />
              <span>Import EPUB / PDF</span>
              <input type="file" accept=".epub,.pdf" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>

        {/* Gutenberg Search Form Bar */}
        <div className="bg-[#faf9f5] rounded-2xl p-5 border border-[#e8e6dc] space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Project Gutenberg catalog (e.g., Moby Dick, Jane Eyre, 84)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-xl px-4 py-2.5 text-sm font-sans text-[#141413] placeholder-[#87867f] outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 rounded-xl bg-[#141413] hover:bg-[#30312c] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Search size={14} />
              <span>{searching ? 'Querying...' : 'Find Books'}</span>
            </button>
          </form>

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <div className="pt-2 border-t border-[#f0eee6] space-y-2 max-h-60 overflow-y-auto">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#5e5d59]">
                Catalog Matches Ready to Ingest
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f5f4ed] border border-[#e8e6dc] text-xs"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-serif text-sm text-[#141413] font-medium truncate">
                        {res.title}
                      </p>
                      <p className="font-sans text-[11px] text-[#5e5d59] truncate">
                        {res.authors?.[0]?.name || "Unknown Author"} · Gutenberg #{res.id}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddBook(res.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#c96442] hover:bg-[#d97757] text-white font-sans text-[11px] font-bold uppercase tracking-wide transition-all"
                    >
                      Add Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Shelf Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const b = item.book;
            const isCompleted = item.status === 'completed';
            const progress = item.percent ?? (isCompleted ? 100 : 51);

            return (
              <div
                key={b.id}
                className="bg-[#faf9f5] rounded-3xl border border-[#e8e6dc] p-6 shadow-[0_2px_12px_-2px_rgba(20,20,19,0.02)] flex flex-col justify-between hover:border-[#c96442]/60 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-sans text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-[#e8e6dc] text-[#5e5d59]'
                          : 'bg-[#ffdbd0] text-[#7e2c0e]'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Currently Reading'}
                    </span>
                    <span className="font-mono text-xs text-[#87867f]">Vol. #{b.id}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-normal text-[#141413] leading-snug group-hover:text-[#c96442] transition-colors">
                      {b.title}
                    </h3>
                    <p className="font-serif italic text-sm text-[#5e5d59] mt-1">
                      {b.author}
                    </p>
                  </div>

                  {item.note && (
                    <p className="font-sans text-xs text-[#5e5d59] line-clamp-2 italic border-l border-[#e8e6dc] pl-3 py-0.5">
                      "{item.note}"
                    </p>
                  )}

                  {/* Progress Status */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans text-[#5e5d59]">
                      <span className="font-mono text-[11px]">
                        {item.chapter || "Ch. IV"} · {progress}%
                      </span>
                      <span className="font-mono text-[11px]">
                        {item.page || 52}/{item.totalPages || 280} pages
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0eee6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-[#5e5d59]' : 'bg-[#c96442]'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Primary Interaction Buttons (Epilogue) */}
                <div className="mt-6 pt-4 border-t border-[#f0eee6] flex items-center gap-2">
                  <Link
                    to={`/reader/${b.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#c96442] hover:bg-[#d97757] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                  >
                    <BookOpen size={14} />
                    <span>Read Book</span>
                  </Link>

                  <Link
                    to={`/summary/${b.id}`}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#e8e6dc] hover:bg-[#f0eee6] font-sans text-xs font-bold uppercase tracking-wider transition-all ${
                      isCompleted ? 'text-[#c96442]' : 'text-[#5e5d59]'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>{isCompleted ? 'Recall' : 'Summary'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
