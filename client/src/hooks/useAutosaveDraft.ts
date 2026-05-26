import { useEffect, useState } from "react";

export function useAutosaveDraft<T>(key: string, initialValue: T) {
  const [draft, setDraft] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(draft));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft, key]);

  const clearDraft = () => {
    localStorage.removeItem(key);
    setDraft(initialValue);
  };

  return { draft, setDraft, clearDraft };
}
