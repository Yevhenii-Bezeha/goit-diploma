import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { MainCard } from '../../components/userFan';
import { PieArtistsList } from '../../components/userFan/PieArtistsList/PieArtistsList';
import { PieCreateModal } from '../../components/userFan/modals/PieCreateModal/PieCreateModal';
import {
  useGetPieActiveQuery,
  useGetPieArtistsQuery,
  useBanArtistMutation,
  useSetArtistInclusionMutation,
} from '../../redux/userFan';
import { skipToken } from '@reduxjs/toolkit/query';
import { Button, Tabs } from '../../components/shared';
import ReactAvatar from 'react-avatar';
import { useGetUserQuery } from '../../redux/userFan';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { trackButtonClick, trackBusinessEvent, BusinessEvents, ButtonClickEvents } from '../../utils/analytics';

const calculatePieTime = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// User Avatar Component for MainCard
const UserAvatar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const { data: userData } = useGetUserQuery();

  return (
    <div className={props.className}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="rounded-full overflow-hidden w-16 h-16 border-3 border-[#8B5CF6] bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center">
          {userData?.data?.image_url ? (
            <img src={userData.data.image_url} alt="user" className="w-full h-full object-cover" />
          ) : userData?.data?.user_name ? (
            <ReactAvatar name={userData.data.user_name} size="64" round={true} textSizeRatio={2} color="#8B5CF6" />
          ) : (
            <div className="w-full h-full bg-violet-500 flex items-center justify-center text-white text-sm font-medium">You</div>
          )}
        </div>
      </div>
    </div>
  );
};

const PiePage = () => {
  const urlParams = useParams<{ pieId: string }>();
  const pieId = urlParams.pieId;
  const location = useLocation();

  const { data: userData, refetch: refetchUser } = useGetUserQuery();
  const isSpotifyConnected = !!userData?.data?.spotify_id;
  const [searchParams, setSearchParams] = useSearchParams();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle Spotify connection success
  useEffect(() => {
    const spotifyConnected = searchParams.get('spotifyConnected');
    if (spotifyConnected === 'true') {
      refetchUser();
      searchParams.delete('spotifyConnected');
      setSearchParams(searchParams);
    }
  }, [searchParams, refetchUser, setSearchParams]);

  const handleSpotifyConnect = async () => {
    try {
      setIsConnecting(true);
      trackBusinessEvent(BusinessEvents.SPOTIFY_CONNECTED);

      if (!executeRecaptcha) {
        console.error('reCAPTCHA not initialized');
        setIsConnecting(false);
        return;
      }

      const token = await executeRecaptcha('spotify_login');
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/api/auth/connectSpotify'
          : 'http://localhost:3000/api/auth/connectSpotify';

      window.location.href = `${baseUrl}?deviceType=${window.innerWidth < 768 ? 'mobile' : 'desktop'}&recaptchaToken=${token}`;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      setIsConnecting(false);
    }
  };

  // Fetch active pie data
  const pieQuery = useGetPieActiveQuery(pieId, {
    skip: !isSpotifyConnected,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: { data: pieData } = {},
    isLoading: isLoadingActivePie,
    isError: isActivePieError,
    error: activePieError,
  } = pieQuery;

  const pieActive = pieData ? { ...pieData, _id: pieData.id } : undefined;

  const [banArtist] = useBanArtistMutation();
  const [setArtistInclusion] = useSetArtistInclusionMutation();

  // Fetch pie artists data
  const {
    data: { data } = {},
    isError: isFinalSplitError,
    isLoading: isFinalSplitLoading,
    error: finalSplitError,
  } = useGetPieArtistsQuery(
    pieActive && pieActive._id
      ? {
        limit: pieActive.artistLimit ?? 50,
        pieId: pieActive._id,
        artistPopularity: pieActive.artistPopularity ?? 50,
        excludeNonActive: pieActive.excludeNonActive ?? false,
      }
      : skipToken,
    {
      skip: !pieActive || !pieActive._id,
      refetchOnMountOrArgChange: true,
    }
  );

  const isInitialLoading = isLoadingActivePie;
  const isPieDataReady = !isInitialLoading;

  const pieTime = useMemo(() => {
    if (pieActive) {
      return calculatePieTime(pieActive.start_date);
    }
    return 0;
  }, [pieActive]);

  const tabs = ['Supported Artists', 'Excluded Artists'];

  // Simple Stats Box
  const SimpleStatsBox = ({ value, label }: { value: string | number; label: string }) => (
    <div className="bg-[#1E152C] rounded-lg p-4 border border-[#8B5CF6]/20">
      <div className="text-xl font-bold text-[#8B5CF6] mb-1 text-center">
        {value}
      </div>
      <div className="text-[#A78BFA] text-sm text-center">{label}</div>
    </div>
  );

  // Event handlers
  const handleAddToPie = async (artistId: string) => {
    try {
      trackBusinessEvent(BusinessEvents.ARTIST_ADDED_TO_PIE);
      await setArtistInclusion({ pieArtistId: artistId, included: true });
    } catch (error) {
      console.error('Error adding artist to pie:', error);
    }
  };

  const handleRemoveFromPie = async (pieArtistId: string) => {
    try {
      trackBusinessEvent(BusinessEvents.ARTIST_REMOVED_FROM_PIE);
      await setArtistInclusion({ pieArtistId: pieArtistId, included: false });
    } catch (error) {
      console.error('Error removing artist from pie:', error);
    }
  };

  const handleRemoveFromAllPies = async (artistId: string) => {
    try {
      trackBusinessEvent(BusinessEvents.ARTIST_REMOVED_FROM_PIE);
      await banArtist({ artistId, banned: true });
    } catch (error) {
      console.error('Error banning artist:', error);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {isInitialLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      )}

      {/* Error handling */}
      {isPieDataReady && isActivePieError && (
        <div className="mt-3 px-4">
          <MainCard Svg={UserAvatar} variant="compact">
            <div className="text-red-500 text-center">
              Error loading data. Please try again.
            </div>
          </MainCard>
        </div>
      )}

      {/* No Active Pie - Create New */}
      {isPieDataReady && !pieActive && !isActivePieError && (
        <div className="mt-3 px-4">
          <MainCard Svg={UserAvatar} variant="featured">
            <div className="flex flex-col gap-6 items-center">
              {!isSpotifyConnected ? (
                <div className="text-center">
                  <h2 className="text-white text-xl font-bold mb-3">Connect Spotify First</h2>
                  <p className="text-[#A78BFA] text-sm mb-4">
                    Connect your Spotify account to start supporting artists.
                  </p>
                  <Button
                    title={isConnecting ? "Connecting..." : "Connect Spotify"}
                    onClick={handleSpotifyConnect}
                    disabled={isConnecting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-white text-xl font-bold mb-3">Create Your First Micro-Donation</h2>
                  <p className="text-[#A78BFA] text-sm mb-4">
                    Set your monthly budget and support artists automatically.
                  </p>
                  <PieCreateModal
                    openButton={
                      <Button
                        title="Create Micro-Donation"
                        onClick={() => trackButtonClick('create_pie_button_click' as any, 'pie_page', {})}
                        className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#A78BFA] hover:to-[#8B5CF6] text-white font-semibold py-2 px-6 rounded-lg"
                      />
                    }
                  />
                </div>
              )}
            </div>
          </MainCard>
        </div>
      )}

      {/* Active Pie Display */}
      {isPieDataReady && pieActive && !isActivePieError && (
        <>
          <div className="mt-3 px-4">
            <MainCard Svg={UserAvatar} variant="featured">
              <div className="flex flex-col gap-3 justify-center">
                <div className="text-4xl font-bold text-[#4ADE80] text-center">$ {pieActive?.amount / 100}</div>
                <div className="text-center text-sm text-[#A78BFA] font-medium">Monthly Budget</div>
                <div className="flex gap-2 text-xs text-center text-white/60 justify-center">
                  <div className="bg-[#1E152C] px-3 py-1 rounded-full">Day {pieTime}</div>
                </div>
              </div>
            </MainCard>
          </div>

          {/* Simple Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-6 px-4">
            <SimpleStatsBox
              value={pieActive?.count_artists || 0}
              label="Artists"
            />
            <SimpleStatsBox
              value={pieActive?.count_tracks || 0}
              label="Tracks"
            />
          </div>



          {/* Artists Tabs */}
          <div className="flex flex-col flex-1 rounded-t-[20px] px-4">
            <Tabs
              tabs={tabs}
              className="mb-6"
              defaultIndex={0}
              onChange={(index) => {
                trackButtonClick(
                  index === 0
                    ? ButtonClickEvents.VIEW_PIE_INCLUDED_ARTISTS
                    : ButtonClickEvents.VIEW_PIE_EXCLUDED_ARTISTS,
                  'pie_page'
                );
              }}
            >
              {[
                <div key="included" className="flex-1 overflow-auto mt-6">
                  {isFinalSplitError && (
                    <div className="text-red-500 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                      Error loading artists data.
                    </div>
                  )}

                  {/* Artists Lists */}
                  {!isFinalSplitLoading &&
                    !isFinalSplitError &&
                    (data?.includedArtists && data.includedArtists.length > 0 ? (
                      <PieArtistsList
                        data={data.includedArtists}
                        currentPage={1}
                        showMoney={true}
                        isExcludedTab={false}
                        pieSettingsPopularity={pieActive?.artistPopularity ? (pieActive.artistPopularity - 50) * 2 : 0}
                        onRemoveFromPie={handleRemoveFromPie}
                        onRemoveFromAllPies={handleRemoveFromAllPies}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[#1E152C] rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-[#8B5CF6] text-2xl">🎵</span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">No Supported Artists Yet</h3>
                        <p className="text-[#A78BFA] text-sm">Start listening to music to see artists here.</p>
                      </div>
                    ))}
                </div>,
                <div key="excluded" className="flex-1 overflow-auto mt-6">
                  {isFinalSplitLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-white">Loading artists...</span>
                    </div>
                  ) : !isFinalSplitError && data?.excludedArtists && data.excludedArtists.length > 0 ? (
                    <PieArtistsList
                      data={data.excludedArtists}
                      currentPage={1}
                      showMoney={false}
                      isExcludedTab={true}
                      onAddToPie={handleAddToPie}
                      pieSettingsPopularity={pieActive?.artistPopularity ? (pieActive.artistPopularity - 50) * 2 : 0}
                    />
                  ) : (
                    !isFinalSplitError && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[#1E152C] rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-[#8B5CF6] text-2xl">✓</span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">No Excluded Artists</h3>
                        <p className="text-[#A78BFA] text-sm">All your listened artists are included.</p>
                      </div>
                    )
                  )}
                </div>
              ]}
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default PiePage;
