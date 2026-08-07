import { useEffect, useRef, useState } from 'react';

const DEFAULT_THRESHOLD = 8; // px of scroll needed before a direction "counts" — absorbs
// trackpad/mobile-momentum jitter so a couple of stray pixels can't flip visibility back and
// forth (the flicker this component is explicitly asked to avoid).
const DEFAULT_TOP_OFFSET = 80; // stay visible until scrolled at least this far — matches the
// YouTube/Amazon pattern of never hiding the header while still near the top of the page.

/**
 * Auto-hide-on-scroll header logic (YouTube/Amazon-style): hidden while scrolling down past
 * `topOffset`, shown again on the very next upward scroll. Takes an already-subscribed
 * `scrollY` value (e.g. from useScrollY()) rather than reading window.scrollY itself, so a
 * page that already tracks scroll position for other reasons (Navbar's pill background here)
 * doesn't end up with two separate scroll listeners.
 *
 * `forceVisible` (e.g. a mobile menu being open) always overrides to shown, regardless of
 * scroll direction — hiding a nav bar out from under its own open dropdown would be broken.
 */
export function useAutoHideHeader(scrollY, { threshold = DEFAULT_THRESHOLD, topOffset = DEFAULT_TOP_OFFSET, forceVisible = false } = {}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(scrollY);

  useEffect(() => {
    if (scrollY <= topOffset) {
      setHidden(false);
      lastY.current = scrollY;
      return;
    }
    const delta = scrollY - lastY.current;
    if (delta > threshold) {
      setHidden(true);
      lastY.current = scrollY;
    } else if (delta < -threshold) {
      setHidden(false);
      lastY.current = scrollY;
    }
    // |delta| <= threshold: leave `lastY` alone so small back-and-forth jitter keeps
    // accumulating against the last *decisive* position instead of resetting every frame.
  }, [scrollY, threshold, topOffset]);

  return forceVisible ? false : hidden;
}
