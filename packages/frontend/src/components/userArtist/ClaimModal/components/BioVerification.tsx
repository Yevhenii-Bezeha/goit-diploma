import { useFormikContext } from 'formik';
import { ClaimFormInternalValues } from '../validation';
import React, { useEffect, useState } from 'react';

interface BioVerificationProps {
  isSubmitting: boolean;
  onComplete: () => void;
  createdClaimId?: string | null;
  onCreateClaimAndVerify?: () => Promise<void>;
}

export const BioVerification = ({ isSubmitting, onComplete, createdClaimId }: BioVerificationProps) => {
  const { values, setFieldValue } = useFormikContext<ClaimFormInternalValues>();
  const [copied, setCopied] = useState(false);
  const [bioVerificationMessage, setBioVerificationMessage] = useState<string | null>(null);

  const handleContactSupport = () => {
  };

  const getArtistProfileUrl = () => {
    if (!values.selectedArtistData?._id) return '';
    return `https://mypie.app/artist-public/${values.selectedArtistData._id}`;
  };

  const artistProfileUrl = getArtistProfileUrl();
  const spotifyUrl = values.selectedArtistData?.external_url || '';

  useEffect(() => {
    if (artistProfileUrl) {
      setFieldValue('verificationString', artistProfileUrl);
    }
  }, [artistProfileUrl, setFieldValue]);

  useEffect(() => {
    if (!values.selectedPlatform) {
      setFieldValue('selectedPlatform', {
        id: 'spotify',
        name: 'Spotify for Artists',
        url: spotifyUrl
      });
    }
  }, [values.selectedPlatform, setFieldValue, spotifyUrl]);

  const handleBioVerification = async () => {
    setBioVerificationMessage('Please add the profile link to your Spotify bio and contact support for manual verification.');

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Manual Verification</h3>
        <p className="text-gray-400 text-sm">
          Requires manual review by our team (up to 5 business days)
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-medium">Add your profile link to your Spotify bio:</span>
        </div>

        <p className="text-gray-400 text-sm">
          We'll verify your identity by checking your Spotify for Artists profile. Please add your artist profile link to your bio.
        </p>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Add this link to your Spotify bio:</label>
          <div
            className="w-full bg-gray-700 rounded-md px-4 py-3 border border-gray-600 flex items-center justify-between cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(artistProfileUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            title="Click to copy"
          >
            <span className="text-blue-400 font-mono text-sm break-all select-all">
              {artistProfileUrl}
            </span>
            <span className="text-xs text-gray-400 ml-2">Click to copy</span>
          </div>
          {copied && (
            <div className="text-xs text-green-400">Link copied to clipboard</div>
          )}
        </div>

        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <h4 className="font-medium text-white mb-4">Instructions:</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
            <li>
              Go to your <a href="https://artists.spotify.com/home" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Spotify for Artists dashboard</a> and log in.
            </li>
            <li>
              If you don't have access, <a href="https://artists.spotify.com/claim" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">claim your artist profile here</a>.
            </li>
            <li>
              Once logged in, select your artist profile.
            </li>
            <li>Edit your profile bio and add the profile link shown above.</li>
            <li>Save your changes.</li>
          </ol>

          <div className="mt-6">
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleBioVerification}
              disabled={isSubmitting}
            >
              I have completed this step
            </button>
          </div>

          {bioVerificationMessage && (
            <div className="mt-4 text-sm text-gray-400 text-center">
              {bioVerificationMessage}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p className="mb-2">
          <strong>Note:</strong> Once your artist claim is verified, you can remove the link from your bio.
        </p>
        <p>
          Having trouble?{' '}
          <button onClick={handleContactSupport} className="text-blue-400 underline">
            Contact support
          </button>
        </p>
      </div>
    </div>
  );
};
