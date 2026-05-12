import React, { useState, useEffect } from 'react';
import { ChevronLeft, Settings, Bookmark, List, Sun, Moon, Type } from 'lucide-react';
import { Book, BookFile } from '../types';
import { libraryDB } from '../lib/libraryDB';
import { ReaderSettings, defaultSettings } from '../types/settings';
import { PDFReader } from './PDFReader';
import { TextReader } from './TextReader';

export function ReaderMode({ bookId, onClose }: { bookId: string, onClose: () => void }) {
  const [book, setBook] = useState<Book | null>(null);
  const [file, setFile] = useState<BookFile | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [showUI, setShowUI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load saved settings from local storage
    const savedSettings = localStorage.getItem('readerSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('readerSettings', JSON.stringify(updated));
  };

  useEffect(() => {
    libraryDB.getBook(bookId).then(b => {
      setBook(b);
      if (b && b.currentPage !== undefined) {
        setCurrentPage(b.currentPage);
      }
    });
    libraryDB.getBookFile(bookId).then(setFile);
  }, [bookId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Debounce or just fire and forget the update
    libraryDB.updateBook(bookId, { currentPage: page });
  };

  const handleProgress = (progress: number) => {
    libraryDB.updateBook(bookId, { progress });
  };

  if (!book || !file) {
    return <div className="w-full h-full flex items-center justify-center bg-black text-white">Loading...</div>;
  }

  const toggleBookmark = () => {
    const isBookmarked = book.bookmarks.includes(currentPage);
    const newBookmarks = isBookmarked 
      ? book.bookmarks.filter(b => b !== currentPage)
      : [...book.bookmarks, currentPage];
    
    libraryDB.updateBook(bookId, { bookmarks: newBookmarks }).then(updated => {
      if (updated) setBook(updated);
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0F0F0F] overflow-hidden select-none">
      <div 
        className="absolute inset-0 z-0"
        onClick={() => {
           setShowUI(!showUI);
           if (showSettings) setShowSettings(false);
        }}
      >
        {book.format === 'pdf' ? (
          <PDFReader
            fileData={file.data as ArrayBuffer}
            initialPage={currentPage}
            onPageChange={handlePageChange}
            onProgress={handleProgress}
            theme={settings.theme}
          />
        ) : (
          <TextReader
            text={file.data as string}
            initialPage={currentPage}
            onPageChange={handlePageChange}
            onProgress={handleProgress}
            theme={settings.theme}
            fontSize={settings.fontSize}
          />
        )}
      </div>

      {/* Top UI Bar */}
      <div 
        className={`absolute top-0 inset-x-0 bg-[#121212] border-b border-white/5 shadow-sm flex items-center justify-between px-4 sm:px-6 transition-transform duration-300 z-50 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <button onClick={onClose} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium tracking-tight">Library</span>
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <h1 className="text-sm font-semibold tracking-widest uppercase opacity-60 text-white">{book.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleBookmark}
            className={`p-2 rounded-full hover:bg-white/5 transition-colors ${book.bookmarks.includes(currentPage) ? 'text-amber-500' : 'text-gray-400'}`}
          >
            <Bookmark className="w-5 h-5" fill={book.bookmarks.includes(currentPage) ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full text-gray-400 hover:bg-white/5 transition-colors relative"
          >
            <Type className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showUI && showSettings && (
        <div className="absolute top-[calc(3.5rem+env(safe-area-inset-top))] right-4 w-72 bg-[#121212] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-xl p-5 z-50 animate-in fade-in slide-in-from-top-2 text-gray-200">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Theme</p>
            <div className="flex gap-4">
              <button 
                onClick={() => updateSettings({ theme: 'light' })}
                className={`w-8 h-8 rounded-full bg-[#F5F2ED] flex items-center justify-center transition-all ${settings.theme === 'light' ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#121212]' : 'ring-2 ring-transparent'}`}
              >
              </button>
              <button 
                onClick={() => updateSettings({ theme: 'sepia' })}
                className={`w-8 h-8 rounded-full bg-[#E8DCC4] flex items-center justify-center transition-all ${settings.theme === 'sepia' ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#121212]' : 'ring-2 ring-transparent'}`}
              >
              </button>
              <button 
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center transition-all ${settings.theme === 'dark' ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#121212]' : 'ring-2 ring-white/10'}`}
              >
              </button>
            </div>
          </div>

          <div>
             <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Font Size</p>
             <div className="flex items-center gap-4 bg-white/5 rounded-lg p-1 border border-white/5">
               <button 
                 onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
                 className="p-2 hover:bg-white/10 rounded-md transition-colors text-white"
               >
                 <span className="text-sm">A</span>
               </button>
               <div className="flex-1 h-1 bg-white/10 rounded-full relative mx-2">
                 <div 
                   className="absolute left-0 top-0 h-full bg-white/40 rounded-full"
                   style={{ width: `${((settings.fontSize - 12) / 20) * 100}%` }}
                 ></div>
                 <div 
                   className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                   style={{ left: `${((settings.fontSize - 12) / 20) * 100}%` }}
                 ></div>
               </div>
               <button 
                 onClick={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })}
                 className="p-2 hover:bg-white/10 rounded-md transition-colors text-white"
               >
                 <span className="text-lg font-bold">A</span>
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
