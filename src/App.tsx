import React, { useState, useEffect } from 'react';
import { Library } from './components/Library';
import { ReaderMode } from './components/ReaderMode';

export default function App() {
  const [view, setView] = useState<'library' | 'reader'>('library');
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [libraryTheme, setLibraryTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lib_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('lib_theme', libraryTheme);
    // Update body background matching the theme
    if (libraryTheme === 'light') {
      document.body.classList.remove('bg-[#0A0A0A]', 'text-neutral-100');
      document.body.classList.add('bg-[#F9F9F9]', 'text-neutral-900');
    } else {
      document.body.classList.remove('bg-[#F9F9F9]', 'text-neutral-900');
      document.body.classList.add('bg-[#0A0A0A]', 'text-neutral-100');
    }
  }, [libraryTheme]);

  const handleOpenBook = (id: string) => {
    setCurrentBookId(id);
    setView('reader');
  };

  const handleCloseBook = () => {
    setCurrentBookId(null);
    setView('library');
  };

  return (
    <>
      {view === 'library' && (
        <Library 
          onOpenBook={handleOpenBook} 
          theme={libraryTheme} 
          onThemeChange={setLibraryTheme} 
        />
      )}
      {view === 'reader' && currentBookId && (
        <ReaderMode bookId={currentBookId} onClose={handleCloseBook} />
      )}
    </>
  );
}
