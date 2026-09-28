import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLibrary, searchBooks, addBook, uploadBook, updateLibrary } from '../api/client';
import { Search, Plus, Upload, Book, Loader } from 'lucide-react';

export default function Library() {
  const [library, setLibrary] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reading');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const { data } = await getLibrary();
      setLibrary(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      const { data } = await searchBooks(searchQuery);
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAdd = async (gutenbergId) => {
    try {
      const { data: book } = await addBook(gutenbergId);
      await updateLibrary(book.id, 'reading');
      loadLibrary();
    } catch (e) {
      alert("Failed to add book");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { data: book } = await uploadBook(file);
      await updateLibrary(book.id, 'reading');
      loadLibrary();
    } catch (err) {
      alert("Upload failed");
    }
  };

  const filteredLibrary = library.filter(item => item.status === activeTab);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Books</h2>
        <div className="flex gap-8 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search Gutendex..."
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                {loading ? <Loader className="animate-spin" size={18} /> : <Search size={18} />} Search
              </button>
            </form>
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {searchResults.map(b => (
                <div key={b.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-sm">
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-gray-500">{b.authors[0]?.name}</div>
                  </div>
                  <button onClick={() => handleAdd(b.id)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-full">
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[300px] border-l pl-8 flex flex-col justify-center">
            <p className="text-sm text-gray-600 mb-4">Or upload your own EPUB or PDF file</p>
            <label className="cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition group">
              <Upload className="text-gray-400 group-hover:text-blue-500 mb-2" size={32} />
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Select File</span>
              <input type="file" className="hidden" accept=".epub,.pdf" onChange={handleUpload} />
            </label>
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-4 border-b mb-6">
          {['to_read', 'reading', 'read'].map(tab => (
            <button 
              key={tab}
              className={`pb-2 px-4 capitalize font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLibrary.map(item => (
            <Link to={`/reader/${item.book.id}`} key={item.book.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col gap-4 group">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                  <Book size={24} />
                </div>
                {item.book.status === 'processing' && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full animate-pulse">Processing</span>
                )}
                {item.book.status === 'ready' && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ready</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 line-clamp-2">{item.book.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.book.author}</p>
              </div>
            </Link>
          ))}
          {filteredLibrary.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No books in this list yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
