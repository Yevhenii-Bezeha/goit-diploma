import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useGetUserArtistQuery, useGetOfficesQuery, Office, useCreateOfficeMutation } from '../../../redux/userArtist/userArtistApi';
import Close from '../../../assets/icons/close.svg';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { trackButtonClick, trackBusinessEvent, BusinessEvents, ButtonClickEvents } from '../../../utils/analytics';
import Artist from '../../../assets/icons/artist.svg';
import Funds from '../../../assets/icons/funds.svg';
import ReactAvatar from 'react-avatar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { isUserOfficeAdminSelector, setSelectedOffice, isUserProfileCompleteSelector } from '../../../redux/userArtist/userArtistSlice';
import { Modal } from '../../shared/Modal';
import { Button } from '../../shared/Button';

interface ArtistMobileNavOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const ArtistMobileNavOverlay = ({ open, onClose }: ArtistMobileNavOverlayProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: userData } = useGetUserArtistQuery();
  const { data: offices } = useGetOfficesQuery();
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);
  const isAdmin = useSelector(isUserOfficeAdminSelector);
  const isProfileComplete = useSelector(isUserProfileCompleteSelector);
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);
  const [showCreateOfficeModal, setShowCreateOfficeModal] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState('');
  const [officeError, setOfficeError] = useState<string | null>(null);
  const [createOffice, { isLoading: isCreatingOffice }] = useCreateOfficeMutation();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Track when the mobile menu is opened
      trackButtonClick(ButtonClickEvents.OPEN_MOBILE_MENU, 'artist_navigation');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = () => {
    // Track logout action
    trackBusinessEvent(BusinessEvents.LOGOUT);

    Cookies.remove('mypie_access_token_artist');
    window.location.href = '/for-artists';
  };

  // Get user's name or use a fallback
  const userName = userData ? `${userData.first_name} ${userData.last_name}` : '';

  // Simplified navigation items - only funds and artists
  const navigationItems = [
    {
      title: 'Artists',
      icon: <Artist className="w-6 h-6 fill-white" />,
      path: '/for-artists/artists',
    },
    {
      title: 'Funds',
      icon: <Funds className="w-6 h-6 fill-white" />,
      path: '/for-artists/funds',
    },
  ];

  const handleOfficeSelect = (office: Office) => {
    dispatch(setSelectedOffice(office));
    setShowOfficeDropdown(false);
  };

  const handleCreateOfficeClick = () => {
    // Check if user profile is complete before allowing office creation
    if (!isProfileComplete) {
      setOfficeError(
        'You need to complete your profile before creating an office. Please update your profile with your full name, phone number, and country information.'
      );
      setShowCreateOfficeModal(true);
      return;
    }

    setShowCreateOfficeModal(true);
    setNewOfficeName('');
    setOfficeError(null);
    setShowOfficeDropdown(false);
  };

  const handleCreateOffice = async () => {
    if (!newOfficeName.trim()) {
      setOfficeError('Office name cannot be empty');
      return;
    }

    if (!isProfileComplete) {
      setOfficeError('Please complete your profile before creating an office');
      return;
    }

    setOfficeError(null);

    try {
      const newOffice = await createOffice({ name: newOfficeName.trim() }).unwrap();

      trackBusinessEvent(BusinessEvents.OFFICE_CREATED);

      setShowCreateOfficeModal(false);
      setNewOfficeName('');

      // Select the newly created office
      dispatch(setSelectedOffice(newOffice));
    } catch (error: any) {
      console.error('Failed to create office:', error);
      setOfficeError(error.data?.message || 'Failed to create office');
    }
  };

  return (
    <div
      className={classnames(
        'fixed inset-0 z-50 transition-all duration-300',
        open ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none'
      )}
    >
      {/* Overlay background */}
      <div
        className={classnames(
          'fixed inset-0 h-screen bg-black/50 transition-opacity duration-300 z-50',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      {/* Slide-in panel with gradient background */}
      <div
        className={classnames(
          'fixed top-0 left-0 h-screen w-80 shadow-2xl flex flex-col transition-transform duration-300 z-[1000]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'linear-gradient(to bottom, #834DF8, #6B21A8)'
        }}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white rounded flex items-center justify-center">
              <span className="text-violet-600 text-sm font-bold">MD</span>
            </div>
            <div className="ml-3">
              <h1 className="text-white text-lg font-bold">Micro-Donations</h1>
              <p className="text-violet-200 text-xs">Artist Portal</p>
            </div>
          </div>
          <button
            className="p-2"
            onClick={onClose}
            aria-label="Close menu"
          >
            <Close width={24} height={24} className="text-white" />
          </button>
        </div>

        {/* Office Dropdown */}
        <div className="mt-4 mx-4 mb-6">
          <div className="relative">
            <button
              className="w-full text-white p-3 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: 'rgba(131, 77, 248, 0.5)' }}
              onClick={() => setShowOfficeDropdown(!showOfficeDropdown)}
            >
              <span className="font-medium">
                {selectedOffice?.name || 'Select Office'}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${showOfficeDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showOfficeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-purple-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                {offices && offices.length > 0 && (
                  <>
                    {offices.map((office) => (
                      <button
                        key={office._id}
                        className="w-full text-left p-3 text-white hover:bg-purple-600 first:rounded-t-lg"
                        onClick={() => handleOfficeSelect(office)}
                      >
                        {office.name}
                      </button>
                    ))}
                    <div className="border-t border-purple-500/30 my-1"></div>
                  </>
                )}
                <button
                  className="w-full text-left p-3 text-white hover:bg-purple-600 last:rounded-b-lg flex items-center gap-2"
                  onClick={handleCreateOfficeClick}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Office
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4">
          <div className="space-y-2">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-3 text-white rounded-lg transition-colors text-left"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(131, 77, 248, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                {item.icon}
                <span className="text-lg font-medium">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User info at bottom - simplified with only logout */}
        {userData && (
          <div className="p-4 border-t border-purple-500/30 space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(131, 77, 248, 0.3)' }}>
              {userData.image_url ? (
                <img src={userData.image_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
              ) : userName ? (
                <ReactAvatar
                  name={userName}
                  size="40"
                  round={true}
                  textSizeRatio={1.8}
                  color="#8B5CF6"
                  maxInitials={2}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{userName || 'Artist'}</div>
                <div className="text-purple-200 text-xs">Micro-Donations Artist</div>
              </div>
            </div>

            <button
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-red-300 hover:text-red-200"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Office Modal */}
      <Modal
        value={showCreateOfficeModal}
        onClose={() => {
          setShowCreateOfficeModal(false);
          setOfficeError(null);
        }}
        className="rounded-2xl min-h-[auto]"
      >
        <div className="p-6 w-full min-w-[280px] sm:min-w-[400px]">
          <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">
            {!isProfileComplete ? 'Profile Incomplete' : 'Create New Office'}
          </h2>

          {!isProfileComplete ? (
            <>
              <div className="mb-6 text-center sm:text-left">
                <div className="bg-yellow-800/30 border border-yellow-700/50 text-yellow-500 p-4 rounded-lg mb-4">
                  <p className="text-sm">
                    You need to complete your profile before creating an office. Please update your profile with your
                    full name, phone number, and country information.
                  </p>
                </div>
                <p className="text-[#8B8B8B] text-sm">
                  Offices help you organize your artists and team members. Complete your profile to get started.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                <Button
                  title="Close"
                  onClick={() => {
                    setShowCreateOfficeModal(false);
                    setOfficeError(null);
                  }}
                  className="bg-transparent border border-violet-500 text-violet-500 w-full sm:w-auto"
                />
                <Button
                  title="Update Profile"
                  onClick={() => {
                    setShowCreateOfficeModal(false);
                    navigate('/for-artists/profile/update');
                    onClose();
                  }}
                  className="w-full sm:w-auto"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-[#8B8B8B] mb-6 text-center sm:text-left">
                Create a new office to organize your artists and teams.
              </p>
              <div className="mb-6">
                <input
                  type="text"
                  value={newOfficeName}
                  onChange={(e) => setNewOfficeName(e.target.value)}
                  placeholder="Enter office name"
                  className="w-full p-3 rounded bg-[#1C1427] text-white border border-violet-800 focus:border-violet-500 focus:outline-none"
                />
                {officeError && <p className="text-red-500 mt-2 text-sm">{officeError}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                <Button
                  title="Cancel"
                  onClick={() => {
                    setShowCreateOfficeModal(false);
                    setOfficeError(null);
                  }}
                  className="bg-transparent border border-violet-500 text-violet-500 w-full sm:w-auto"
                />
                <Button
                  title={isCreatingOffice ? 'Creating...' : 'Create Office'}
                  onClick={handleCreateOffice}
                  disabled={isCreatingOffice}
                  className="w-full sm:w-auto"
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}; 