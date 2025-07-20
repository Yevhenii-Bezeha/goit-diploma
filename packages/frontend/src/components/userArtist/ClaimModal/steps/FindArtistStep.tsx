import { useFormikContext } from 'formik';
import { useState } from 'react';
import { ArtistSearchResult } from '../../../../redux/userArtist/userArtistApi';
import { ArtistSearch } from '../components/ArtistSearch';
import { ClaimFormValues } from '../validation';
import { Button } from '../../../shared/Button';
import { Pagination } from '../../../shared/Pagination/Pagination';
import { ClaimedArtistBanner } from '../components/ClaimedArtistBanner';
import { useGetClaimsQuery } from '../../../../redux/userArtist/userArtistApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import React from 'react';

type FindArtistStepProps = {
  searchResults: ArtistSearchResult[] | undefined;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  onSearch: (searchTerm: string) => void;
  onPageChange: (page: number) => void;
  onSubmit: () => void;
  onPreviousStep: () => void;
  currentStep: number;
};

export const FindArtistStep = ({
  searchResults,
  totalPages,
  currentPage,
  isFetching,
  onSearch,
  onPageChange,
  onSubmit,
  onPreviousStep,
  currentStep,
}: FindArtistStepProps) => {
  const { values } = useFormikContext<ClaimFormValues>();
  const [showClaimedBanner, setShowClaimedBanner] = useState(false);
  const [pendingClaimError, setPendingClaimError] = useState<string | null>(null);

  // Get the selected artist data
  const selectedArtist = searchResults?.find((artist) => artist._id === values.selectedArtist);

  // Get selected office from Redux
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);
  const officeId = selectedOffice?._id;

  // Fetch all claims for the current office
  const { data: claims = [], isLoading: isClaimsLoading } = useGetClaimsQuery(
    { officeId },
    { skip: !officeId }
  );

  // Check for pending claim for selected artist
  const hasPendingClaim = !!(
    values.selectedArtist &&
    claims.some(
      (claim) =>
        claim.artist.id === values.selectedArtist &&
        claim.claim.status === 'Pending'
    )
  );

  // Show error if pending claim exists
  React.useEffect(() => {
    if (hasPendingClaim) {
      setPendingClaimError(
        'You already have a pending claim for this artist. Please wait for it to be processed before submitting another.'
      );
    } else {
      setPendingClaimError(null);
    }
  }, [hasPendingClaim, values.selectedArtist]);

  const handleContinueClick = () => {
    if (hasPendingClaim) {
      setPendingClaimError(
        'You already have a pending claim for this artist. Please wait for it to be processed before submitting another.'
      );
      return;
    }
    if (selectedArtist?.is_claimed) {
      setShowClaimedBanner(true);
    } else {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Find Your Artist</h2>
        <p className="text-gray-400 text-sm">Search for the artist you want to claim</p>
      </div>

      <div className="flex-1">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <ArtistSearch searchResults={searchResults} isFetching={isFetching} onSearch={onSearch} />

          {/* Show the claimed artist banner when a user tries to continue with a claimed artist */}
          {showClaimedBanner && <ClaimedArtistBanner />}

          {/* Show pending claim error if exists */}
          {pendingClaimError && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 p-3 my-4 rounded-md text-center text-sm">
              {pendingClaimError}
            </div>
          )}

          {searchResults && searchResults.length > 0 && totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination currentPage={currentPage} totalCount={totalPages} onChange={onPageChange} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-6 border-t border-gray-700">
        <Button
          onClick={handleContinueClick}
          disabled={!values.selectedArtist || hasPendingClaim || isClaimsLoading}
          className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors ${!values.selectedArtist || hasPendingClaim ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
