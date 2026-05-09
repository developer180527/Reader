import React, { useState } from 'react';
import { Library } from './components/Library';
import { ReaderMode } from './components/ReaderMode';

export default function App() {
  const [view, setView] = useState<'library' | 'reader'>('library');
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);

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
      {view === 'library' && <Library onOpenBook={handleOpenBook} />}
      {view === 'reader' && currentBookId && (
        <ReaderMode bookId={currentBookId} onClose={handleCloseBook} />
      )}
    </>
  );
}
