import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const DEFAULT_OVERLAY_CLASS = 'bg-[rgba(15,14,11,0.6)] backdrop-blur-sm';
const TRANSITION_MS = 200;

/** Generic overlay shell shared by the product detail sheet, cart/wishlist drawer,
 * compare table, chat panel, lightbox and every admin-panel dialog. Closes on Escape
 * or backdrop click. Also owns the dialog's a11y contract (role/aria-modal/
 * aria-labelledby live here only — consumers must not re-declare role="dialog" on
 * their inner markup) plus a focus trap: focus moves into the dialog on open,
 * Tab/Shift+Tab cycles within it, and focus returns to whatever triggered it on close.
 *
 * The backdrop fades in/out smoothly (stays mounted through its exit transition
 * instead of vanishing instantly) — `overlayClassName` lets a consumer swap the
 * default heavy dark/blur backdrop for a lighter one (e.g. admin dialogs, where a
 * near-opaque backdrop hides too much of the panel behind it) without affecting
 * every other Modal consumer's default look. */
export default function Modal({ open, onClose, children, align = 'center', labelledBy, ariaLabel, overlayClassName }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const unmountTimer = useRef(null);

  // Keeps the backdrop mounted for the duration of its fade-out so closing animates
  // instead of vanishing instantly; mirrors the pattern of a proper exit transition
  // without pulling in an animation library for one component.
  useEffect(() => {
    if (open) {
      clearTimeout(unmountTimer.current);
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    unmountTimer.current = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(unmountTimer.current);
  }, [open]);

  useEffect(() => {
    if (!mounted) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mounted]);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;

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
      clearTimeout(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

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
      className={`fixed inset-0 z-[1200] flex ${alignClass} ${overlayClassName || DEFAULT_OVERLAY_CLASS} p-0 outline-none transition-opacity duration-200 ease-out sm:p-5 ${visible ? 'opacity-100' : 'opacity-0'}`}
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
