import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import Bi from '../ui/Bi';
import { useLang } from '../../i18n/LangContext';
import { useProducts } from '../../context/ProductsContext';
import { useToast } from '../../context/ToastContext';
import { fmtPKR } from '../../lib/format';

// Jump targets — the site's four in-page destinations (source: NAV_LINKS + Marketplace).
const SECTIONS = [
  { id: 'services', en: 'Services', ur: 'خدمات' },
  { id: 'work', en: 'Our work', ur: 'ہمارا کام' },
  { id: 'planner', en: 'Solar Planner', ur: 'سولر پلانر' },
  { id: 'products', en: 'Marketplace', ur: 'مارکیٹ پلیس' },
];

/**
 * Lightweight command-palette overlay: type to jump to a section, or find a
 * product by name (read-only — reuses `useProducts()`, never mutates). Product
 * results scroll to `#products` and close; the visitor searches from there,
 * since the detail-sheet state lives in MarketplaceSection.
 */
export default function QuickSearch({ open, onClose }) {
  const { lang } = useLang();
  const { products } = useProducts();
  const showToast = useToast();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  const q = query.trim().toLowerCase();

  const matchedSections = useMemo(
    () => SECTIONS.filter((s) => !q || s.en.toLowerCase().includes(q) || s.ur.includes(query.trim())),
    [q, query],
  );

  const matchedProducts = useMemo(() => {
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [q, products]);

  function goToSection(id) {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  function goToProduct(p) {
    onClose();
    showToast(lang === 'ur' ? `مارکیٹ پلیس میں "${p.name}" تلاش کریں` : `Search "${p.name}" in the Marketplace below`);
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  return (
    <Modal open={open} onClose={onClose} align="center" ariaLabel="Quick search">
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="mt-[max(8vh,20px)] flex w-full max-w-[560px] flex-col overflow-hidden rounded-[26px] border border-line bg-paper shadow-[0_30px_70px_-20px_rgba(23,21,15,0.55)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span aria-hidden="true" className="text-[18px] text-mut">⌕</span>
          <input
            ref={inputRef}
            id="qs-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={lang === 'ur' ? 'سیکشن یا پروڈکٹ تلاش کریں' : 'Search sections or products'}
            placeholder={lang === 'ur' ? 'سیکشن یا پروڈکٹ تلاش کریں…' : 'Search sections or products…'}
            className="min-w-0 flex-1 border-none bg-transparent text-[16px] outline-none placeholder:text-mut"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-mut transition-colors hover:bg-black/5 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {matchedSections.length > 0 && (
            <div className="mb-1">
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-mut uppercase">
                <Bi en="Sections" ur="سیکشنز" />
              </div>
              {matchedSections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSection(s.id)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-semibold text-ink transition-colors hover:bg-black/5"
                >
                  <span aria-hidden="true" className="text-acc">→</span>
                  <Bi en={s.en} ur={s.ur} />
                </button>
              ))}
            </div>
          )}

          {q && matchedProducts.length > 0 && (
            <div className="mb-1 border-t border-line pt-1">
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-mut uppercase">
                <Bi en="Products" ur="پروڈکٹس" />
              </div>
              {matchedProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goToProduct(p)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-black/5"
                >
                  <span className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-black/5">
                    {p.img && <img src={p.img} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-ink">{p.name}</span>
                    <span className="block text-[12.5px] text-mut" data-tnum>{fmtPKR(p.price)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {q && matchedSections.length === 0 && matchedProducts.length === 0 && (
            <div className="px-4 py-10 text-center text-[14px] text-mut">
              <Bi en="No matches. Try a different search." ur="کوئی نتیجہ نہیں۔ دوسرا لفظ آزمائیں۔" />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
