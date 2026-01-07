import { useState, useEffect } from 'react';

const STORAGE_KEY = 'products-view-mode';

export function useViewMode(defaultMode: 'grid' | 'list' = 'list') {
  const [viewMode, setViewModeState] = useState<'grid' | 'list'>(defaultMode);

  // Load saved mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as 'grid' | 'list';
    if (savedMode && ['grid', 'list'].includes(savedMode)) {
      setViewModeState(savedMode);
    }
  }, []);

  // Save mode to localStorage when it changes
  const setViewMode = (mode: 'grid' | 'list') => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  return [viewMode, setViewMode] as const;
}