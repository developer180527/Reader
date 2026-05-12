import React, { useEffect, useState, useRef } from 'react';
import { Book, BookFormat } from '../types';
import { libraryDB } from '../lib/libraryDB';
import { Book as BookIcon, Plus, Search, FileText, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToggle } from 'react-use';

export function Library({ onOpenBook }: { onOpenBook: (id: string) => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, toggleAdding] = useToggle(false);
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
    <div className="h-full overflow-y-auto bg-[#0A0A0A] text-gray-200 p-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-10 font-sans">
      <header className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 py-4 bg-[#121212] border border-white/5 px-6 sm:px-8 rounded-2xl shadow-xl">
        <h1 className="text-sm font-semibold tracking-widest uppercase opacity-60 text-center md:text-left mt-2 md:mt-0">Library</h1>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border-none rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-white/20 transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors shrink-0"
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
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 opacity-60">
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
              className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors text-xs tracking-wider uppercase border border-white/5"
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
                <div className="aspect-[2/3] rounded-lg shadow-2xl overflow-hidden bg-[#1C1C1C] border border-black/20 flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10 hidden sm:block"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-black/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20"></div>

                  {book.format === 'pdf' ? (
                    <FileText className="w-12 h-12 text-gray-600 group-hover:text-amber-500/70 transition-colors" />
                  ) : (
                    <BookIcon className="w-12 h-12 text-gray-600 group-hover:text-amber-500/70 transition-colors" />
                  )}
                  
                  <div className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-30 backdrop-blur-sm"
                       onClick={(e) => handleDelete(e, book.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-serif text-base leading-tight line-clamp-2 text-gray-300">{book.title}</h3>
                <p className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-widest">{book.format}</p>
                
                {book.progress !== undefined && book.progress > 0 && (
                  <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500/60 h-full" 
                      style={{ width: `${Math.round(book.progress * 100)}%` }} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
