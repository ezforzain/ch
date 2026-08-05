import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Smooth-scrolls to the element matching the URL hash after route/content changes,
 * mirroring the source design's anchor-link and routeFromHash() behavior. */
export default function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(timer);
  }, [hash, pathname]);

  return null;
}
