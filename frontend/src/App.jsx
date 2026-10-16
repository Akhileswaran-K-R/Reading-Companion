import React, { useState, useEffect } from 'react';
import LandingHeroView from './pages/LandingHeroView';
import SanctuaryDeckView from './pages/SanctuaryDeckView';
import DashboardView from './pages/DashboardView';
import Reader from './pages/Reader';
import SummaryView from './pages/SummaryView';
import { getLibrary, searchBooks, addBook, uploadBook, updateLibrary } from './api/client';
import { Feather, Layers, BarChart3 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeBookId, setActiveBookId] = useState(() => {
    const saved = localStorage.getItem('bookie_active_book_id');
    return saved ? Number(saved) : 1;
  });

  const [library, setLibrary] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const activeReadingItem = library.find(i => i.book.id === activeBookId)
    || library.find(i => i.status === 'currently_reading') 
    || library[0] 
    || null;

  const featuredBook = activeReadingItem ? {
    id: activeReadingItem.book.id,
    title: activeReadingItem.book.title,
    author: activeReadingItem.book.author,
    currentChapter: activeReadingItem.chapter || "Chapter I",
    page: activeReadingItem.page || 1,
    totalPages: activeReadingItem.totalPages || 300,
    percent: activeReadingItem.percent || 0,
    coverArt: activeReadingItem.book.cover_image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=700"
  } : {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    currentChapter: "CHAPTER V.",
    page: 1,
    totalPages: 673,
    percent: 3,
    coverArt: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg"
  };

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      const res = await getLibrary();
      if (res.data && res.data.length > 0) {
        setLibrary(res.data);
        if (!res.data.some(i => i.book.id === activeBookId)) {
          const firstCurrent = res.data.find(i => i.status === 'currently_reading') || res.data[0];
          setActiveBookId(firstCurrent.book.id);
          localStorage.setItem('bookie_active_book_id', String(firstCurrent.book.id));
        }
      } else {
        setLibrary([]);
      }
    } catch {
      setLibrary([]);
    }
  };

  const handleSetActiveBook = async (bookId) => {
    setActiveBookId(bookId);
    localStorage.setItem('bookie_active_book_id', String(bookId));
    const item = library.find(i => i.book.id === bookId);
    if (item && item.status !== 'currently_reading') {
      try {
        await updateLibrary(bookId, 'currently_reading');
        await loadLibraryData();
      } catch (err) {
        console.warn("Could not update library status:", err);
      }
    }
  };

  const handleSelectBook = (bookId, targetView) => {
    setActiveBookId(bookId);
    localStorage.setItem('bookie_active_book_id', String(bookId));
    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchGutenberg = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await searchBooks(searchQuery);
      setSearchResults(data.results || []);
    } catch {
      // Clean fallback
    }
    setSearching(false);
  };

  const handleAddBookGutenberg = async (gutenbergId) => {
    try {
      const { data: book } = await addBook(gutenbergId);
      await updateLibrary(book.id, 'currently_reading');
      loadLibraryData();
      setSearchResults([]);
      setSearchQuery('');
    } catch {
      alert("Unable to ingest book from Gutenberg catalog.");
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { data: book } = await uploadBook(file);
      await updateLibrary(book.id, 'currently_reading');
      loadLibraryData();
    } catch {
      alert("File upload failed. Ensure the format is EPUB or PDF.");
    }
  };

  const handleUpdateLibraryBookmark = (bookId, chapter, page) => {
    setLibrary((prev) =>
      prev.map((item) => {
        if (item.book.id === bookId) {
          const totalPages = item.totalPages || 300;
          const percent = Math.min(100, Math.round((page / totalPages) * 100));
          return {
            ...item,
            chapter,
            page,
            percent
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#141413] font-sans flex flex-col selection:bg-[#ffdbd0] selection:text-[#390b00]">
      {/* Top Editorial Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#f5f4ed]/90 backdrop-blur-md border-b border-[#e8e6dc]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand Anchor */}
          <button 
            onClick={() => setCurrentView('landing')} 
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
          </button>

          {/* Central View Switcher */}
          <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#faf9f5] border border-[#e8e6dc]">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-4 py-1.5 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-[#c96442] text-white shadow-xs'
                  : 'text-[#5e5d59] hover:text-[#141413]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentView('sanctuary')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentView === 'sanctuary'
                  ? 'bg-[#c96442] text-white shadow-xs'
                  : 'text-[#5e5d59] hover:text-[#141413]'
              }`}
            >
              <Layers size={13} />
              <span>Sanctuary Deck</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#c96442] text-white shadow-xs'
                  : 'text-[#5e5d59] hover:text-[#141413]'
              }`}
            >
              <BarChart3 size={13} />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Right Horizon Coordinate */}
          <div className="hidden md:flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#faf9f5] border border-[#e8e6dc] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#c96442]"></span>
              <span className="font-['Plus_Jakarta_Sans'] text-[#5e5d59] font-medium">Session:</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[#141413] text-xs font-bold">
                {featuredBook.currentChapter} · pg. {featuredBook.page}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Surface Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {currentView === 'landing' && (
          <LandingHeroView
            featuredBook={featuredBook}
            onEnterSanctuary={() => setCurrentView('sanctuary')}
            onOpenDashboard={() => setCurrentView('dashboard')}
            booksReadCount={library.filter(b => b.status === 'completed').length}
            totalGoal={Math.max(12, library.length + 5)}
          />
        )}

        {currentView === 'sanctuary' && (
          <SanctuaryDeckView
            library={library}
            onSelectBook={handleSelectBook}
            onAddBook={handleAddBookGutenberg}
            onUploadBook={handleUploadFile}
            onUpdateBookmark={handleUpdateLibraryBookmark}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            onSearch={handleSearchGutenberg}
            searching={searching}
            activeBookId={activeBookId}
            onSetActiveBook={handleSetActiveBook}
            onReloadLibrary={loadLibraryData}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            library={library}
            onOpenBook={handleSelectBook}
            activeBookId={activeBookId}
            onSetActiveBook={handleSetActiveBook}
            onReloadLibrary={loadLibraryData}
          />
        )}

        {currentView === 'reader' && (
          <Reader 
            bookId={activeBookId} 
            onBackToDeck={() => setCurrentView('sanctuary')} 
            onOpenSummary={() => setCurrentView('summary')}
          />
        )}

        {currentView === 'summary' && (
          <SummaryView 
            bookId={activeBookId} 
            onBackToDeck={() => setCurrentView('sanctuary')} 
          />
        )}
      </main>
    </div>
  );
}
