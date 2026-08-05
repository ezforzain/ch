import { useEffect, useState } from 'react';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorage(key, initialValue, onError) {
  const [value, setValue] = useState(() => readJSON(key, initialValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode / quota) — surface it if the caller wants to know,
      // since the value above still lives in memory but won't survive a refresh.
      onError?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue];
}
