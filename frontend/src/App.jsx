import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import LandingHeroView from './pages/LandingHeroView';
import SanctuaryDeckView from './pages/SanctuaryDeckView';
import DashboardView from './pages/DashboardView';
import Reader from './pages/Reader';
import SummaryView from './pages/SummaryView';
import BookmarkView from './pages/BookmarkView';
import IngestView from './pages/IngestView';
import { getLibrary, setActiveBook } from './api/client';
import { Feather, Layers, BarChart3 } from 'lucide-react';

export default function App() {
  const location = useLocation();

  const [library, setLibrary] = useState([]);

  // Active book derived directly from backend SQL status ('currently_reading')
  const activeSqlItem = library.find(i => i.is_current || i.status === 'currently_reading') || library[0] || null;
  const activeBookId = activeSqlItem?.book?.id || null;

  // Dynamically prioritize book from URL route if present (/reader/:bookId, /summary/:bookId, /bookmark/:bookId)
  const routeMatch = location.pathname.match(/\/(?:reader|summary|bookmark)\/(\d+)/);
  const routeBookId = routeMatch ? Number(routeMatch[1]) : null;

  const currentBookId = routeBookId || activeBookId;

  const activeReadingItem = (routeBookId ? library.find(i => i.book.id === routeBookId) : null)
    || activeSqlItem
    || null;

  const featuredBook = activeReadingItem ? {
    id: activeReadingItem.book.id,
    title: activeReadingItem.book.title,
    author: activeReadingItem.book.author,
    currentChapter: activeReadingItem.chapter || "Chapter I",
    page: activeReadingItem.page || 1,
    chapterPages: activeReadingItem.chapterPages || 1,
    bookPage: activeReadingItem.bookPage || activeReadingItem.page || 1,
    totalPages: activeReadingItem.totalPages || 100,
    percent: activeReadingItem.percent ?? 0,
    coverArt: activeReadingItem.book.cover_image || null
  } : null;

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      const res = await getLibrary();
      if (res.data && res.data.length > 0) {
        setLibrary(res.data);
      } else {
        setLibrary([]);
      }
    } catch {
      setLibrary([]);
    }
  };

  const handleSetActiveBook = async (bookId) => {
    try {
      await setActiveBook(bookId);
      await loadLibraryData();
    } catch (err) {
      console.warn("Could not update active book in SQL:", err);
    }
  };

  const handleUpdateLibraryBookmark = (bookId, chapter, page) => {
    setLibrary((prev) =>
      prev.map((item) => {
        if (item.book.id === bookId) {
          return {
            ...item,
            chapter: chapter || item.chapter,
            page: page || item.page,
          };
        }
        return item;
      })
    );
    loadLibraryData();
  };

  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#141413] font-sans flex flex-col selection:bg-[#ffdbd0] selection:text-[#390b00]">
      {/* Top Editorial Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#f5f4ed]/90 backdrop-blur-md border-b border-[#e8e6dc]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand Anchor */}
          <Link 
            to="/" 
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-[#c96442] hover:bg-[#b35535] flex items-center justify-center text-white transition-colors shadow-xs">
              <Feather size={18} strokeWidth={2.4} />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-normal tracking-tight text-[#141413]">
                Bookie
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] tracking-widest uppercase text-[#5e5d59] font-bold -mt-1">
                Reading Companion
              </span>
            </div>
          </Link>

          {/* Central Route-Driven View Switcher */}
          <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#faf9f5] border border-[#e8e6dc]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#c96442] text-white shadow-xs'
                    : 'text-[#5e5d59] hover:text-[#141413]'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/sanctuary"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#c96442] text-white shadow-xs'
                    : 'text-[#5e5d59] hover:text-[#141413]'
                }`
              }
            >
              <Layers size={13} />
              <span>Sanctuary Deck</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#c96442] text-white shadow-xs'
                    : 'text-[#5e5d59] hover:text-[#141413]'
                }`
              }
            >
              <BarChart3 size={13} />
              <span>Dashboard</span>
            </NavLink>
          </nav>

          {/* Right Horizon Coordinate: Dynamic Active Reading Session */}
          <div className="hidden md:flex items-center gap-3">
            {featuredBook ? (
              <Link
                to={`/reader/${featuredBook.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f5] border border-[#e8e6dc] hover:border-[#c96442] hover:bg-white text-xs transition-all shadow-xs group cursor-pointer"
                title={`Resume reading: ${featuredBook.title}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#c96442] group-hover:scale-125 transition-transform shrink-0"></span>
                <span className="font-['Plus_Jakarta_Sans'] text-[#5e5d59] font-medium shrink-0">Session:</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[#141413] text-xs font-bold group-hover:text-[#c96442] transition-colors truncate max-w-[170px]">
                  {featuredBook.title}
                </span>
                <span className="text-[#87867f] text-[11px] font-mono shrink-0">·</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[#c96442] text-xs font-semibold shrink-0">
                  {featuredBook.currentChapter}
                </span>
                <span className="text-[#87867f] text-[11px] font-mono shrink-0">·</span>
                <span className="font-['Plus_Jakarta_Sans'] text-[#5e5d59] text-xs font-medium shrink-0">
                  pg. {featuredBook.page}
                </span>
              </Link>
            ) : (
              <Link
                to="/sanctuary"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f5] border border-[#e8e6dc] text-xs text-[#5e5d59] hover:text-[#141413] transition-all shadow-xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#87867f]"></span>
                <span className="font-['Plus_Jakarta_Sans'] font-medium">Session: Select Volume</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Surface Viewport - Driven by React Router */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        <Routes>
          <Route
            path="/"
            element={
              <LandingHeroView
                featuredBook={featuredBook}
                booksReadCount={library.filter(b => b.status === 'completed').length}
                totalGoal={Math.max(12, library.length + 5)}
              />
            }
          />

          <Route
            path="/sanctuary"
            element={
              <SanctuaryDeckView
                library={library}
                activeBookId={activeBookId}
                onSetActiveBook={handleSetActiveBook}
                onReloadLibrary={loadLibraryData}
              />
            }
          />

          <Route
            path="/dashboard"
            element={
              <DashboardView
                library={library}
                activeBookId={activeBookId}
                onSetActiveBook={handleSetActiveBook}
                onReloadLibrary={loadLibraryData}
              />
            }
          />

          <Route
            path="/reader/:bookId?"
            element={
              <Reader 
                bookId={currentBookId} 
                onUpdateBookmark={handleUpdateLibraryBookmark} 
              />
            }
          />

          <Route
            path="/summary/:bookId?"
            element={<SummaryView bookId={currentBookId} />}
          />

          <Route
            path="/bookmark/:bookId?"
            element={
              <BookmarkView
                library={library}
                activeBookId={activeBookId}
                onUpdateBookmark={handleUpdateLibraryBookmark}
              />
            }
          />

          <Route
            path="/ingest"
            element={<IngestView onReloadLibrary={loadLibraryData} />}
          />

          {/* Catch-all redirect to Home */}
          <Route
            path="*"
            element={<LandingHeroView featuredBook={featuredBook} />}
          />
        </Routes>
      </main>
    </div>
  );
}
