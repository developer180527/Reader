export type BookFormat = 'text' | 'pdf';

export interface Book {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  dateAdded: number;
  coverImage?: string; // Data URL for a generated or extracted cover
  progress?: number; // 0 to 1
  currentPage?: number; // the actual page number the user was on
  bookmarks: number[]; // Array of page numbers or percentages
}

export interface BookFile {
  id: string; // matches Book.id
  data: string | ArrayBuffer; // Text string for 'text', ArrayBuffer for 'pdf'
}
