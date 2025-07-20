import { NavigationLinks } from '../../userArtist/NavigationLinks';
import { useEffect, useState, useRef } from 'react';

export const FooterNavigation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-custom-gradient w-full h-[72px] md:hidden z-50 transition-transform duration-300"
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <NavigationLinks />
    </div>
  );
};
