import { useState } from 'react';
import { isMobileDevice } from '../../utils/deviceDetection';
import { NavLink } from 'react-router-dom';

import Spotify from '../../assets/icons/spotify.svg';

const LoginPage = () => {
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);

  const onSpotifyLogin = async () => {
    try {
      setIsSpotifyLoading(true);

      const isMobile = isMobileDevice();

      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/api/auth/loginSpotify'
          : 'http://localhost:3000/api/auth/loginSpotify';

      window.location.href = `${baseUrl}?deviceType=${isMobile ? 'mobile' : 'desktop'}`;
    } catch (error) {
      console.error('Spotify login failed:', error);
      setIsSpotifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <NavLink to="/" className="text-white hover:text-purple-300 transition-colors">
          ← Back to Research
        </NavLink>
        <NavLink to="/for-artists" className="text-purple-300 hover:text-white transition-colors">
          I am an artist
        </NavLink>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Research</h1>
              <p className="text-purple-200">Connect your Spotify to participate</p>
            </div>

            {/* Spotify Login Button */}
            <div className="mb-8">
              <button
                onClick={onSpotifyLogin}
                disabled={isSpotifyLoading}
                className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-70"
              >
                {isSpotifyLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Spotify className="w-8 h-8" />
                )}
                <span className="text-lg">
                  {isSpotifyLoading ? 'Connecting to Spotify...' : 'Continue with Spotify'}
                </span>
              </button>
            </div>

            {/* Research Information */}
            <div className="text-center space-y-4">
              <p className="text-purple-300 text-sm leading-relaxed">
                This research prototype connects to your Spotify account to analyze listening patterns
                and demonstrate micro-donation distribution to artists.
              </p>
              <p className="text-purple-400 text-xs">
                University Research Project - Academic Evaluation Only
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage; 