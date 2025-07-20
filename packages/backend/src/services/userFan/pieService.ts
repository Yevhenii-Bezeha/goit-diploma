import mongoose from 'mongoose';
import Claim from '../../models/userFan/Claim';
import Pie from '../../models/userFan/Pie';

import { RealtimePieArtistData } from './pieRealtimeCalculationService';
import { UserListeningStatsService } from './UserListeningStatsService';
import User from '../../models/userFan/User';
import AppError from '../../utils/AppError';
import logger from '../../utils/logger';

import { createArtistCreditTransaction } from '../userArtist/artistWalletTransactionService';
import { calculateRealtimePieData } from './pieRealtimeCalculationService';
import {
  getFanWalletBalance,
  createPiePaymentTransaction,
} from './fanWalletTransactionService';

type ManualInclusionStatus = 'DEFAULT' | 'INCLUDED' | 'EXCLUDED';

export interface PieDetails {
  is_recurring: boolean;
  id: object;
  amount: number;
  is_paid: boolean | false;
  start_date: string;
  end_date: string;
  count_tracks: number;
  count_artists: number;
  total_time_listened_artists: number;
  artistLimit: number;
  artistPopularity: number;
  is_active: boolean;
  stripe_charge_id: string;
  excludeNonActive: boolean;
  is_completed: boolean;
  snapshot?: PieSnapshot;
  is_trialing?: boolean;
}

interface PieSnapshot {
  stats?: {
    count_tracks: number;
    count_artists: number;
    total_time_listened: number;
  };
  included_artists: Array<{
    artist_id: string;
    artist_name: string;
    artist_external_url: string;
    artist_image: string;
    total_time_listened: string;
    total_tracks_listened: number;
    popularity: number;
    money?: string;
    money_after_fees?: string;
    percentage?: string;
    is_claimed?: boolean;
    claim_info?: {
      claiming_user_id: string;
      claim_id: string;
      stripe_connect_account_id?: string;
    };
    payment_status?: {
      status: PaymentStatus;
      transfer_id?: string;
      wallet_transaction_id?: string;
    };
  }>;
  excluded_artists: Array<{
    artist_id: string;
    artist_name: string;
    artist_external_url: string;
    artist_image: string;
    total_time_listened: string;
    total_tracks_listened: number;
    popularity: number;
    reasons: string[];
  }>;
  wallet_transfer?: {
    amount: number;
    reason: string;
    timestamp: Date;
  };
}

type PaymentStatus = 'transferred' | 'wallet_transaction' | 'failed';


export function validatePiePaymentConsistency(pie: {
  is_paid: boolean;
  stripe_charge_id: string | null;
  _id?: string | object;
}): { isValid: boolean; error?: string } {
  if (pie.is_paid && pie.stripe_charge_id && !pie.stripe_charge_id.trim()) {
    return {
      isValid: false,
      error: 'Paid pie with invalid stripe_charge_id'
    };
  }
  return { isValid: true };
}

export async function getActivePieById(
  id: string,
  userId: string
): Promise<Partial<PieDetails> | null> {
  const pie = await Pie.findById(id);

  if (!pie) return null;

  const validation = validatePiePaymentConsistency({
    is_paid: pie.is_paid,
    stripe_charge_id: pie.stripe_charge_id,
    _id: pie._id
  });

  if (!validation.isValid) {
    logger.error('CRITICAL: Pie payment state is inconsistent', {
      pieId: id,
      pieUserId: pie.user_id,
      requestedUserId: userId,
      isPaid: pie.is_paid,
      amount: pie.amount,
      stripeChargeId: pie.stripe_charge_id,
      validationError: validation.error
    });
  }

  const realtimeData = await calculateRealtimePieData(
    userId,
    pie._id.toString(),
    pie.artistLimit,
    pie.artistPopularity,
    pie.excludeNonActive
  );

  return {
    is_recurring: pie.is_recurring,
    id: pie._id,
    amount: pie.amount,
    is_paid: pie.is_paid,
    start_date: new Date(pie.start_date).toISOString().split('T')[0],
    end_date: new Date(pie.end_date).toISOString().split('T')[0],
    count_tracks: realtimeData.stats.count_tracks,
    count_artists: realtimeData.stats.count_artists,
    total_time_listened_artists: realtimeData.stats.total_time_listened,
    artistLimit: pie.artistLimit,
    artistPopularity: pie.artistPopularity,
    excludeNonActive: pie.excludeNonActive,
    is_active: pie.is_active,
    stripe_charge_id: pie.stripe_charge_id,
    is_completed: pie.is_completed,
    is_trialing: pie.is_trialing
  };
}

interface ArtistBase {
  artist_id: string;
  artist_name: string;
  artist_image: string;
  artist_external_url: string;
  popularity: number;
  total_tracks_listened: number;
}

interface ArtistWithTime extends ArtistBase {
  total_time_listened: string | number;
  pie_artist_id?: string;
  reasons?: string[];
}

interface IncludedArtist extends ArtistBase {
  total_time_listened: string;
  percentage: string;
  money: string;
  money_after_fees: string;
  weight?: string;
  is_claimed: boolean;
  pie_artist_id?: string;
  reasons?: string[];
  claim_info?: {
    claiming_user_id: string;
    claim_id: string;
    stripe_connect_account_id?: string;
  };
}

interface ExcludedArtist extends ArtistBase {
  total_time_listened: string;
  pie_artist_id?: string;
  reasons?: string[];
  is_banned?: boolean;
}

const getTimeMs = (timeListened: string | number): number => {
  if (typeof timeListened === 'number') {
    return timeListened;
  }
  const asNumber = parseInt(timeListened);
  if (!isNaN(asNumber)) {
    return asNumber;
  }
  return parseInt(timeListened.replace(/[^0-9]/g, '')) || 0;
};

export const calculateArtistMoney = (
  artists: ArtistWithTime[],
  grossAmount: number,
  netAmountAfterFees: number,
  pieSettingsPopularity = 0
): { includedArtists: IncludedArtist[]; excludedArtists: ExcludedArtist[] } => {
  const totalTimeListened = artists.reduce(
    (sum, artist) => sum + getTimeMs(artist.total_time_listened),
    0
  );

  const MIN_AMOUNT_PER_ARTIST = 0.01;

  let initialArtists: IncludedArtist[];

  if (!pieSettingsPopularity) {
    initialArtists = artists.map((artist) => {
      const artistTime = getTimeMs(artist.total_time_listened);
      const percentage =
        totalTimeListened > 0 ? (artistTime / totalTimeListened) * 100 : 0;
      const filteredPercentage =
        totalTimeListened > 0 ? artistTime / totalTimeListened : 0;

      const grossMoney = filteredPercentage * grossAmount;
      const netMoneyAfterFees = filteredPercentage * netAmountAfterFees;

      return {
        ...artist,
        total_time_listened: artistTime.toString(),
        percentage: percentage.toFixed(2),
        money: grossMoney.toFixed(2),
        money_after_fees: netMoneyAfterFees.toFixed(2),
        is_claimed: false
      };
    });
  } else {
    const sliderStrength = pieSettingsPopularity / 100;
    const MAX_ADJUSTMENT = 0.5;

    const popularities = artists.map((artist) => artist.popularity ?? 50);
    const averagePopularity =
      popularities.reduce((sum, pop) => sum + pop, 0) / popularities.length;
    const maxDeviation = Math.max(
      ...popularities.map((pop) => Math.abs(pop - averagePopularity))
    );

    const normalizedMaxDeviation = maxDeviation > 0 ? maxDeviation : 1;

    const weights = artists.map((artist) => {
      const artistTime = getTimeMs(artist.total_time_listened);
      const popularity = artist.popularity ?? 50;

      const relativePopularityAdjustment =
        (popularity - averagePopularity) / normalizedMaxDeviation;

      const adjustmentFactor =
        -relativePopularityAdjustment * sliderStrength * MAX_ADJUSTMENT;
      const weight = Math.max(0.1, Math.min(2.0, 1 + adjustmentFactor));

      return {
        artistTime,
        weightedTime: artistTime * weight,
        weight: weight
      };
    });

    const totalWeightedTime = weights.reduce(
      (sum, w) => sum + w.weightedTime,
      0
    );

    initialArtists = artists.map((artist, index) => {
      const artistTime = getTimeMs(artist.total_time_listened);
      const weightedPercentage =
        totalWeightedTime > 0
          ? weights[index].weightedTime / totalWeightedTime
          : 0;
      const percentage = weightedPercentage * 100;

      const grossMoney = weightedPercentage * grossAmount;
      const netMoneyAfterFees = weightedPercentage * netAmountAfterFees;

      return {
        ...artist,
        total_time_listened: artistTime.toString(),
        percentage: percentage.toFixed(2),
        weight: weights[index].weight.toFixed(2),
        money: grossMoney.toFixed(2),
        money_after_fees: netMoneyAfterFees.toFixed(2),
        is_claimed: false
      };
    });
  }

  const artistsWithMinimumAmount = initialArtists.filter(
    (artist) => parseFloat(artist.money_after_fees) >= MIN_AMOUNT_PER_ARTIST
  );

  if (artistsWithMinimumAmount.length < initialArtists.length) {
    const excludedArtists = initialArtists.filter(
      (artist) => parseFloat(artist.money_after_fees) < MIN_AMOUNT_PER_ARTIST
    );
    const excludedNetAmount = excludedArtists.reduce(
      (sum, artist) => sum + parseFloat(artist.money_after_fees),
      0
    );
    const excludedGrossAmount = excludedArtists.reduce(
      (sum, artist) => sum + parseFloat(artist.money),
      0
    );

    logger.info('Filtering out artists with amounts below minimum threshold', {
      totalArtists: initialArtists.length,
      artistsWithMinimumAmount: artistsWithMinimumAmount.length,
      excludedArtists: excludedArtists.length,
      excludedNetAmount: excludedNetAmount.toFixed(2),
      excludedGrossAmount: excludedGrossAmount.toFixed(2),
      minimumAmount: MIN_AMOUNT_PER_ARTIST
    });

    if (excludedNetAmount > 0 && artistsWithMinimumAmount.length > 0) {
      const totalRemainingNetAmount = artistsWithMinimumAmount.reduce(
        (sum, artist) => sum + parseFloat(artist.money_after_fees),
        0
      );
      const totalRemainingGrossAmount = artistsWithMinimumAmount.reduce(
        (sum, artist) => sum + parseFloat(artist.money),
        0
      );

      artistsWithMinimumAmount.forEach((artist, index) => {
        const currentNetAmount = parseFloat(artist.money_after_fees);
        const currentGrossAmount = parseFloat(artist.money);

        const redistributionNetShare = totalRemainingNetAmount > 0
          ? (currentNetAmount / totalRemainingNetAmount) * excludedNetAmount
          : excludedNetAmount / artistsWithMinimumAmount.length;

        const redistributionGrossShare = totalRemainingGrossAmount > 0
          ? (currentGrossAmount / totalRemainingGrossAmount) * excludedGrossAmount
          : excludedGrossAmount / artistsWithMinimumAmount.length;

        const newNetAmount = currentNetAmount + redistributionNetShare;
        const newGrossAmount = currentGrossAmount + redistributionGrossShare;

        artistsWithMinimumAmount[index] = {
          ...artist,
          money: newGrossAmount.toFixed(2),
          money_after_fees: newNetAmount.toFixed(2)
        };
      });

      logger.info('Redistributed excluded amounts to remaining artists', {
        totalRemainingNetAmount: totalRemainingNetAmount.toFixed(2),
        totalRemainingGrossAmount: totalRemainingGrossAmount.toFixed(2),
        redistributionNetAmount: excludedNetAmount.toFixed(2),
        redistributionGrossAmount: excludedGrossAmount.toFixed(2)
      });
    }
  }

  const totalDistributedNet = artistsWithMinimumAmount.reduce(
    (sum, artist) => sum + parseFloat(artist.money_after_fees),
    0
  );

  const totalDistributedGross = artistsWithMinimumAmount.reduce(
    (sum, artist) => sum + parseFloat(artist.money),
    0
  );

  if (artistsWithMinimumAmount.length > 0) {
    const roundingDifferenceNet = Math.abs(totalDistributedNet - netAmountAfterFees);
    const roundingDifferenceGross = Math.abs(totalDistributedGross - grossAmount);

    if (roundingDifferenceNet > 0.02) {
      logger.warn(`Rounding difference exceeds 2 cents (net): distributed (${totalDistributedNet.toFixed(2)}) vs netAmountAfterFees (${netAmountAfterFees.toFixed(2)})`);
    }
    if (roundingDifferenceGross > 0.02) {
      logger.warn(`Rounding difference exceeds 2 cents (gross): distributed (${totalDistributedGross.toFixed(2)}) vs grossAmount (${grossAmount.toFixed(2)})`);
    }
  }

  if (totalDistributedNet > netAmountAfterFees && artistsWithMinimumAmount.length > 0) {
    const excess = totalDistributedNet - netAmountAfterFees;

    const largestAmountIndex = artistsWithMinimumAmount.reduce(
      (maxIndex, artist, index) =>
        parseFloat(artist.money_after_fees) > parseFloat(artistsWithMinimumAmount[maxIndex].money_after_fees)
          ? index
          : maxIndex,
      0
    );

    const largestArtist = artistsWithMinimumAmount[largestAmountIndex];
    const adjustedNetAmount = Math.max(
      MIN_AMOUNT_PER_ARTIST,
      parseFloat(largestArtist.money_after_fees) - excess
    );

    const grossToNetRatio = parseFloat(largestArtist.money) / parseFloat(largestArtist.money_after_fees);
    const adjustedGrossAmount = adjustedNetAmount * grossToNetRatio;

    artistsWithMinimumAmount[largestAmountIndex] = {
      ...largestArtist,
      money: adjustedGrossAmount.toFixed(2),
      money_after_fees: adjustedNetAmount.toFixed(2)
    };
  }

  const sortedIncludedArtists = artistsWithMinimumAmount.sort(
    (a, b) => parseFloat(b.money_after_fees) - parseFloat(a.money_after_fees)
  );

  return {
    includedArtists: sortedIncludedArtists,
    excludedArtists: []
  };
};

interface ClaimingUser {
  _id: string;
}

interface ClaimOffice {
  _id: string;
  stripe_connect_account_id: string;
  stripe_connect_account_status: string;
}

async function getSuccessfulClaimArtist() {
  const claims = await Claim.find({ status: 'Successful' })
    .populate<{ claiming_user_id: ClaimingUser }>('claiming_user_id')
    .populate<{ office_id: ClaimOffice }>('office_id');

  const result = claims.map((claim) => ({
    artist_id: claim.artist_id,
    claiming_user_id: claim.claiming_user_id?._id?.toString() || '',
    claim_id: claim._id.toString(),
    stripe_connect_account_id: claim.office_id?.stripe_connect_account_id,
    stripe_connect_account_status:
      claim.office_id?.stripe_connect_account_status
  }));

  return result;
}

export async function getPieArtists(
  pieId: string,
  limit?: number,
  popularity?: number,
  excludeNonActive?: boolean,
  totalAmount?: number
) {
  const successfulClaimedArtists = await getSuccessfulClaimArtist();
  const pie = await Pie.findOne({ _id: new mongoose.Types.ObjectId(pieId) });
  if (!pie) return { includedArtists: [], excludedArtists: [], allArtists: [] };

  const realtimeData = await calculateRealtimePieData(
    pie.user_id,
    pieId,
    limit,
    popularity,
    excludeNonActive
  );

  const convertToIncludedFormat = (artists: RealtimePieArtistData[]) =>
    artists.map((artist) => ({
      artist_external_url: artist.artist_external_url,
      artist_id: artist.artist_id,
      artist_image: artist.artist_image,
      artist_name: artist.artist_name,
      pie_artist_id: `${pieId}_${artist.artist_id}`,
      total_time_listened: artist.total_time_listened.toString(),
      total_tracks_listened: artist.total_tracks_listened,
      popularity: artist.popularity,
      manual_inclusion_status:
        artist.manual_inclusion_status as ManualInclusionStatus,
      is_banned: artist.is_banned
    }));

  const convertToExcludedFormat = (artists: RealtimePieArtistData[]) =>
    artists.map((artist) => ({
      artist_external_url: artist.artist_external_url,
      artist_id: artist.artist_id,
      artist_image: artist.artist_image,
      artist_name: artist.artist_name,
      pie_artist_id: `${pieId}_${artist.artist_id}`,
      total_time_listened: artist.total_time_listened.toString(),
      total_tracks_listened: artist.total_tracks_listened,
      popularity: artist.popularity,
      manual_inclusion_status: artist.manual_inclusion_status,
      is_banned: artist.is_banned,
      reasons: [] as string[]
    }));

  const allArtists = convertToIncludedFormat(realtimeData.allArtists);
  const baseIncludedArtists = convertToIncludedFormat(
    realtimeData.includedArtists
  );
  const baseExcludedArtists = convertToExcludedFormat(
    realtimeData.excludedArtists
  );

  const grossAmount = (totalAmount || pie.amount) / 100;

  const { includedArtists: processedArtists } = calculateArtistMoney(
    baseIncludedArtists,
    grossAmount,
    grossAmount,
    popularity || 0
  );

  const artistsWithClaims = processedArtists.map((artist) => {
    const claim = successfulClaimedArtists.find(
      (claim) => claim.artist_id === artist.artist_id
    );

    if (claim) {
      return {
        ...artist,
        is_claimed: true,
        claim_info: {
          claiming_user_id: claim.claiming_user_id,
          claim_id: claim.claim_id,
          stripe_connect_account_id: claim.stripe_connect_account_id
        }
      };
    }

    return artist;
  });

  return {
    includedArtists: artistsWithClaims,
    excludedArtists: baseExcludedArtists,
    allArtists
  };
}

export async function patchPie(pieId: string, updateData: Partial<PieDetails>) {
  const pie = await Pie.findById(pieId);
  if (!pie) {
    throw AppError.notFound('Pie not found');
  }

  const allowedFields = [
    'artistLimit',
    'artistPopularity',
    'excludeNonActive',
    'snapshot',
    'is_completed',
    'is_active'
  ];

  const filteredData = Object.keys(updateData).reduce((acc, key) => {
    if (allowedFields.includes(key)) {
      acc[key] = updateData[key];
    }
    return acc;
  }, {} as Partial<PieDetails>);

  const updatedPie = await Pie.findByIdAndUpdate(
    pieId,
    { $set: filteredData },
    { new: true }
  );

  return updatedPie;
}

export async function updatePieArtist(
  pieArtistId: string,
  shouldInclude: boolean
) {
  const [pieId, artistId] = pieArtistId.split('_');

  if (!pieId || !artistId) {
    throw AppError.badRequest('Invalid Pie Artist ID format');
  }

  const inclusionStatus = shouldInclude ? 'INCLUDED' : 'EXCLUDED';

  const { updateManualArtistSetting } = await import(
    './pieRealtimeCalculationService'
  );
  await updateManualArtistSetting(pieId, artistId, inclusionStatus);

  return { pieId, artistId, inclusionStatus };
}

export async function banArtist(
  userId: string,
  artistId: string,
  isBanned: boolean
) {
  if (!userId || !artistId) {
    throw AppError.badRequest('User ID and Artist ID are required');
  }

  if (isBanned) {
    await UserListeningStatsService.banArtist(
      userId,
      artistId,
      'Banned via pie settings'
    );
  } else {
    await UserListeningStatsService.unbanArtist(userId, artistId);
  }

  return { user_id: userId, artist_id: artistId, isBanned };
}



async function processPieEnd(
  userId: string,
  pieId: string,
  customerId: string
) {
  const pieDetails = await getActivePieById(pieId, userId);
  if (!pieDetails) {
    throw AppError.notFound('Pie not found or not active');
  }

  const walletBalance = await getFanWalletBalance(userId);
  if (!walletBalance) {
    throw AppError.notFound('Fan wallet not found');
  }

  const grossAmount = pieDetails.amount / 100;

  logger.info('Processing pie end with pie amount', {
    pieId,
    grossAmount: grossAmount.toFixed(2),
    walletBalanceCents: walletBalance.balance
  });

  const artists = await getPieArtists(
    pieId,
    pieDetails.artistLimit,
    pieDetails.artistPopularity,
    pieDetails.excludeNonActive,
    grossAmount
  );

  logger.info('Processing pie end with artists', {
    pieId,
    totalIncludedArtists: artists.includedArtists.length,
    totalExcludedArtists: artists.excludedArtists.length,
    sampleArtists: artists.includedArtists.slice(0, 3).map(artist => ({
      artistId: artist.artist_id,
      artistName: artist.artist_name,
      grossAmount: artist.money,
      netAmount: artist.money_after_fees
    }))
  });

  const totalDistributionCents = walletBalance.balance;

  logger.info('Using entire fan wallet balance for pie distribution', {
    pieId,
    walletBalanceCents: walletBalance.balance,
    totalDistributionCents
  });

  const piePaymentResult = await createPiePaymentTransaction(
    userId,
    totalDistributionCents,
    pieId,
    {
      start_date: new Date(pieDetails.start_date),
      end_date: new Date(pieDetails.end_date),
      amount: totalDistributionCents / 100
    },
    `pie_end_${pieId}_${Date.now()}`,
    {
      wallet_balance_used: totalDistributionCents / 100,
      subscription_payment: 0
    }
  );


  const snapshot: PieSnapshot = {
    stats: {
      count_tracks: pieDetails.count_tracks,
      count_artists: pieDetails.count_artists,
      total_time_listened: pieDetails.total_time_listened_artists
    },
    included_artists: [],
    excluded_artists: artists.excludedArtists.map((artist) => ({
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      artist_external_url: artist.artist_external_url,
      artist_image: artist.artist_image,
      total_time_listened: artist.total_time_listened,
      total_tracks_listened: artist.total_tracks_listened,
      popularity: artist.popularity,
      reasons: artist.reasons || []
    }))
  };

  const artistPaymentResults = [];

  const totalTimeListened = artists.includedArtists.reduce(
    (sum, artist) => sum + parseInt(artist.total_time_listened),
    0
  );

  for (const artist of artists.includedArtists) {
    const artistTime = parseInt(artist.total_time_listened);
    const percentage = totalTimeListened > 0 ? (artistTime / totalTimeListened) * 100 : 0;
    const amountInCents = Math.round((percentage / 100) * totalDistributionCents);

    if (amountInCents <= 0) {
      logger.info('Skipping artist with zero or negative amount', {
        artistId: artist.artist_id,
        artistName: artist.artist_name,
        artistTime,
        totalTimeListened,
        percentage: percentage.toFixed(2),
        amountInCents
      });
      continue;
    }

    let paymentStatus: {
      status: PaymentStatus;
      transfer_id?: string;
      wallet_transaction_id?: string;
    };

    try {
      logger.info('Creating artist credit transaction', {
        pieId,
        artistId: artist.artist_id,
        artistName: artist.artist_name,
        artistAmountCents: amountInCents,
        totalDistributionCents: totalDistributionCents,
        fanWalletTransactionId: piePaymentResult._id.toString()
      });

      const walletTransaction = await createArtistCreditTransaction(
        {
          artist_id: artist.artist_id,
          artist_name: artist.artist_name,
          money_after_fees: (amountInCents / 100).toFixed(2),
          total_time_listened: artist.total_time_listened,
          total_tracks_listened: artist.total_tracks_listened,
          percentage: percentage.toFixed(2)
        },
        pieId,
        customerId,
        userId,
        pieDetails.stripe_charge_id,
        piePaymentResult._id.toString(),
        totalDistributionCents
      );

      paymentStatus = {
        status: 'wallet_transaction',
        transfer_id: undefined,
        wallet_transaction_id: walletTransaction._id.toString()
      };
    } catch (error) {
      logger.error('Failed to create wallet transaction for artist', {
        artistId: artist.artist_id,
        artistName: artist.artist_name,
        pieId,
        grossAmount: artist.money,
        netAmount: artist.money_after_fees,
        error:
          error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }

    artistPaymentResults.push({
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      artist_external_url: artist.artist_external_url,
      artist_image: artist.artist_image,
      total_time_listened: artist.total_time_listened,
      total_tracks_listened: artist.total_tracks_listened,
      popularity: artist.popularity,
      money: (amountInCents / 100).toFixed(2),
      money_after_fees: (amountInCents / 100).toFixed(2),
      percentage: percentage.toFixed(2),
      is_claimed: artist.is_claimed,
      claim_info: artist.claim_info,
      payment_status: paymentStatus
    });
  }

  snapshot.included_artists.push(...artistPaymentResults);

  const zeroAmountArtists = snapshot.included_artists.filter(
    artist => parseFloat(artist.money_after_fees || '0') <= 0
  );

  if (zeroAmountArtists.length > 0) {
    logger.warn('Found artists with zero amounts in final snapshot', {
      pieId,
      zeroAmountArtists: zeroAmountArtists.map(artist => ({
        artistId: artist.artist_id,
        artistName: artist.artist_name,
        grossAmount: artist.money,
        netAmount: artist.money_after_fees
      }))
    });
  }

  const updateData: Partial<PieDetails> = {
    snapshot,
    is_completed: true
  };

  if (!pieDetails.is_recurring) {
    updateData.is_active = false;
  }

  const updatedPie = await patchPie(pieId, updateData);

  logger.info('Pie marked as completed', {
    pieId,
    isCompleted: true,
    isRecurring: pieDetails.is_recurring,
    isActive: pieDetails.is_recurring,
    totalArtistsProcessed: artistPaymentResults.length,
    totalGrossAmountDistributed: artistPaymentResults.reduce((sum, artist) => sum + parseFloat(artist.money), 0).toFixed(2),
    totalNetAmountDistributed: artistPaymentResults.reduce((sum, artist) => sum + parseFloat(artist.money_after_fees), 0).toFixed(2)
  });



  return {
    pieDetails,
    artists,
    updatedPie
  };
}

export async function endPie(
  userId: string,
  pieId: string,
  customerId: string
) {
  logger.info('Starting endPie process', {
    userId,
    pieId,
    customerId
  });

  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  try {
    const { pieDetails, artists, updatedPie } = await processPieEnd(
      userId,
      pieId,
      customerId
    );

    logger.info('endPie process completed successfully', {
      pieId,
      isCompleted: updatedPie?.is_completed,
      isActive: updatedPie?.is_active,
      isRecurring: pieDetails?.is_recurring,
      totalArtistsProcessed: artists?.includedArtists?.length || 0
    });

    return {
      user,
      updatedPie,
      pieDetails,
      artists
    };
  } catch (error) {
    logger.error('endPie process failed', {
      pieId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function getPieRealtimeStats(
  userId: string,
  pieId: string,
  limit?: number,
  popularity?: number,
  excludeNonActive?: boolean
) {
  return calculateRealtimePieData(
    userId,
    pieId,
    limit,
    popularity,
    excludeNonActive
  );
}
