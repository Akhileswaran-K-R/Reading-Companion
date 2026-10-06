import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Library from './pages/Library';
import Reader from './pages/Reader';
import { BookOpen, Library as LibraryIcon } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(43,37,35,0.04)]">
          <div className="h-20 max-w-[1440px] w-full mx-auto px-space-md sm:px-margin-desktop flex items-center justify-between gap-space-lg">
            
            <div className="flex items-center gap-space-md shrink-0">
              <span className="font-headline-lg text-headline-lg text-primary tracking-tight">Bookie</span>
            </div>
            
            <div className="flex-1 max-w-sm hidden xl:block">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-space-md text-outline pointer-events-none select-none text-[18px]">search</span>
                <input className="w-full h-10 pl-10 pr-12 rounded-xl bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Search books, thinkers, ISBN..." type="text"/>
                <span className="absolute right-space-sm px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-outline select-none">⌘K</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center gap-space-lg">
              <Link to="/reader/none" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-1">Reading Studio</Link>
              <Link to="/" className="transition-colors py-1 text-primary font-label-md underline underline-offset-8 decoration-2 decoration-primary-container">Library & Ledger</Link>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-1" href="#">Reflections & Inquiries</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-1" href="#">Marginalia Archive</a>
            </nav>
            
            <div className="flex items-center gap-space-md shrink-0">
              <button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-md bg-primary-container text-on-primary hover:bg-primary transition-colors" type="button">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="font-label-md text-label-md">Log Progress</span>
              </button>
              <div className="hidden sm:flex items-center gap-space-xs pl-space-xs">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">In Folio</span>
              </div>
              <div className="pl-space-xs">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline flex items-center justify-center font-bold text-on-surface">
                  B
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full pt-20 bg-surface flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/reader/:bookId" element={<Reader />} />
          </Routes>
        </main>
        
        <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(43,37,35,0.02)] mt-margin-desktop">
          <div className="max-w-[1440px] w-full mx-auto px-space-md sm:px-margin-desktop py-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="font-title-editorial text-title-editorial text-primary">Bookie</span>
              <span className="font-body-sm text-body-sm text-outline">— An Intentional Reader's Archival Companion</span>
            </div>
            <div className="flex items-center gap-space-lg">
              <span className="font-label-sm text-label-sm text-outline">Crafted for deep contemplation</span>
              <span className="font-label-sm text-label-sm text-outline">© 2026 Bookie Folio</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
