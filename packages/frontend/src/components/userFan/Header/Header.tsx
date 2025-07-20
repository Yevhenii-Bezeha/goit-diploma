import { NavigationLinks } from '../../userArtist/NavigationLinks';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar } from '../Avatar';
import Cookies from 'js-cookie';
import { LoginModal } from '../modals/LoginModal';
import { useEffect, useState, useRef } from 'react';
import { MobileNavOverlay } from '../MobileNavOverlay';
import { trackButtonClick, ButtonClickEvents } from '../../../utils/analytics';

export const Header = () => {
  const isAuth = Cookies.get('mypie_access_token_fan');
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();

  // Map routes to page names - only available routes for university prototype
  const pageNames: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/pie': 'Pie',
    '/pie/settings': 'Pie Settings',
    '/pie/successCheckout': 'Success',
  };
  const currentPageName = pageNames[location.pathname] || '';

  // Simple scroll handler that works reliably
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always visible on desktop
      if (window.matchMedia('(min-width: 768px)').matches) {
        setIsVisible(true);
        return;
      }

      // Mobile behavior - simple up/down detection
      if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
        // Scrolling up or at top - show header
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 72) {
        // Scrolling down and not at top - hide header
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenMobileMenu = () => {
    setIsMobileNavOpen(true);
    trackButtonClick(ButtonClickEvents.OPEN_MOBILE_MENU, 'header');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-700/30 flex items-center z-10 h-16 transition-transform duration-300 shadow-lg"
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="flex w-full items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <NavLink to="/dashboard" className="flex items-center cursor-pointer group">
            <div className="flex items-center space-x-2">
              {/* Research Icon */}
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg tracking-tight">Micro-Donations</h1>
                <p className="text-purple-300 text-xs">Research Prototype</p>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavigationLinks />
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuth ? (
            <div className="flex items-center space-x-3">
              <span className="text-purple-200 text-sm font-medium">Welcome</span>
              <Avatar />
            </div>
          ) : (
            <LoginModal />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            className="flex items-center justify-center p-2 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 transition-colors"
            aria-label="Open menu"
            onClick={handleOpenMobileMenu}
          >
            <svg
              width="24"
              height="24"
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

      {/* Mobile Page Title */}
      <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="text-white text-base font-semibold truncate max-w-32">
          {currentPageName}
        </span>
      </div>

      <MobileNavOverlay open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  );
};
