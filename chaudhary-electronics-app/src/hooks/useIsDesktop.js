import { useEffect, useState } from 'react';

/** True once the viewport is at/above `breakpoint` (default: Tailwind's `lg`, 1024px).
 * Used to switch between genuinely different component trees (not just CSS breakpoints)
 * for Home — see src/pages/Home.jsx — so the mobile storefront layout and the desktop
 * services layout never both sit in the DOM at once (which would otherwise duplicate
 * anchor ids like #top/#products between them). */
export function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= breakpoint,
  );

  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= breakpoint);
    }
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isDesktop;
}
