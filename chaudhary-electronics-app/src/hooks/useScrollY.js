import { useEffect, useRef, useState } from 'react';

/** Scroll position, batched to one state update per animation frame so the several
 * always-mounted listeners of this hook (Navbar, MobileCtaBar, WhatsAppFloatButton)
 * don't each re-render on every single scroll pixel. */
export function useScrollY() {
  const [scrollY, setScrollY] = useState(() => window.scrollY);
  const ticking = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking.current = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollY;
}
