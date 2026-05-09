export type Theme = 'light' | 'sepia' | 'dark';

export interface ReaderSettings {
  theme: Theme;
  fontSize: number; // 12 to 32
}

export const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 18,
};
