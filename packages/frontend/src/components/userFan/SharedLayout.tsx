import { Header } from './Header/Header';
import { FooterNavigation } from './FooterNavigation/FooterNavigation';
import { Footer } from './Footer/Footer';
import { Outlet } from 'react-router-dom';

export const SharedLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Add padding-top to account for fixed header */}
      <main className="flex-grow pt-[72px]">
        <Outlet />
      </main>
      <Footer />
      <FooterNavigation />
    </div>
  );
}; 