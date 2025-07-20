import mongoose, { Types } from 'mongoose';

import Artist, { IArtist } from '../../models/userFan/Artist';
import Claim from '../../models/userFan/Claim';

import { getUserOffices } from './officeService';
import { getArtistWalletBalance } from './artistWalletTransactionService';

import AppError from '../../utils/AppError';
import logger from '../../utils/logger';

interface PopulatedOffice {
  _id: Types.ObjectId;
  name: string;
}

/**
 * Get claims for a user or office
 */
export const getUserClaims = async (
  userId: string,
  status: string | undefined,
  officeId: string
) => {
  const userOffices = await getUserOffices(userId);
  const hasAccess = userOffices.some(
    (office) => office._id.toString() === officeId
  );

  if (!hasAccess) {
    throw AppError.forbidden('You do not have access to this office');
  }

  const query = {
    office_id: new mongoose.Types.ObjectId(officeId)
  } as { office_id: mongoose.Types.ObjectId; status?: string };

  if (status && ['Pending', 'Successful', 'Rejected'].includes(status)) {
    query.status = status;
  }

  const claims = await Claim.find(query)
    .populate('artist_id', 'name image external_url')
    .populate('office_id', 'name')
    .lean();

  const claimsData = await Promise.all(
    claims.map(async (claim) => {
      const artistInfo = claim.artist_id as unknown as IArtist;

      const walletInfo =
        claim.status === 'Successful'
          ? await getArtistWalletBalance(artistInfo._id.toString())
          : { balance: 0, totalMoneyIn: 0, totalMoneyOut: 0 };

      return {
        claim: {
          id: claim._id,
          status: claim.status,
          created_at: claim.createdAt
        },
        artist: {
          id: artistInfo._id,
          name: artistInfo.name,
          image: artistInfo.image,
          external_url: artistInfo.external_url
        },
        office: claim.office_id
          ? {
            id: claim.office_id._id,
            name: (claim.office_id as unknown as PopulatedOffice).name
          }
          : null,
        wallet: {
          available_to_payout: walletInfo.balance,
          total_paid_out: (walletInfo as any)?.totalPaidOut || 0
        }
      };
    })
  );

  return claimsData;
};

/**
 * Create a new claim for an artist
 */
export const createClaim = async (
  userId: string,
  data: {
    selectedArtist: string;
    agreesToWaiver: boolean;
    agreesToFundsTerms: boolean;
    agreesToTerms: boolean;
    officeId: string;
    verificationMethod: string;
    platformName: string;
    verificationString: string;
  }
) => {
  const {
    selectedArtist,
    agreesToWaiver,
    agreesToFundsTerms,
    agreesToTerms,
    officeId,
    verificationMethod,
    platformName,
    verificationString
  } = data;

  if (!selectedArtist || !agreesToWaiver || !agreesToFundsTerms || !agreesToTerms || !officeId || !verificationMethod || !platformName || !verificationString) {
    throw new AppError('All fields are required', 400, {
      context: {
        operation: 'createClaim',
        userId,
        hasArtist: !!selectedArtist,
        hasWaiver: agreesToWaiver,
        hasFundsTerms: agreesToFundsTerms,
        hasTerms: agreesToTerms,
        hasOffice: !!officeId,
        hasVerificationMethod: !!verificationMethod,
        hasPlatformName: !!platformName,
        hasVerificationString: !!verificationString
      }
    });
  }

  const userOffices = await getUserOffices(userId);
  const hasAccess = userOffices.some(
    (office) => office._id.toString() === officeId
  );

  if (!hasAccess) {
    throw AppError.forbidden('You do not have access to this office');
  }

  const artist = await Artist.findById(selectedArtist);
  if (!artist) {
    throw new AppError('Artist not found', 404, {
      context: {
        operation: 'createClaim',
        userId,
        artistId: selectedArtist
      }
    });
  }

  const existingClaim = await Claim.findOne({
    artist_id: selectedArtist,
    office_id: officeId,
    status: { $in: ['Pending', 'Successful'] }
  });

  if (existingClaim) {
    throw new AppError('A claim already exists for this artist in this office', 400, {
      context: {
        operation: 'createClaim',
        userId,
        artistId: selectedArtist,
        officeId,
        existingClaimId: existingClaim._id
      }
    });
  }

  const claim = new Claim({
    artist_id: selectedArtist,
    office_id: officeId,
    claiming_user_id: userId,
    status: 'Pending',
    agreesToWaiver,
    agreesToFundsTerms,
    agreesToTerms,
    verificationMethod,
    platformName,
    verificationString
  });

  await claim.save();

  logger.info('Claim created successfully', {
    claimId: claim._id,
    userId,
    artistId: selectedArtist,
    officeId,
    operation: 'createClaim'
  });

  return {
    id: claim._id,
    status: claim.status,
    created_at: claim.createdAt
  };
};

/**
 * Delete a claim
 */
export const deleteClaim = async (claimId: string, userId: string) => {
  const claim = await Claim.findById(claimId);

  if (!claim) {
    throw new AppError('Claim not found', 404, {
      context: {
        operation: 'deleteClaim',
        userId,
        claimId
      }
    });
  }

  const userOffices = await getUserOffices(userId);
  const hasAccess = userOffices.some(
    (office) => office._id.toString() === claim.office_id?.toString()
  );

  if (!hasAccess) {
    throw AppError.forbidden('You do not have access to this claim');
  }

  if (claim.status !== 'Pending') {
    throw new AppError('Only pending claims can be deleted', 400, {
      context: {
        operation: 'deleteClaim',
        userId,
        claimId,
        currentStatus: claim.status
      }
    });
  }

  await Claim.findByIdAndDelete(claimId);

  logger.info('Claim deleted successfully', {
    claimId,
    userId,
    operation: 'deleteClaim'
  });

  return { message: 'Claim deleted successfully' };
};
