import { Outlet } from 'react-router-dom';
import { SidebarWithSections } from '../../components/userArtist/Sidebar/SidebarWithSections';
import { Footer } from '../../components/userFan/Footer/Footer';
import { ArtistHeader } from '../../components/userArtist/Header/ArtistHeader';

const ArtistProfilePage = () => {
  return (
    <>
      {/* Artist Header - fixed at top */}
      <ArtistHeader />

      {/* Main Layout */}
      <div className="flex relative md:static pt-[72px] md:pt-0 min-h-screen bg-black">
        {/* Sidebar - always visible on desktop, hidden on mobile */}
        <div className="hidden md:block flex-shrink-0">
          <SidebarWithSections />
        </div>

        {/* Main content area with sticky footer layout */}
        <div className="flex flex-col flex-1 min-h-[calc(100vh-72px)]">
          <div className="w-full max-w-[1280px] mx-auto flex-1 px-4 md:px-6">
            <Outlet />
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ArtistProfilePage;
