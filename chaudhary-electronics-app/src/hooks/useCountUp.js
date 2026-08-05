import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Animates 0 -> target with a cubic ease-out once the element scrolls into view,
 * mirroring the source design's data-count reveal-and-count behavior. Fires once.
 * Jumps straight to the target under prefers-reduced-motion, and batches the
 * visibility check to one per animation frame instead of once per scroll pixel. */
export function useCountUp(target, { duration = 1400 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    let ticking = false;

    function run() {
      if (countedRef.current) return;
      countedRef.current = true;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function check() {
      ticking = false;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        run();
        window.removeEventListener('scroll', onScroll);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [target, duration]);

  return [ref, value];
}
