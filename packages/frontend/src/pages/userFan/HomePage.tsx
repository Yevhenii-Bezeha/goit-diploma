import { useState, useEffect } from 'react';
import {
  Track,
  useGetRecentListenedArtistsQuery,
  useGetUserLatestTracksQuery,
  useGetUserQuery,
} from '../../redux/userFan';
import { useGetPieActiveQuery } from '../../redux/userFan';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { TracksList } from '../../components/userFan';
import { Button } from '../../components/shared';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import SpotifyLogoSmall from '../../assets/icons/spotify.svg';
import SpotifyFullLogo from '../../assets/icons/spotifyFullLogo.svg';
import PieLogo from '../../assets/icons/logo-pie.svg';
import noArtistImage from '../../assets/image/no-artist-image.png';
import ReactAvatar from 'react-avatar';
import {
  BusinessEvents,
  trackBusinessEvent,
  trackButtonClick,
  trackNavigation,
  ButtonClickEvents,
  NavigationEvents,
} from '../../utils/analytics';
import { PieCreateModal } from '../../components/userFan/modals/PieCreateModal';
import { msToTime } from '../../utils';

function formatTimeAgo(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Simplified Pie Visual Component
const PieVisual: React.FC<{ amount: number; className?: string }> = ({ amount, className = "" }) => {
  const { data: userData } = useGetUserQuery();

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full">
        <PieLogo className="w-full h-full" />

        {/* User Avatar in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full overflow-hidden w-8 h-8 sm:w-10 sm:h-10 border-2 border-white">
            {userData?.data?.image_url ? (
              <img src={userData.data.image_url} alt="user" className="w-full h-full object-cover" />
            ) : userData?.data?.user_name ? (
              <ReactAvatar name={userData.data.user_name} size="100%" round={true} textSizeRatio={2} color="#8B5CF6" />
            ) : (
              <div className="w-full h-full bg-violet-500 flex items-center justify-center text-white text-xs">U</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get user data
  const { data: userData, isLoading: isUserLoading, refetch: refetchUser } = useGetUserQuery();

  // Fetch active pie directly (no pieId argument)
  const { data: { data: pieActive } = {}, isLoading: isPieLoading } = useGetPieActiveQuery(undefined);

  // Simple loading state
  const isInitialLoading = isUserLoading || isPieLoading;

  const [currentPage, setCurrentPage] = useState(1);
  const { width } = useWindowSize();
  const visibleArtists = width >= 768 ? 8 : 4; // Reduced for simplified version

  const { data: { data: artistsData = [] } = {}, isLoading: isArtistsLoading } = useGetRecentListenedArtistsQuery({});

  const [allTracksData, setAllTracksData] = useState<Track[]>([]);
  const {
    data: { data: tracksData, totalCount = 0 } = {},
    isError,
    isLoading,
  } = useGetUserLatestTracksQuery({ page: currentPage });

  useEffect(() => {
    if (tracksData) {
      setAllTracksData((prevData) => [...prevData, ...tracksData]);
    }
  }, [tracksData]);

  // Check for Spotify connection success and force refresh
  useEffect(() => {
    const spotifyConnected = searchParams.get('spotifyConnected');
    if (spotifyConnected === 'true') {
      refetchUser();
      searchParams.delete('spotifyConnected');
      setSearchParams(searchParams);
    }
  }, [searchParams, refetchUser, setSearchParams]);

  const totalPages = tracksData ? Math.ceil(totalCount / 20) : 1;

  const handleSpotifyConnect = async () => {
    try {
      if (!executeRecaptcha) {
        console.error('reCAPTCHA not initialized');
        return;
      }

      const token = await executeRecaptcha('spotify_login');
      trackBusinessEvent(BusinessEvents.SPOTIFY_CONNECTED);

      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/api/auth/connectSpotify'
          : 'http://localhost:3000/api/auth/connectSpotify';

      window.location.href = `${baseUrl}?recaptchaToken=${token}`;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto pt-16 px-4">
      {isInitialLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white">Loading your dashboard...</p>
          </div>
        </div>
      )}

      {!isInitialLoading && (
        <>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Listener-Driven Micro-Donations
            </h1>
            <p className="text-[#9CA3AF] text-lg">
              Support artists based on your actual listening patterns
            </p>
          </div>

          {/* Main Action Section */}
          {pieActive ? (
            <div className="mb-12">
              <div className="bg-gradient-to-br from-[#1A1425] to-[#120E16] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Pie Visual */}
                  <div className="flex-shrink-0">
                    <PieVisual amount={pieActive.amount} className="w-20 h-20 sm:w-24 sm:h-24" />
                  </div>

                  {/* Stats */}
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      Your Active Micro-Donation Fund
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-[#2A2A2A] rounded-lg p-4">
                        <div className="text-[#9CA3AF] text-sm font-medium">Monthly Budget</div>
                        <div className="text-green text-2xl font-bold">${pieActive.amount / 100}</div>
                      </div>
                      <div className="bg-[#2A2A2A] rounded-lg p-4">
                        <div className="text-[#9CA3AF] text-sm font-medium">Artists Supported</div>
                        <div className="text-white text-2xl font-bold">{pieActive.count_artists}</div>
                      </div>
                      <div className="bg-[#2A2A2A] rounded-lg p-4">
                        <div className="text-[#9CA3AF] text-sm font-medium">Total Listen Time</div>
                        <div className="text-white text-2xl font-bold">{msToTime(pieActive.total_time_listened_artists)}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        trackNavigation(NavigationEvents.NAVIGATION_TO_CREATE_PIE, 'dashboard');
                        navigate('/pie');
                      }}
                      title="Manage Your Fund"
                      className="bg-primary hover:bg-primaryLight text-white px-8 py-3 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : userData?.data.access_token ? (
            <div className="mb-12">
              <div className="bg-gradient-to-br from-[#1A1425] to-[#120E16] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Start Supporting Artists
                </h2>
                <p className="text-[#9CA3AF] text-lg mb-6 max-w-2xl mx-auto">
                  Create a monthly micro-donation fund that automatically distributes to artists based on your listening time.
                </p>
                <PieCreateModal
                  openButton={
                    <Button
                      onClick={() => trackNavigation(NavigationEvents.NAVIGATION_TO_CREATE_PIE, 'home_page')}
                      title="Create Micro-Donation Fund"
                      className="bg-primary hover:bg-primaryLight text-white px-8 py-3 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105"
                    />
                  }
                />
              </div>
            </div>
          ) : (
            <div className="mb-12">
              <div className="bg-gradient-to-br from-[#1A1425] to-[#120E16] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Connect Your Spotify Account
                </h2>
                <p className="text-[#9CA3AF] text-lg mb-6 max-w-2xl mx-auto">
                  Link your Spotify account to start tracking your listening patterns and supporting artists through micro-donations.
                </p>
                <button
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                  onClick={handleSpotifyConnect}
                >
                  <SpotifyLogoSmall width={24} height={24} />
                  <span className="text-lg">Connect Spotify</span>
                </button>
              </div>
            </div>
          )}

          {/* Recent Artists Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Recently Listened Artists
            </h2>

            {isArtistsLoading && (
              <div className="bg-[#120E16] border border-[#2A2A2A] rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white">Loading your recent artists...</p>
                </div>
              </div>
            )}

            {!isArtistsLoading && !artistsData.length && (
              <div className="bg-[#120E16] border border-[#2A2A2A] rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-[#2A2A2A] rounded-full p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-[#808191]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white text-lg font-semibold">No Artists Yet</h3>
                  <p className="text-[#808191] max-w-md">
                    Connect your Spotify account and start listening to see your recently listened artists here.
                  </p>
                </div>
              </div>
            )}

            {!isArtistsLoading && artistsData.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {artistsData.slice(0, visibleArtists).map((artist, index) => (
                  <NavLink key={index} className="block group" to={`/artist/${artist._id}`}>
                    <div className="bg-[#120E16] border border-[#2A2A2A] rounded-xl p-4 transition-all duration-200 hover:bg-[#1A1425] hover:border-[#8B5CF6] hover:scale-105 h-full">
                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-[#2A2A2A]">
                        <img
                          src={artist.image || noArtistImage}
                          alt={`${artist.name}'s profile`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = noArtistImage;
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium text-sm truncate mb-1">
                          {artist.name}
                        </div>
                        <div className="text-[#808191] text-xs">
                          {formatTimeAgo(artist.last_listened)}
                        </div>
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tracks Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Recently Listened Tracks
            </h2>

            {isError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <p className="text-red-400">
                  Something went wrong while loading your tracks. Please try again later.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-[#120E16] border border-[#2A2A2A] rounded-xl p-6 text-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="h-8 w-8 bg-[#2A2A2A] rounded-full"></div>
                  <div className="h-4 w-32 bg-[#2A2A2A] rounded"></div>
                </div>
              </div>
            )}

            {!isLoading && allTracksData.length === 0 && (
              <div className="bg-[#120E16] border border-[#2A2A2A] rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-[#2A2A2A] rounded-full p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-[#808191]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white text-lg font-semibold">No Tracks Yet</h3>
                  <p className="text-[#808191] max-w-md">
                    Start listening to music on Spotify to see your recently played tracks here.
                  </p>
                </div>
              </div>
            )}

            {allTracksData.length > 0 && (
              <div className="bg-[#120E16] border border-[#2A2A2A] rounded-xl overflow-hidden">
                <TracksList data={allTracksData} currentPage={currentPage} />
              </div>
            )}

            {!isLoading && currentPage < totalPages && (
              <div className="mt-6 text-center">
                <Button
                  className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    setCurrentPage((prevPage) => prevPage + 1);
                    trackButtonClick(ButtonClickEvents.LOAD_MORE_TRACKS, 'home_page');
                  }}
                >
                  Load More Tracks
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
