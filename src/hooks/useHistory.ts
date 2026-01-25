import { useState, useCallback } from 'react';
import type { CanvasElement } from '../types/template';

const MAX_HISTORY = 50;

export const useHistory = () => {
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const saveToHistory = useCallback((newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    const limitedHistory = newHistory.slice(-MAX_HISTORY);
    setHistory(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback((): CanvasElement[] | null => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return JSON.parse(JSON.stringify(history[historyIndex - 1]));
    }
    return null;
  }, [historyIndex, history]);

  const redo = useCallback((): CanvasElement[] | null => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return JSON.parse(JSON.stringify(history[historyIndex + 1]));
    }
    return null;
  }, [historyIndex, history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
