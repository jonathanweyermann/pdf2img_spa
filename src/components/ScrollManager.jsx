import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

// Scroll to the top on navigation, or to the #hash target when there is one.
// Keyed on location.key so clicking "Convert a PDF" twice still scrolls.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const samePage = previousPath.current === pathname;
    previousPath.current = pathname;
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: samePage ? 'smooth' : 'instant', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: samePage ? 'smooth' : 'instant' });
  }, [pathname, hash, key]);

  return null;
}
