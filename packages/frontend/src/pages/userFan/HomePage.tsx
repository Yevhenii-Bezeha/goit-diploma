import { useState, useEffect } from 'react';
import {
  Track,
  useGetUserLatestTracksQuery,
  useGetUserQuery,
} from '../../redux/userFan';
import { useGetPieActiveQuery } from '../../redux/userFan';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TracksList } from '../../components/userFan';
import { Button } from '../../components/shared';
import SpotifyLogoSmall from '../../assets/icons/spotify.svg';
import ReactAvatar from 'react-avatar';

import { PieCreateModal } from '../../components/userFan/modals/PieCreateModal';
import { msToTime } from '../../utils';



const PieVisual: React.FC<{ amount: number; className?: string }> = ({ amount, className = "" }) => {
  const { data: userData } = useGetUserQuery();

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full">

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
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: userData, isLoading: isUserLoading, refetch: refetchUser } = useGetUserQuery();

  const { data: { data: pieActive } = {}, isLoading: isPieLoading } = useGetPieActiveQuery(undefined);

  const isInitialLoading = isUserLoading || isPieLoading;

  const [currentPage, setCurrentPage] = useState(1);

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
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/api/auth/connectSpotify'
          : 'http://localhost:3000/api/auth/connectSpotify';

      window.location.href = baseUrl;
    } catch (error) {
      console.error('Spotify connection failed:', error);
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
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Listener-Driven Micro-Donations
            </h1>
            <p className="text-[#9CA3AF] text-lg">
              Support artists based on your actual listening patterns
            </p>
          </div>

          {pieActive ? (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-[#1A1425] to-[#120E16] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <PieVisual amount={pieActive.amount} className="w-12 h-12" />

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-[#9CA3AF] text-xs font-medium">Monthly Budget</div>
                        <div className="text-green text-lg font-bold">${pieActive.amount / 100}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[#9CA3AF] text-xs font-medium">Artists</div>
                        <div className="text-white text-lg font-bold">{pieActive.count_artists}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[#9CA3AF] text-xs font-medium">Listen Time</div>
                        <div className="text-white text-lg font-bold">{msToTime(pieActive.total_time_listened_artists)}</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      navigate('/pie');
                    }}
                    title="Go to Pie"
                    className="bg-primary hover:bg-primaryLight text-white px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          ) : userData?.data.linked_accounts?.some(account => account.provider === 'spotify') ? (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-[#1A1425] to-[#120E16] border border-[#2A2A2A] rounded-xl p-4 text-center">
                <h2 className="text-xl font-bold text-white mb-2">
                  Start Supporting Artists
                </h2>
                <p className="text-[#9CA3AF] text-sm mb-4 max-w-md mx-auto">
                  Create a monthly micro-donation fund that automatically distributes to artists based on your listening time.
                </p>
                <PieCreateModal
                  openButton={
                    <Button
                      onClick={() => { }}
                      title="Create Micro-Donation Fund"
                      className="bg-primary hover:bg-primaryLight text-white px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    />
                  }
                />
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-[#1A1425] to-[#120E16] border border-[#2A2A2A] rounded-xl p-4 text-center">
                <h2 className="text-xl font-bold text-white mb-2">
                  Connect Your Spotify Account
                </h2>
                <p className="text-[#9CA3AF] text-sm mb-4 max-w-md mx-auto">
                  Link your Spotify account to start tracking your listening patterns and supporting artists through micro-donations.
                </p>
                <button
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 mx-auto text-sm"
                  onClick={handleSpotifyConnect}
                >
                  <SpotifyLogoSmall width={20} height={20} />
                  <span>Connect Spotify</span>
                </button>
              </div>
            </div>
          )}

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
