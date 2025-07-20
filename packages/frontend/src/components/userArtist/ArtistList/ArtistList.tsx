import {
  ArtistClaim,
  useCreateStripeOnboardingLinkMutation,
  useGetClaimsQuery,
  useGetUserArtistQuery,
} from '../../../redux/userArtist/userArtistApi';
import { useDeleteClaimMutation } from '../../../redux/userArtist/userArtistApi';
import Spotify from '../../../assets/icons/spotify.svg';
import Delete from '../../../assets/icons/delete.svg';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/shared/Modal';
import { Button } from '../../../components/shared/Button';
import noArtistImage from '../../../assets/image/no-artist-image.png';
import { useSelector } from 'react-redux';
import { isUserOfficeAdminSelector } from '../../../redux/userArtist/userArtistSlice';
import { RootState } from '../../../store';
import { Plus } from 'lucide-react';

const useColumnsPerRow = () => {
  const [columnsPerRow, setColumnsPerRow] = useState(() => {
    const width = window.innerWidth;
    if (width >= 1024) return 5;
    if (width >= 768) return 4;
    if (width >= 640) return 3;
    return 2;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setColumnsPerRow(5);
      else if (width >= 768) setColumnsPerRow(4);
      else if (width >= 640) setColumnsPerRow(3);
      else setColumnsPerRow(2);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return columnsPerRow;
};

const ClaimArtistSlot = ({ onClick }: { onClick?: () => void }) => {
  const navigate = useNavigate();

  const handleClaimArtist = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/for-artists/claim');
    }
  };

  return (
    <div
      className="bg-[#1F1730] rounded-[4px] sm:rounded-[2px] w-full p-3 cursor-pointer hover:bg-[#2a1f42] flex flex-col border-2 border-dashed border-violet-500/50 hover:border-violet-400 transition-colors"
      onClick={handleClaimArtist}
    >
      <div className="w-full aspect-square rounded-[4px] sm:rounded-[2px] mb-3 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-colors">
          <Plus className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex justify-center mb-2">
        <div className="w-[21px] h-[21px] opacity-0"></div>
      </div>

      <div className="text-violet-400 text-center mb-3 text-sm sm:text-base font-medium">
        Claim Artist
      </div>

      <div className="space-y-2">
        <div className="h-3 opacity-0"></div>
        <div className="h-3 opacity-0"></div>
      </div>
    </div>
  );
};

const EmptySlot = () => {
  return (
    <div className="bg-[#1F1730] rounded-[4px] sm:rounded-[2px] w-full p-3 flex flex-col opacity-30">
      <div className="w-full aspect-square bg-gray-700 rounded-[4px] sm:rounded-[2px] mb-3">
      </div>

      <div className="flex justify-center mb-2">
        <div className="w-[21px] h-[21px] bg-gray-700 rounded"></div>
      </div>

      <div className="h-4 bg-gray-700 rounded mb-3"></div>

      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

interface PendingArtistRowProps {
  artist: ArtistClaim;
}

const PendingArtistRow = ({ artist }: PendingArtistRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteClaim] = useDeleteClaimMutation();
  const isAdmin = useSelector(isUserOfficeAdminSelector);

  const handleConfirmDelete = async () => {
    try {
      await deleteClaim(artist.claim.id);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Failed to delete claim:', error);
    }
  };

  return (
    <>
      <div
        className="bg-[#1F1730] rounded-[4px] sm:rounded-[2px] w-full p-3 relative flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full mb-3">
          <img
            src={artist.artist.image || noArtistImage}
            alt={artist.artist.name}
            className="w-full aspect-square object-cover rounded-[4px] sm:rounded-[2px]"
            onError={(e) => {
              e.currentTarget.src = noArtistImage;
            }}
          />
        </div>

        <div className="flex justify-center mb-2">
          <a
            href={artist.artist.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1">
              <Spotify className="h-[21px] fill-white" />
              <span className="text-white text-xs">Spotify</span>
            </div>
          </a>
        </div>

        <div className="text-violet-400 font-medium text-center mb-3 text-sm sm:text-base">
          {artist.artist.name}
        </div>

        <div className="space-y-2">
          <div className="flex justify-center items-center">
            <span className="text-yellow-500 text-xs sm:text-sm font-medium">Pending artist</span>
          </div>

          <div className="flex justify-between items-center opacity-0">
            <span className="text-gray-400 text-xs">-</span>
            <span className="text-gray-400 text-sm">-</span>
          </div>
        </div>

        {isHovered && isAdmin && (
          <button
            className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Delete className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <Modal
        value={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        className="rounded-2xl min-h-[auto]"
      >
        <div className="p-6 min-w-[300px] sm:min-w-[400px]">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Delete Artist Claim</h2>
          <p className="text-[#8B8B8B] mb-6 text-sm sm:text-base">
            Are you sure you want to delete the claim for artist "{artist.artist.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-4 justify-end">
            <Button
              title="Cancel"
              onClick={() => setShowDeleteConfirmation(false)}
              className="bg-transparent border border-violet-500 text-violet-500 text-sm"
            />
            <Button title="Yes, Delete" onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-sm" />
          </div>
        </div>
      </Modal>
    </>
  );
};

interface SuccessfulArtistRowProps {
  artist: ArtistClaim;
}

const SuccessfulArtistRow = ({ artist }: SuccessfulArtistRowProps) => {
  const formatUSD = (amount: number) => `$${(amount / 100).toFixed(2)}`;

  return (
    <div
      className="bg-[#1F1730] rounded-[4px] sm:rounded-[2px] w-full p-3 flex flex-col"
    >
      <div className="w-full mb-3">
        <img
          src={artist.artist.image || noArtistImage}
          alt={artist.artist.name}
          className="w-full aspect-square object-cover rounded-[4px] sm:rounded-[2px]"
          onError={(e) => {
            e.currentTarget.src = noArtistImage;
          }}
        />
      </div>

      <div className="flex justify-center mb-2">
        <a
          href={artist.artist.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <Spotify className="h-[21px] fill-white" />
            <span className="text-white text-xs">Spotify</span>
          </div>
        </a>
      </div>

      <div className="text-violet-400 font-medium text-center mb-3 text-sm sm:text-base">
        {artist.artist.name}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Available</span>
          <span className="text-green-500 text-sm font-medium">
            {formatUSD(artist.wallet.available_to_payout || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Paid Out</span>
          <span className="text-white text-sm font-medium">
            {formatUSD(artist.wallet?.total_paid_out || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

interface ArtistListProps {
  claims: ArtistClaim[];
  status: 'Pending' | 'Successful';
  onClaimArtist?: () => void;
}

export const ArtistList = ({ status, onClaimArtist }: ArtistListProps) => {
  const [createStripeOnboardingLink, { isLoading: isStripeLoading }] = useCreateStripeOnboardingLinkMutation();
  const isAdmin = useSelector(isUserOfficeAdminSelector);
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);
  const { data: user } = useGetUserArtistQuery();
  const officeId = selectedOffice?._id || '';
  const columnsPerRow = useColumnsPerRow();

  const { data: allClaims = [] } = useGetClaimsQuery({ officeId: officeId || '' }, { skip: !officeId });

  const filteredClaims = allClaims.filter((claim) => claim.claim.status === status);

  const handleStripeSetup = async () => {
    if (!officeId) {
      console.error('No office selected');
      return;
    }

    try {
      const { url } = await createStripeOnboardingLink({ officeId }).unwrap();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to create Stripe login link:', error);
    }
  };

  const showStripeBanner =
    status === 'Successful' &&
    filteredClaims.length > 0 &&
    selectedOffice?.stripe_connect_account_status !== 'complete' &&
    isAdmin;

  const getStripeBannerContent = () => {
    switch (selectedOffice?.stripe_connect_account_status) {
      case 'pending':
        return {
          message: 'Additional information is required for your Stripe account to receive payments.',
          buttonText: 'Complete Setup',
        };
      case 'requires_information':
        return {
          message: 'Additional information is required for your Stripe account to receive payments.',
          buttonText: 'Complete Setup',
        };
      case 'pending_verification':
        return {
          message: 'Your Stripe account is being verified. Click to check the status.',
          buttonText: 'Check Status',
        };
      default:
        return {
          message: 'To receive payments from fans, please set up your Stripe account',
          buttonText: 'Set up Stripe',
        };
    }
  };

  if (filteredClaims.length === 0 && status === 'Pending') {
    return null;
  }

  const bannerContent = getStripeBannerContent();

  return (
    <div>
      {showStripeBanner && (
        <div className="bg-violet-900 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-white text-sm sm:text-base">{bannerContent.message}</span>
          <button
            onClick={handleStripeSetup}
            disabled={isStripeLoading}
            className="bg-violet-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-violet-700 text-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStripeLoading ? 'LOADING...' : bannerContent.buttonText}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 sm:mb-8 mt-4">
        <ClaimArtistSlot onClick={onClaimArtist} />

        {filteredClaims.map((claim) => (
          <div key={claim.claim.id}>
            {status === 'Pending' ? <PendingArtistRow artist={claim} /> : <SuccessfulArtistRow artist={claim} />}
          </div>
        ))}

        {status === 'Successful' && (() => {
          const totalItems = 1 + filteredClaims.length;
          const remainingInRow = columnsPerRow - (totalItems % columnsPerRow);
          const shouldShowPlaceholders = remainingInRow < columnsPerRow && remainingInRow > 0;

          return shouldShowPlaceholders ? Array.from({ length: remainingInRow }).map((_, index) => (
            <EmptySlot key={`empty-${index}`} />
          )) : null;
        })()}
      </div>
    </div>
  );
};
