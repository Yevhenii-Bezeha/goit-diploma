import { Fragment, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Popover, Transition } from '@headlessui/react';
import ReactAvatar from 'react-avatar';
import UserAvatar from '../../../assets/icons/user-avatar.svg';
import { useGetUserQuery } from '../../../redux/userFan';
import classes from './Avatar.module.css';


export const Avatar = () => {
  const navigate = useNavigate();
  const { data: userData } = useGetUserQuery();

  const handleLogout = () => {
    Cookies.remove('mypie_access_token_fan');
    window.location.reload();
  };

  return (
    <div className={classes.container}>
      <style>{`
        .grecaptcha-badge {
          visibility: hidden !important;
        }
      `}</style>
      <Popover className="relative">
        {({ close }) => (
          <>
            <Popover.Button className="flex items-center focus:outline-none">
              {userData?.data?.image_url ? (
                <img src={userData.data.image_url} alt="avatar" width="32" height="32" className="rounded-full" />
              ) : userData?.data?.user_name ? (
                <ReactAvatar
                  name={userData.data.user_name}
                  size="32"
                  round={true}
                  textSizeRatio={1.8}
                  color="#8B5CF6"
                  maxInitials={2}
                />
              ) : (
                <UserAvatar width={32} height={32} />
              )}
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
              <Popover.Panel className="absolute top-full right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleLogout();
                      close();
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};
