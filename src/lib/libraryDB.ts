import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { Book, BookFile, BookFormat } from '../types';

const booksStore = localforage.createInstance({
  name: 'books-pwa',
  storeName: 'books_metadata'
});

const filesStore = localforage.createInstance({
  name: 'books-pwa',
  storeName: 'books_files'
});

export const libraryDB = {
  async getAllBooks(): Promise<Book[]> {
    const books: Book[] = [];
    return new Promise((resolve, reject) => {
      booksStore.iterate((value: Book) => {
        books.push(value);
      }).then(() => resolve(books)).catch(reject);
    });
  },

  async getBook(id: string): Promise<Book | null> {
    return booksStore.getItem(id);
  },

  async getBookFile(id: string): Promise<BookFile | null> {
    return filesStore.getItem(id);
  },

  async addBook(file: File, format: BookFormat): Promise<Book> {
    const id = uuidv4();
    let data: string | ArrayBuffer;

    if (format === 'text') {
      data = await file.text();
    } else {
      data = await file.arrayBuffer();
    }

    const newBook: Book = {
      id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      author: 'Unknown',
      format,
      dateAdded: Date.now(),
      bookmarks: [],
      progress: 0,
      currentPage: 0,
    };

    const newFile: BookFile = {
      id,
      data
    };

    await filesStore.setItem(id, newFile);
    await booksStore.setItem(id, newBook);
    
    return newBook;
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    const book: Book | null = await booksStore.getItem(id);
    if (!book) return null;
    
    const updatedBook = { ...book, ...updates };
    await booksStore.setItem(id, updatedBook);
    return updatedBook;
  },

  async removeBook(id: string): Promise<void> {
    await booksStore.removeItem(id);
    await filesStore.removeItem(id);
  }
};
