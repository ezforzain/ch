import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { palettes, staticColors } from '../../data/admin/theme';

const AdminThemeContext = createContext(null);

/**
 * The admin panel has its own light/dark palette system, independent of the
 * public site's fixed palette (source: `palettes.light`/`palettes.dark`,
 * toggled via `state.theme`). We expose the active palette as CSS custom
 * properties scoped to the admin app root (set on AdminLayout's wrapper div)
 * so every admin component can reference `var(--a-*)` via Tailwind
 * arbitrary-value classes and repaint instantly on toggle — mirrors
 * source's `rootStyle` which injects `--paper/--ink/--mut/--white/--line/--dark`
 * inline on the same root element.
 */
export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  const palette = palettes[theme];

  const cssVars = useMemo(
    () => ({
      '--a-paper': palette.paper,
      '--a-ink': palette.ink,
      '--a-mut': palette.mut,
      '--a-white': palette.white,
      '--a-line': palette.line,
      '--a-dark': palette.dark,
      '--a-acc': staticColors.acc,
      '--a-acc-soft': staticColors.accSoft,
      '--a-danger': staticColors.danger,
      '--a-danger-soft': staticColors.dangerSoft,
      '--a-success': staticColors.success,
      '--a-success-soft': staticColors.successSoft,
    }),
    [palette],
  );

  // Every admin dialog (RecordModal, ConfirmDialog, ProductFormDrawer, …) renders through
  // Modal.jsx's React portal to document.body — outside this DOM subtree — so `style={cssVars}`
  // on AdminLayout's own div never reaches it; `var(--a-white)` etc. would resolve to nothing
  // there, silently making "white" panels transparent. Mirroring the same vars onto
  // <html> makes them available anywhere in the document, portals included, and reverting
  // them on unmount keeps the public site's own (unrelated) palette from ever seeing these.
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => root.style.setProperty(key, value));
    return () => {
      Object.keys(cssVars).forEach((key) => root.style.removeProperty(key));
    };
  }, [cssVars]);

  const value = useMemo(() => ({ theme, toggleTheme, palette, cssVars }), [theme, toggleTheme, palette, cssVars]);

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return ctx;
}
