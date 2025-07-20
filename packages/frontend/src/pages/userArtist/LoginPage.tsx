import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Google from '../../assets/icons/google.svg';


const LoginPage = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://mypie.app/api/for-artists/auth/loginGoogle'
        : 'http://localhost:3000/api/for-artists/auth/loginGoogle';
      window.location.href = baseUrl;
    } catch (error) {
      console.error('Google login failed:', error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-300 text-sm">
            Sign in to access your artist dashboard
          </p>
        </div>

        {/* Google Login Button */}
        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Google className="w-6 h-6" />
            )}
            <span className="text-lg">
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Terms */}
          <div className="text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <NavLink
                to="/terms/artists"
                className="text-blue-300 hover:text-blue-200 underline transition-colors"
                target="_blank"
              >
                Terms of Service
              </NavLink>{' '}
              and{' '}
              <NavLink
                to="/privacy"
                className="text-blue-300 hover:text-blue-200 underline transition-colors"
                target="_blank"
              >
                Privacy Policy
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 