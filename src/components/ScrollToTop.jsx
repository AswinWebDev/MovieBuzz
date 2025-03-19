import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls the window to the top whenever the route changes
 * Place this at the top level of your router
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use multiple approaches to ensure scroll works
    try {
      // Immediate scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also try with setTimeout for stubborn browsers
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 10);
    } catch (e) {
      console.error('Error scrolling to top:', e);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;
