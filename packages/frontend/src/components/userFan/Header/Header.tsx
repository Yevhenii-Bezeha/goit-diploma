import { NavigationLinks } from '../../userArtist/NavigationLinks';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar } from '../Avatar';
import Logo from '../../../assets/icons/logo.svg';
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
      className="fixed top-0 left-0 right-0 bg-custom-gradient flex items-center z-10 h-[72px] transition-transform duration-300 px-0"
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="flex w-full items-center relative">
        {/* Logo (always left) */}
        <div className="pl-6 flex items-center min-w-0">
          <NavLink to="/dashboard" className="flex items-center cursor-pointer">
            <Logo />
          </NavLink>
        </div>
        {/* Centered navigation (desktop) or page name (mobile) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          <div className="hidden md:flex">
            <NavigationLinks />
          </div>
          <span className="text-white text-lg font-semibold truncate text-center w-full md:hidden">
            {currentPageName}
          </span>
        </div>
        {/* Desktop avatar/login (right) */}
        <div className="hidden md:flex items-center min-w-0 pr-6 gap-4 ml-auto">
          {isAuth ? <Avatar /> : <LoginModal />}
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
      <MobileNavOverlay open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  );
};
