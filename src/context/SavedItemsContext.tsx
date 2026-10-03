import { createContext, useContext, useState, type ReactNode } from 'react';

interface SavedItemsContextValue {
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedItemsContext = createContext<SavedItemsContextValue>({
  savedIds: [],
  toggleSave: () => {},
  isSaved: () => false,
});

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rent-reuse-saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem('rent-reuse-saved', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return (
    <SavedItemsContext.Provider value={{ savedIds, toggleSave, isSaved }}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export const useSavedItems = () => useContext(SavedItemsContext);
