import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import en from './locales/en.json';
import ur from './locales/ur.json';

const dictionaries = { en, ur };

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useLocalStorage('ce_lang_v1', 'en');
  const dir = lang === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
  }, [lang, dir]);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'en' ? 'ur' : 'en'));
  }, []);

  const t = useCallback((key) => dictionaries[lang][key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, dir, setLang, toggleLang, t }), [lang, dir, toggleLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
