import { useEffect, useState } from 'react';
import Modal from './Modal';
import { imgFallback } from '../../lib/format';

/** Shared full-screen image viewer used by the work gallery and testimonials, mirroring
 * the source's single [data-lightbox] overlay (lines 805-808): a contained image with a
 * floating caption pill, closing on click-anywhere or Escape. Built on top of the shared
 * Modal (which already supplies the portal, Escape handling and backdrop).
 *
 * Note: an explicit close button is included (not present in source) per the component's
 * brief as a shared, reusable, accessible primitive — everything else replicates the
 * source's sizing, colors and click-to-close-anywhere behavior exactly.
 *
 * Optional before/after extension (new): when `beforeImage` is supplied, a small toggle
 * pill lets the viewer flip between the "before" and "after" (`image`) photo — used by
 * the work gallery's before/after capability. Fully backward compatible: omitting
 * `beforeImage` (as Testimonials.jsx does) renders exactly as before. */
export default function Lightbox({ open, onClose, image, caption, beforeImage, beforeFb, afterFb, onPrev, onNext }) {
  const [showBefore, setShowBefore] = useState(false);
  const hasBeforeAfter = !!beforeImage;
  const hasNav = !!(onPrev && onNext);

  useEffect(() => {
    if (open) setShowBefore(false);
  }, [open, image]);

  useEffect(() => {
    if (!open || !hasNav) return undefined;
    function onKey(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hasNav, onPrev, onNext]);

  const src = hasBeforeAfter && showBefore ? beforeImage : image;
  const fb = hasBeforeAfter && showBefore ? beforeFb : afterFb;

  return (
    <Modal open={open} onClose={onClose} align="center" ariaLabel={caption || 'Image viewer'}>
      <div
        className="relative flex w-full cursor-zoom-out items-center justify-center"
        onClick={onClose}
      >
        {src && (
          <img
            src={src}
            onError={fb ? imgFallback(fb) : undefined}
            alt={caption || ''}
            className="pointer-events-none max-h-[82vh] min-h-[200px] max-w-[min(1100px,92vw)] rounded-[20px] object-contain shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)]"
          />
        )}
        {hasNav && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="Previous image"
              className="absolute top-1/2 left-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(245,242,236,0.18)] bg-[rgba(245,242,236,0.1)] text-lg text-paper transition-colors hover:bg-[rgba(245,242,236,0.2)]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next image"
              className="absolute top-1/2 right-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(245,242,236,0.18)] bg-[rgba(245,242,236,0.1)] text-lg text-paper transition-colors hover:bg-[rgba(245,242,236,0.2)]"
            >
              →
            </button>
          </>
        )}
        {caption && (
          <span className="absolute bottom-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[rgba(245,242,236,0.18)] bg-[rgba(245,242,236,0.1)] px-5 py-[11px] text-[14px] text-paper">
            {hasBeforeAfter ? `${showBefore ? 'Before' : 'After'} — ${caption}` : caption}
          </span>
        )}
        {hasBeforeAfter && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowBefore((v) => !v);
            }}
            className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-[rgba(245,242,236,0.18)] bg-[rgba(245,242,236,0.1)] px-4 py-[9px] text-[13px] font-semibold text-paper transition-colors hover:bg-[rgba(245,242,236,0.2)]"
          >
            <span aria-hidden="true">⇄</span> {showBefore ? 'Show after' : 'Show before'}
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(245,242,236,0.18)] bg-[rgba(245,242,236,0.1)] text-lg text-paper transition-colors hover:bg-[rgba(245,242,236,0.2)]"
        >
          ×
        </button>
      </div>
    </Modal>
  );
}
