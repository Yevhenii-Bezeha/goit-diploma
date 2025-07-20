import Spotify from '../../../../assets/icons/spotify.svg';
import { Modal } from '../../../shared/Modal';
import { ReactNode, useState } from 'react';
import classnames from 'classnames';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { isMobileDevice } from '../../../../utils/deviceDetection';
import { trackBusinessEvent, BusinessEvents } from '../../../../utils/analytics';

type LoginModalProps = {
  openComponent?: ReactNode;
  title?: string;
  openComponentClassName?: string;
  className?: string;
};

export const LoginModal = ({ openComponent, title = 'Login', openComponentClassName, className }: LoginModalProps) => {
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const onSpotifyLogin = async () => {
    try {
      setIsSpotifyLoading(true);

      trackBusinessEvent(BusinessEvents.LOGIN_SPOTIFY);

      if (!executeRecaptcha) {
        console.error('reCAPTCHA not initialized');
        setIsSpotifyLoading(false);
        return;
      }

      const token = await executeRecaptcha('spotify_login');

      // Check if this is a mobile device
      const isMobile = isMobileDevice();

      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/api/auth/loginSpotify'
          : 'http://localhost:3000/api/auth/loginSpotify';

      window.location.href = `${baseUrl}?deviceType=${isMobile ? 'mobile' : 'desktop'}&recaptchaToken=${token}`;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      setIsSpotifyLoading(false);
    }
  };

  // Handler for modal open/close state changes
  const handleModalChange = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <Modal
      value={isModalOpen}
      onChange={handleModalChange}
      className={classnames('rounded-2xl min-h-[auto]', className)}
      openComponent={
        openComponent ?? (
          <button
            onClick={() => setIsModalOpen(true)}
            className={classnames('bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-colors', openComponentClassName)}
          >
            {title}
          </button>
        )
      }
    >
      <div className="flex flex-col items-center p-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Connect Spotify</h2>

        <p className="text-gray-600 text-center mb-8 max-w-sm">
          Connect your Spotify account to participate in this research study on micro-donations.
        </p>

        <button
          onClick={onSpotifyLogin}
          disabled={isSpotifyLoading}
          className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-8 rounded-lg transition-colors disabled:opacity-70"
        >
          {isSpotifyLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Spotify className="w-8 h-8" />
          )}
          <span className="text-lg">
            {isSpotifyLoading ? 'Connecting...' : 'Continue with Spotify'}
          </span>
        </button>

        <div className="text-xs text-gray-500 mt-6 text-center">
          University Research Project - Academic Evaluation Only
        </div>
      </div>
    </Modal>
  );
};
