import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Library from './pages/Library';
import Reader from './pages/Reader';
import { BookOpen, Library as LibraryIcon } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center text-blue-600 font-bold text-xl gap-2">
                  <BookOpen size={24} />
                  Reading Companion
                </div>
                <div className="ml-6 flex space-x-8">
                  <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    <LibraryIcon size={16} className="mr-2" />
                    Library
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/reader/:bookId" element={<Reader />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
