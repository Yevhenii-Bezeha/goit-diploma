import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useGetUserQuery } from '../../redux/userFan';
import Close from '../../assets/icons/close.svg';
import classnames from 'classnames';
import { useEffect } from 'react';

import DashboardIcon from '../../assets/icons/dashboard.svg';
import PieIcon from '../../assets/icons/pie.svg';
import ReactAvatar from 'react-avatar';

interface MobileNavOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const MobileNavOverlay = ({ open, onClose }: MobileNavOverlayProps) => {
  const navigate = useNavigate();
  const { data: userData } = useGetUserQuery();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = () => {
    Cookies.remove('mypie_access_token_fan');
    window.location.reload();
  };
  const userName = userData?.data?.user_name;

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
          'fixed inset-0 h-screen bg-[#251E2F]/95 transition-opacity duration-300 z-50',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      {/* Slide-in panel */}
      <div
        className={classnames(
          'fixed top-0 right-0 h-screen w-4/5 max-w-xs bg-gradient-to-b from-slate-900 to-purple-900 shadow-2xl flex flex-col p-6 transition-transform duration-300 z-[1000]',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button className="absolute top-4 right-4 p-2 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 transition-colors" onClick={onClose} aria-label="Close menu">
          <Close width={24} height={24} className="text-white" />
        </button>

        <div className="flex flex-col mt-16">
          {/* User info section */}
          {userData?.data && (
            <div className="flex flex-col items-center mb-6">
              {userData.data.image_url ? (
                <img src={userData.data.image_url} alt="avatar" className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-purple-400" />
              ) : userData.data.user_name ? (
                <ReactAvatar
                  name={userData.data.user_name}
                  size="64"
                  round={true}
                  textSizeRatio={1.8}
                  color="#8B5CF6"
                  maxInitials={2}
                  className="mb-3 border-2 border-purple-400"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold mb-3 border-2 border-purple-400">
                  {userName?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-white font-bold text-lg">{userName}</span>
              <span className="text-purple-300 text-sm">Research Participant</span>
            </div>
          )}

          {/* Navigation links - only available routes */}
          <div className="text-white flex flex-col gap-3 mb-6">
            {/* Dashboard */}
            <button
              className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-purple-800/50 transition-colors text-lg font-medium"
              onClick={() => {
                navigate('/dashboard');
                onClose();
              }}
            >
              <DashboardIcon className="w-6 h-6" />
              <span>Dashboard</span>
            </button>
            {/* Pie */}
            <button
              className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-purple-800/50 transition-colors text-lg font-medium"
              onClick={() => {
                navigate('/pie');
                onClose();
              }}
            >
              <PieIcon className="w-6 h-6" />
              <span>Pie</span>
            </button>
          </div>

          <div className="border-t border-purple-700/50 my-4" />

          {/* Sign out option */}
          <div className="flex flex-col space-y-1">
            <button
              className="text-left text-red-400 text-lg font-medium py-3 px-4 rounded-lg hover:bg-red-500/10 transition-colors"
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
