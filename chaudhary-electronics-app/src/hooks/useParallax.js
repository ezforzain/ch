import { useEffect, useRef } from 'react';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Linear parallax: translateY(scrollY * factor), matching data-parallax. The style write
 * is batched to one per animation frame, and skipped entirely under prefers-reduced-motion. */
export function useParallax(factor = 0.14) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    let ticking = false;
    function apply() {
      el.style.transform = `translate3d(0, ${(window.scrollY * factor).toFixed(1)}px, 0)`;
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [factor]);

  return ref;
}
