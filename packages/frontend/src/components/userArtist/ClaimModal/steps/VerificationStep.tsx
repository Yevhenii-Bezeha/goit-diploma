import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { ArtistSearchResult } from '../../../../redux/userArtist/userArtistApi';
import { ArtistRow } from '../components/ArtistRow';
import { BioVerification } from '../components/BioVerification';
import { ClaimFormInternalValues } from '../validation';
import { Button } from '../../../shared/Button';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

type VerificationStepProps = {
  selectedArtist: ArtistSearchResult;
  email: string;
  isSubmitting: boolean;
  onVerificationComplete: () => void;
  onClose: () => void;
  onPreviousStep: () => void;
  onClearVerificationMethod?: () => void;
  createdClaimId?: string | null;
};

export const VerificationStep = ({
  selectedArtist,
  isSubmitting,
  onVerificationComplete,
  onPreviousStep,
  createdClaimId,
}: VerificationStepProps) => {
  const { values, setFieldValue, validateForm } = useFormikContext<ClaimFormInternalValues>();
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);

  useEffect(() => {
    if (!values.verificationMethod) {
      setFieldValue('verificationMethod', 'link');
    }
  }, [values.verificationMethod, setFieldValue]);

  const handleComplete = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      try {
        await onVerificationComplete();
      } catch (error) {
        console.error('Error submitting verification:', error);
      }
    }
  };

  if (!selectedArtist) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Verify Artist Ownership</h2>
        <p className="text-gray-400 text-sm">Complete the verification process</p>
      </div>

      <div className="flex-1">
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <ArtistRow artist={selectedArtist} />
          </div>

          {selectedOffice && (
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-blue-400 font-medium">{selectedOffice.name}</span>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <BioVerification
              isSubmitting={isSubmitting}
              onComplete={handleComplete}
              createdClaimId={createdClaimId}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-start pt-6 mt-6 border-t border-gray-700">
        <Button
          type="button"
          onClick={onPreviousStep}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-md transition-colors"
        >
          Back
        </Button>
      </div>
    </div>
  );
};
