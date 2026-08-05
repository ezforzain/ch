import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Generic overlay shell shared by the product detail sheet, cart/wishlist drawer,
 * compare table, chat panel and lightbox. Closes on Escape or backdrop click.
 * Also owns the dialog's a11y contract (role/aria-modal/aria-labelledby live
 * here only — consumers must not re-declare role="dialog" on their inner
 * markup) plus a focus trap: focus moves into the dialog on open, Tab/Shift+Tab
 * cycles within it, and focus returns to whatever triggered it on close. */
export default function Modal({ open, onClose, children, align = 'center', labelledBy, ariaLabel }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      const root = panelRef.current;
      const first = root?.querySelector(FOCUSABLE_SELECTOR);
      (first || root)?.focus();
    }, 0);

    function onKey(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = panelRef.current;
      if (!root) return;
      const focusable = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const alignClass =
    align === 'right'
      ? 'items-stretch justify-end'
      : align === 'bottom'
        ? 'items-end justify-center'
        : 'items-center justify-center';

  return createPortal(
    <div
      ref={panelRef}
      tabIndex={-1}
      className={`fixed inset-0 z-[1200] flex ${alignClass} bg-[rgba(15,14,11,0.6)] p-0 backdrop-blur-sm outline-none sm:p-5`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : ariaLabel}
    >
      {children}
    </div>,
    document.body,
  );
}
