export type ViewState = 'library' | 'reader';

export interface AppState {
  view: ViewState;
  currentBookId: string | null;
}
