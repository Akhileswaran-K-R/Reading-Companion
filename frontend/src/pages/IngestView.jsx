import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Upload, BookOpen, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { searchBooks, addBook, uploadBook, updateLibrary } from '../api/client';

export default function IngestView({ onReloadLibrary }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [ingestingId, setIngestingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSuccessMessage('');
    try {
      const { data } = await searchBooks(searchQuery);
      setSearchResults(data.results || []);
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleIngestGutenberg = async (gutenbergId, title) => {
    setIngestingId(gutenbergId);
    try {
      const { data: book } = await addBook(gutenbergId);
      await updateLibrary(book.id, 'currently_reading');
      if (onReloadLibrary) {
        await onReloadLibrary();
      }
      setSuccessMessage(`"${title}" has been successfully ingested into your Sanctuary!`);
      setTimeout(() => {
        navigate('/sanctuary');
      }, 1500);
    } catch (err) {
      console.error("Ingestion failed:", err);
      alert(err.message || "Unable to ingest volume from Gutenberg. Ensure network access to gutendex is available.");
    } finally {
      setIngestingId(null);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setSuccessMessage('');
    try {
      const { data: book } = await uploadBook(file);
      await updateLibrary(book.id, 'currently_reading');
      if (onReloadLibrary) {
        await onReloadLibrary();
      }
      setSuccessMessage(`File "${file.name}" uploaded and queued for processing!`);
      setTimeout(() => {
        navigate('/sanctuary');
      }, 1500);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.message || "Upload failed. Ensure the file is a valid EPUB or PDF.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e8e6dc] pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sanctuary')}
            className="p-2.5 rounded-xl bg-[#faf9f5] border border-[#e8e6dc] text-[#5e5d59] hover:text-[#141413] hover:bg-[#f0eee6] transition-all cursor-pointer shadow-xs"
            title="Return to Sanctuary"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-widest text-[#c96442]">
              Ingestion Engine
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141413] font-normal tracking-tight">
              Add New Volume
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigate('/sanctuary')}
          className="text-xs font-['Plus_Jakarta_Sans'] font-semibold text-[#5e5d59] hover:text-[#141413] cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <p className="font-serif italic text-base text-[#5e5d59]">
        Import classical literature from the 70,000+ title Project Gutenberg catalog, or upload your own local EPUB/PDF volumes.
      </p>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#fbeee6] border border-[#c96442]/30 text-[#c96442] text-sm font-['Plus_Jakarta_Sans'] font-semibold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Two Column Ingestion Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Method 1: Project Gutenberg Search */}
        <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-7 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#c96442]">
              <BookOpen size={18} />
              <h3 className="font-serif text-xl text-[#141413]">Project Gutenberg Catalog</h3>
            </div>
            <p className="font-sans text-xs text-[#5e5d59] leading-relaxed">
              Search by author (e.g. <em>Jane Austen</em>, <em>Charles Dickens</em>) or title to pull clean plain text volumes.
            </p>

            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Pride and Prejudice, Dracula..."
                  className="w-full bg-[#f5f4ed] border border-[#e8e6dc] focus:border-[#c96442] rounded-2xl pl-4 pr-12 py-3 text-sm font-sans text-[#141413] outline-none shadow-xs"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-2 top-2 p-2 text-[#5e5d59] hover:text-[#c96442] cursor-pointer disabled:opacity-40"
                >
                  {searching ? <Loader2 size={18} className="animate-spin text-[#c96442]" /> : <Search size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="w-full py-3 rounded-xl bg-[#c96442] hover:bg-[#b35535] active:scale-[0.98] text-white font-sans text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-40"
              >
                {searching ? 'Searching Gutenberg...' : 'Search Catalog'}
              </button>
            </form>
          </div>

          <div className="pt-2 text-[11px] text-[#87867f] font-['Plus_Jakarta_Sans']">
            Volumes automatically get chunked and indexed into FAISS vectors.
          </div>
        </div>

        {/* Method 2: Local EPUB / PDF Upload */}
        <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-7 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#c96442]">
              <Upload size={18} />
              <h3 className="font-serif text-xl text-[#141413]">Local Folio Upload</h3>
            </div>
            <p className="font-sans text-xs text-[#5e5d59] leading-relaxed">
              Upload local DRM-free .epub or .pdf books. The companion extracts chapters and pages seamlessly.
            </p>

            <label className="flex flex-col items-center justify-center gap-3 w-full py-10 px-4 rounded-2xl border-2 border-dashed border-[#87867f]/30 hover:border-[#c96442] hover:bg-[#f0eee6] transition-all cursor-pointer font-sans text-xs font-bold uppercase tracking-wider text-[#5e5d59] group">
              <div className="p-3 rounded-full bg-[#f5f4ed] group-hover:bg-[#ffdbd0] text-[#c96442] transition-colors">
                {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
              </div>
              <span className="text-center">
                {uploading ? 'Processing Folio...' : 'Click or Drag EPUB / PDF File Here'}
              </span>
              <input 
                type="file" 
                accept=".epub,.pdf" 
                className="hidden" 
                onChange={handleUploadFile}
                disabled={uploading} 
              />
            </label>
          </div>

          <div className="pt-2 text-[11px] text-[#87867f] font-['Plus_Jakarta_Sans']">
            Supported formats: .epub, .pdf (Plain text extraction)
          </div>
        </div>
      </div>

      {/* Catalog Search Results Section */}
      {searchResults.length > 0 && (
        <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#f0eee6] pb-3">
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-[#c96442]">
              Catalog Discoveries ({searchResults.length} Results)
            </span>
            <span className="text-xs text-[#5e5d59]">Select a volume to ingest</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {searchResults.map((res) => {
              const isIngesting = ingestingId === res.id;
              const author = res.authors?.[0]?.name || "Unknown Author";

              return (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-[#f5f4ed] border border-[#e8e6dc] hover:border-[#c96442]/60 flex flex-col justify-between space-y-3 transition-all"
                >
                  <div className="space-y-1">
                    <h4 className="font-serif text-base font-medium text-[#141413] line-clamp-2">
                      {res.title}
                    </h4>
                    <p className="font-sans text-xs text-[#5e5d59] line-clamp-1 italic">
                      {author}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#e8e6dc]">
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#87867f] uppercase font-bold">
                      Gutenberg #{res.id}
                    </span>
                    <button
                      onClick={() => handleIngestGutenberg(res.id, res.title)}
                      disabled={isIngesting}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c96442] hover:bg-[#b35535] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {isIngesting ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Ingesting...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={12} />
                          <span>Ingest Volume</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
