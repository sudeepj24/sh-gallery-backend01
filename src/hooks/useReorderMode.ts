import { useState, useEffect } from 'react';
import { ReorderMode } from '../reorder/types';

const STORAGE_KEY = 'reorder-mode';

export function useReorderMode(defaultMode: ReorderMode = 'drag') {
  const [reorderMode, setReorderModeState] = useState<ReorderMode>(defaultMode);

  // Load saved mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as ReorderMode;
    if (savedMode && ['drag', 'bulk', 'swap'].includes(savedMode)) {
      setReorderModeState(savedMode);
    }
  }, []);

  // Save mode to localStorage when it changes
  const setReorderMode = (mode: ReorderMode) => {
    setReorderModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  };

  return [reorderMode, setReorderMode] as const;
}