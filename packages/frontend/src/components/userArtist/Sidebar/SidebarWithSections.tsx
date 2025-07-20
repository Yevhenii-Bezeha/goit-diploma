
import { useState, useEffect, Fragment } from 'react';
import classnames from 'classnames';
import classes from './Sidebar.module.css';
import Artist from '../../../assets/icons/artist.svg';
import Funds from '../../../assets/icons/funds.svg';
import { LinkList } from '../../shared/LinkList';
import { ArtistAvatar } from '../ArtistAvatar';
import { useGetUserArtistQuery, useGetOfficesQuery, Office, useCreateOfficeMutation } from '../../../redux/userArtist/userArtistApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setSelectedOffice, isUserProfileCompleteSelector } from '../../../redux/userArtist/userArtistSlice';
import { Popover, Transition } from '@headlessui/react';
import { Modal } from '../../shared/Modal';
import { Button } from '../../shared/Button';

type SidebarType = {
  className?: string;
};

export const SidebarWithSections = ({ className }: SidebarType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateOfficeModal, setShowCreateOfficeModal] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState('');
  const [officeError, setOfficeError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);
  const isProfileComplete = useSelector(isUserProfileCompleteSelector);

  const { data: user } = useGetUserArtistQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const { data: offices, isLoading: officesLoading } = useGetOfficesQuery();
  const [createOffice, { isLoading: isCreatingOffice }] = useCreateOfficeMutation();

  useEffect(() => {
    if (!selectedOffice && offices && offices.length > 0) {
      dispatch(setSelectedOffice(offices[0]));
    } else if (offices && offices.length === 0) {
      dispatch(setSelectedOffice(null));
    }
  }, [offices, selectedOffice, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(`.${classes.container}`) && !target.closest(`.${classes.mobileButton}`)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { title: 'Artists', icon: <Artist fill={'white'} />, path: 'artists', isOfficeSpecific: true },
    { title: 'Funds', icon: <Funds />, path: 'funds', isOfficeSpecific: true },
  ];

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  const handleOfficeSelect = (office: Office) => {
    if (selectedOffice?._id !== office._id) {
      dispatch(setSelectedOffice(office));
    }
  };

  const handleCreateOfficeClick = () => {
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
      setShowCreateOfficeModal(false);
      setNewOfficeName('');
      dispatch(setSelectedOffice(newOffice));
    } catch (error: any) {
      console.error('Failed to create office:', error);
      setOfficeError(error.data?.message || 'Failed to create office');
    }
  };

  const getDefaultOfficeName = () => {
    if (!user) return 'Loading...';

    if (user.office) return `${user.office}'s office`;

    if (user.type === 'Label' && user.label_name) {
      return `${user.label_name}'s office`;
    } else {
      return `${user.first_name} ${user.last_name}'s office`;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={classes.overlay} onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div className={classnames(classes.container, className, isOpen && classes.open)}>
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 mt-8">
          <div className="h-12 w-12 bg-violet-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">MD</span>
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-bold">Micro-Donations</h1>
            <p className="text-violet-200 text-xs">Artist Portal</p>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="px-4 mb-6">
          <div className="bg-violet-600/20 rounded-lg p-4 border border-violet-500/30">
            <h3 className="text-white text-sm font-medium mb-1">
              Welcome back, {user?.first_name || 'Artist'}!
            </h3>
            <p className="text-violet-200 text-xs">
              Manage your earnings from listener micro-donations
            </p>
          </div>
        </div>

        {/* Office Section */}
        <div className="mb-4 w-full">
          {/* Office Selector */}
          <div className="mb-4 w-full">
            <Popover className="relative w-full">
              {({ open, close }) => (
                <>
                  <Popover.Button className="flex items-center justify-between py-2 pl-5 pr-3 h-12 w-full bg-violet-600 text-xs text-white hover:bg-violet-700 focus:outline-none">
                    <div className="flex items-center space-x-2 overflow-hidden min-w-0 flex-1">
                      <span className="truncate">
                        {officesLoading
                          ? 'Loading offices...'
                          : !offices || offices.length === 0
                            ? 'No offices available'
                            : selectedOffice
                              ? selectedOffice.name
                              : getDefaultOfficeName()}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${open ? 'transform rotate-180' : ''}`}
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute z-10 left-0 w-full mt-2 origin-top-right bg-[#1F1B29] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1 max-h-80 overflow-y-auto">
                        {officesLoading ? (
                          <div className="px-4 py-3 text-sm text-gray-400">Loading offices...</div>
                        ) : !offices || offices.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-yellow-400">
                            No offices available. Please create one to get started.
                          </div>
                        ) : (
                          offices.map((office) => (
                            <div
                              key={office._id}
                              className={`relative group ${selectedOffice?._id === office._id ? 'bg-violet-600/30' : ''
                                }`}
                            >
                              <button
                                onClick={() => {
                                  handleOfficeSelect(office);
                                  close();
                                }}
                                className={`flex items-center justify-between w-full px-4 py-3 text-sm text-left hover:bg-gray-700/40`}
                              >
                                <span className="truncate">{office.name}</span>
                              </button>
                            </div>
                          ))
                        )}

                        {/* Create New Office Button */}
                        <div
                          className={`border-t border-gray-700 mt-2 pt-2 ${!offices || offices.length === 0 ? 'bg-violet-600/20' : ''}`}
                        >
                          <button
                            onClick={handleCreateOfficeClick}
                            className={`flex items-center w-full px-4 py-3 text-sm text-left ${!offices || offices.length === 0 ? 'text-white font-medium' : 'text-violet-400'} hover:bg-violet-600/10`}
                          >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            <span>
                              {!offices || offices.length === 0 ? 'Create Your First Office' : 'Create New Office'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>

          {/* Only show office-specific sections if offices exist */}
          {offices && offices.length > 0 && (
            <LinkList
              items={menuItems.filter((item) => item.isOfficeSpecific)}
              onItemClick={handleMenuItemClick}
              className="w-full"
            />
          )}
        </div>

        {/* Artist Avatar */}
        <ArtistAvatar className={'mb-4 mt-auto'} />
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
                    window.location.href = '/for-artists/profile/update';
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
    </>
  );
};

const ChevronDownIcon = ({ className = '' }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const PlusIcon = ({ className = '' }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);
