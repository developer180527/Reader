import React, { useEffect, useState, useRef } from 'react';
import { Book, BookFormat } from '../types';
import { libraryDB } from '../lib/libraryDB';
import { Book as BookIcon, Plus, Search, FileText, Trash2, Settings, Moon, Sun, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToggle } from 'react-use';

interface LibraryProps {
  onOpenBook: (id: string) => void;
  theme?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

export function Library({ onOpenBook, theme = 'dark', onThemeChange }: LibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, toggleAdding] = useToggle(false);
  const [showSettings, toggleSettings] = useToggle(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const all = await libraryDB.getAllBooks();
    setBooks(all.sort((a, b) => b.dateAdded - a.dateAdded));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let format: BookFormat | null = null;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      format = 'pdf';
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      format = 'text';
    }

    if (!format) {
      alert('Only PDF and TXT files are supported right now.');
      return;
    }

    try {
      const newBook = await libraryDB.addBook(file, format);
      setBooks([newBook, ...books]);
    } catch (err) {
      console.error(err);
      alert('Error adding book');
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book?')) {
      await libraryDB.removeBook(id);
      loadBooks();
    }
  };

  return (
    <div className={cn(
      "h-full overflow-y-auto p-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-10 font-sans transition-colors duration-300 relative",
      theme === 'light' ? 'bg-[#F9F9F9] text-gray-900' : 'bg-[#0A0A0A] text-gray-200'
    )}>
      <header className={cn(
        "max-w-5xl mx-auto flex flex-row items-center justify-between gap-4 mb-10 py-4 border px-4 sm:px-8 rounded-2xl shadow-xl transition-colors duration-300",
        theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#121212] border-white/5'
      )}>
        <h1 className="text-sm font-semibold tracking-widest uppercase opacity-60 shrink-0">Library</h1>
        
        <div className="flex flex-1 md:flex-none items-center justify-end gap-3 sm:gap-6">
          <div className="relative flex-1 max-w-sm min-w-[120px] sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full border-none rounded-full py-2 pl-10 pr-4 text-xs transition-all outline-none",
                theme === 'light' ? 'bg-gray-100 focus:ring-1 focus:ring-gray-300 text-gray-900 placeholder-gray-500' : 'bg-white/5 focus:ring-1 focus:ring-white/20 text-white placeholder-gray-400'
              )}
            />
          </div>
          <button 
            onClick={() => toggleSettings()}
            className={cn(
              "p-2 rounded-full transition-colors shrink-0",
              theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/5 text-gray-300'
            )}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "p-2 rounded-full transition-colors shrink-0",
              theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/5 text-gray-300'
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.txt"
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8">
        {books.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center py-32 opacity-80",
            theme === 'light' ? 'text-gray-500' : 'text-gray-400 opacity-60'
          )}>
            <BookIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-xl">Your library is empty.</p>
            <p className="mt-2 text-sm">Tap the + button to add PDF or TXT files.</p>
            
            <button 
              onClick={async () => {
                // Add a sample text book
                const sampleText = "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.\n\nThere was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.\n\nIn another moment down went Alice after it, never once considering how in the world she was to get out again.";
                const file = new File([sampleText], "Alice in Wonderland.txt", { type: "text/plain" });
                await libraryDB.addBook(file, 'text');
                loadBooks();
              }}
              className={cn(
                "mt-8 px-6 py-2 rounded-full transition-colors text-xs tracking-wider uppercase border",
                theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200' : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5'
              )}
            >
              Add Sample Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 gap-y-12">
            {filteredBooks.map(book => (
              <div 
                key={book.id} 
                onClick={() => onOpenBook(book.id)}
                className="group relative flex flex-col cursor-pointer"
              >
                <div className={cn(
                  "aspect-[2/3] rounded-lg shadow-2xl overflow-hidden border flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative",
                  theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1C1C1C] border-black/20'
                )}>
                  <div className={cn(
                    "absolute inset-0 pointer-events-none z-10 hidden sm:block",
                    theme === 'light' ? 'bg-gradient-to-r from-black/5 via-transparent to-black/5' : 'bg-gradient-to-r from-black/20 via-transparent to-black/20'
                  )}></div>
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-px z-20",
                    theme === 'light' ? 'bg-black/10 shadow-[0_0_10px_rgba(0,0,0,0.1)]' : 'bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                  )}></div>

                  {book.format === 'pdf' ? (
                    <FileText className={cn("w-12 h-12 transition-colors", theme === 'light' ? 'text-gray-300 group-hover:text-blue-500/70' : 'text-gray-600 group-hover:text-amber-500/70')} />
                  ) : (
                    <BookIcon className={cn("w-12 h-12 transition-colors", theme === 'light' ? 'text-gray-300 group-hover:text-blue-500/70' : 'text-gray-600 group-hover:text-amber-500/70')} />
                  )}
                  
                  <div className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-30 backdrop-blur-sm"
                       onClick={(e) => handleDelete(e, book.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className={cn("font-serif text-base leading-tight line-clamp-2", theme === 'light' ? 'text-gray-800' : 'text-gray-300')}>{book.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-widest">{book.format}</p>
                
                {book.progress !== undefined && book.progress > 0 && (
                  <div className={cn("mt-3 w-full h-1 rounded-full overflow-hidden", theme === 'light' ? 'bg-gray-200' : 'bg-white/5')}>
                    <div 
                      className={cn("h-full", theme === 'light' ? 'bg-blue-500/80' : 'bg-amber-500/60')} 
                      style={{ width: `${Math.round(book.progress * 100)}%` }} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Settings Modal/Popover */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => toggleSettings(false)}>
          <div 
            className={cn(
              "w-full max-w-sm rounded-2xl shadow-2xl p-6 border transition-transform duration-300",
              theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1C1C1C] border-white/10'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold tracking-wide">Library Settings</h2>
              <button 
                onClick={() => toggleSettings(false)}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-gray-400'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Appearance</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onThemeChange && onThemeChange('light')}
                  className={cn(
                    "flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all",
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50/50 text-blue-700' 
                      : 'border-white/5 hover:border-white/20 bg-black/20 text-gray-400'
                  )}
                >
                  <Sun className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button 
                  onClick={() => onThemeChange && onThemeChange('dark')}
                  className={cn(
                    "flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all",
                    theme === 'dark' 
                      ? 'border-blue-500 bg-blue-900/20 text-blue-400' 
                      : 'border-transparent hover:border-gray-200 bg-gray-50 text-gray-600'
                  )}
                >
                  <Moon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
