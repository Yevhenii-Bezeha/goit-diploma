import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArtistMobileNavOverlay } from '../ArtistMobileNavOverlay/ArtistMobileNavOverlay';

import { ArtistAvatar } from '../ArtistAvatar';

export const ArtistHeader = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();

  const pageNames: Record<string, string> = {
    '/for-artists/artists': 'Artists',
    '/for-artists/funds': 'Funds',
    '/for-artists/profile/update': 'Profile',
  };

  const getCurrentPageName = () => {
    const path = location.pathname;

    if (pageNames[path]) {
      return pageNames[path];
    }

    if (path.startsWith('/for-artists/artists/')) {
      return 'Artist Details';
    }
    if (path.startsWith('/for-artists/funds/')) {
      if (path.includes('/payouts/')) {
        return 'Payout Details';
      }
      if (path.includes('/transactions/')) {
        return 'Transaction Details';
      }
    }

    return 'Micro-Donations';
  };

  const currentPageName = getCurrentPageName();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (window.matchMedia('(min-width: 768px)').matches) {
        setIsVisible(true);
        return;
      }

      if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 72) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenMobileMenu = () => {
    setIsMobileNavOpen(true);
  };

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 flex items-center z-10 h-[72px] transition-transform duration-300 px-0"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        background: 'linear-gradient(to bottom, #834DF8, #6B21A8)'
      }}
    >
      <div className="flex w-full items-center relative">
        <div className="pl-4 flex items-center min-w-0">
          <div className="h-8 w-8 bg-white rounded flex items-center justify-center">
            <span className="text-violet-600 text-sm font-bold">MD</span>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          <span className="text-white text-lg font-semibold truncate text-center w-full">
            {currentPageName}
          </span>
        </div>

        <div className="hidden md:flex items-center min-w-0 pr-6 gap-4 ml-auto">
          <ArtistAvatar />
        </div>

        {/* Hamburger icon (mobile only, right aligned) */}
        <div className="flex items-center min-w-0 md:hidden pr-6 ml-auto">
          <button className="flex items-center justify-center" aria-label="Open menu" onClick={handleOpenMobileMenu}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      </div>
      <ArtistMobileNavOverlay open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  );
}; 