import { Button, Tabs } from '../../components/shared';
import { ClaimModal } from '../../components/userArtist';
import { ArtistList } from '../../components/userArtist/ArtistList/ArtistList';
import {
  useGetClaimsQuery,
  useGetUserArtistQuery,
  useGetOfficesQuery,
} from '../../redux/userArtist/userArtistApi';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { isUserOfficeAdminSelector, isUserProfileCompleteSelector } from '../../redux/userArtist/userArtistSlice';

const ArtistArtistsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);
  const isUserAdmin = useSelector(isUserOfficeAdminSelector);
  const isProfileComplete = useSelector(isUserProfileCompleteSelector);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const { data: offices, isLoading: officesLoading } = useGetOfficesQuery();
  const { data: userInfo, isLoading: userLoading } = useGetUserArtistQuery();

  useEffect(() => {
    if (!officesLoading && !userLoading) {
      setInitialLoadComplete(true);
    }
  }, [officesLoading, userLoading]);

  const { data: claims = [], isLoading: isClaimsLoading } = useGetClaimsQuery(
    {
      officeId: selectedOffice?._id,
    },
    {
      skip: !initialLoadComplete || !selectedOffice?._id,
    }
  );

  const claimedArtists = claims.filter((claim) => claim.claim.status === 'Successful');
  const pendingArtists = claims.filter((claim) => claim.claim.status === 'Pending');

  useEffect(() => {
    if (claimedArtists.length === 0 && activeTab === 0) {
      setActiveTab(0);
    }
  }, [claimedArtists.length, activeTab]);

  if (
    initialLoadComplete &&
    !officesLoading &&
    userInfo &&
    (!offices || offices.length === 0) &&
    !isProfileComplete
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-[#1F1B29] p-8 rounded-xl max-w-md w-full text-center shadow-lg border border-violet-800/30">
          <h2 className="text-2xl text-violet-500 font-bold mb-4">Complete Your Profile</h2>
          <p className="text-white mb-6">You need to complete your profile information before creating an office.</p>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white py-3 px-6"
            onClick={() => (window.location.href = '/for-artists/profile/update')}
          >
            Update Profile
          </Button>
        </div>
      </div>
    );
  }

  if (initialLoadComplete && !officesLoading && (!offices || offices.length === 0) && isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-[#1F1B29] p-8 rounded-xl max-w-md w-full text-center shadow-lg border border-violet-800/30">
          <div className="text-2xl text-violet-500 font-bold mb-4">Welcome to StreamSupport for Artists</div>
          <p className="text-white mb-6">
            You need to create an office to start managing your artists and receiving payments.
          </p>
          <p className="text-yellow-500">Please contact support to set up your office.</p>
        </div>
      </div>
    );
  }

  if (!selectedOffice && initialLoadComplete) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-xl text-violet-500 mb-4">No Office Selected</div>
          <p className="text-white mb-4">Please select an office from the sidebar to view the associated artists.</p>
        </div>
      </div>
    );
  }

  const isLoading = !initialLoadComplete || isClaimsLoading || !userInfo;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading artists...</div>
      </div>
    );
  }

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const tabs = [];
  const tabContent = [];

  if (claimedArtists.length > 0) {
    tabs.push('Claimed Artists');
    tabContent.push(<ArtistList key="claimed" claims={claims} status="Successful" onClaimArtist={handleOpenModal} />);
  }

  if (pendingArtists.length > 0) {
    tabs.push('Pending Claims');
    tabContent.push(<ArtistList key="pending" claims={claims} status="Pending" onClaimArtist={handleOpenModal} />);
  }

  const officeName =
    selectedOffice?.name || userInfo?.office || (userInfo ? `${userInfo.first_name}'s office` : 'Your office');

  return (
    <div className="flex flex-col items-left w-full h-full">
      {claims.length > 0 && tabs.length > 0 && (
        <div className="sm:hidden">
          <div className="bg-black h-16 flex items-start px-4 pt-4">
            <div className="w-16 flex-shrink-0 -mt-1.5"></div>
            <div className="flex-1">
              <Tabs tabs={tabs} selectedIndex={activeTab} onChange={handleTabChange} />
            </div>
          </div>
          <div className="px-4 py-0">
            {tabContent[activeTab]}
          </div>
        </div>
      )}

      {claims.length > 0 && tabs.length > 0 && (
        <div className="hidden sm:block px-4 md:px-8 py-0 mt-4 sm:mt-6">
          <Tabs tabs={tabs} selectedIndex={activeTab} onChange={handleTabChange}>
            {tabContent}
          </Tabs>
        </div>
      )}

      {claims.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <span className="text-primaryLightText text-center px-4 max-w-[500px]">
            Welcome to {officeName}! <br></br>Start by claiming your first artist below.
          </span>
          {isUserAdmin && (
            <Button className="text-white bg-violet-600 px-4 py-2 rounded-lg" onClick={handleOpenModal}>
              Claim Artist
            </Button>
          )}

          <p className="mt-12 items-center justify-center gap-4 text-center max-w-[300px] text-[#5b575e]">
            For bulk artist claiming, please
            <a href="mailto:team@mypie.com" className="text-violet-500 pl-4 hover:text-violet-600">
              contact us
            </a>
          </p>
        </div>
      ) : null}

      {claims.length > 0 && tabs.length === 0 && (
        <div className="w-full py-8 flex flex-col items-center justify-center gap-4">
          <span className="text-primaryLightText text-center px-4">
            No artists to display. Try claiming an artist.
          </span>
        </div>
      )}

      <ClaimModal visible={isOpen} onChange={() => setIsOpen(!isOpen)} />
    </div>
  );
};

export default ArtistArtistsPage;
