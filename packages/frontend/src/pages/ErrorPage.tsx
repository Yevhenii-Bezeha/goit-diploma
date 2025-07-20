import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useRouteError } from 'react-router-dom';
import { GlobalErrorBoundary } from '../components/shared/ErrorBoundary/ErrorBoundary';

interface ErrorPageProps {
  title?: string;
  error?: Error;
}

const ErrorPage = ({ title = 'Error', error }: ErrorPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorType, setErrorType] = useState('');
  const routeError = useRouteError() as Error;

  useEffect(() => {
    // Get error type from URL
    const params = new URLSearchParams(location.search);
    const errorTypeFromUrl = params.get('type') || 'unknown';
    setErrorType(errorTypeFromUrl);

    // Log the error to console
    const errorToLog = error || routeError;
    if (errorToLog) {
      console.error('Error caught by ErrorPage:', errorToLog);
    }
  }, [location, error, routeError]);

  // Error message mapping
  const getErrorMessage = () => {
    switch (errorType) {
      case 'state_mismatch':
        return 'Authentication state mismatch. Your login session may have expired.';
      case 'invalid_token':
        return "We couldn't validate your authentication token.";
      case 'invalid_code':
        return 'Invalid authentication code provided.';
      case 'invalid_request':
        return 'Your authentication request was invalid or incomplete.';
      case 'authentication_failed':
        return 'Authentication failed. Please try again.';
      default:
        return "We're sorry, but an error occurred. Our team has been notified and we're working to fix it.";
    }
  };

  return (
    <GlobalErrorBoundary>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white p-4">
        <div className="max-w-md w-full bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden">
          <div className=" p-4">
            <h1 className="text-2xl font-bold text-center">{title}</h1>
          </div>

          <div className="p-6">
            <div className="mb-6 text-center text-lg">{getErrorMessage()}</div>

            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-md transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
};

export default ErrorPage;
