import { Response } from 'express';
import mongoose from 'mongoose';
import Pie from '../../models/userFan/Pie';
import * as pieService from '../../services/userFan/pieService';
import AppError from '../../utils/AppError';
import logger from '../../utils/logger';
import controllerWrapper from '../../decorators/controllerWrapper';
import TrackListened from '../../models/userFan/TrackListened';
import { calculateArtistMoney } from '../../services/userFan/pieService';
import { getFanWalletBalance } from '../../services/userFan/fanWalletTransactionService';

export async function getActivePie(req, res: Response): Promise<Response> {
  const userId = req.user._id;

  try {
    const activePie = await Pie.findOne({
      user_id: userId,
      is_active: true,
      is_completed: false
    });

    if (!activePie) {
      return res.status(200).json({
        data: null,
        message: 'No active pie found'
      });
    }

    const trackStats = await TrackListened.aggregate([
      {
        $match: {
          user_id: userId,
          pie_id: activePie._id
        }
      },
      {
        $group: {
          _id: null,
          count_tracks: { $sum: 1 },
          total_time_listened: { $sum: '$duration' }
        }
      }
    ]);

    const artistStats = await TrackListened.aggregate([
      {
        $match: {
          user_id: userId,
          pie_id: activePie._id
        }
      },
      {
        $unwind: '$artists'
      },
      {
        $group: {
          _id: '$artists'
        }
      },
      {
        $group: {
          _id: null,
          count_artists: { $sum: 1 }
        }
      }
    ]);

    const stats = trackStats[0] || { count_tracks: 0, total_time_listened: 0 };
    const artistCount = artistStats[0]?.count_artists || 0;

    return res.status(200).json({
      data: {
        is_recurring: activePie.is_recurring,
        id: activePie._id,
        amount: activePie.amount,
        is_paid: activePie.is_paid,
        start_date: new Date(activePie.start_date).toISOString().split('T')[0],
        end_date: new Date(activePie.end_date).toISOString().split('T')[0],
        count_tracks: stats.count_tracks,
        count_artists: artistCount,
        total_time_listened_artists: stats.total_time_listened,
        artistLimit: activePie.artistLimit,
        artistPopularity: activePie.artistPopularity,
        excludeNonActive: activePie.excludeNonActive,
        is_active: activePie.is_active,
        stripe_charge_id: activePie.stripe_charge_id,
        is_completed: activePie.is_completed,
        is_trialing: activePie.is_trialing
      }
    });
  } catch (error) {
    logger.error('Error getting active pie', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new AppError('Failed to get active pie', 500);
  }
}

export async function getActivePieDetails(
  req,
  res: Response
): Promise<Response> {
  const user_id = req.user._id;
  const pieId = req.params.pieId;

  if (!pieId) {
    throw AppError.badRequest('Pie ID is required');
  }

  const activePieDetails = await pieService.getActivePieById(pieId, user_id);

  if (!activePieDetails) {
    return res.status(200).json({
      data: null,
      message: 'No active pie found'
    });
  }

  return res.status(200).json({
    data: activePieDetails
  });
}

export async function removePieArtistController(req, res: Response) {
  const pieArtistId = req.params.pieArtistId;
  const shouldInclude = req.body.value === true;

  if (!pieArtistId) {
    throw AppError.badRequest('Pie Artist ID is required');
  }

  const updatedPieArtist = await pieService.updatePieArtist(
    pieArtistId,
    shouldInclude
  );

  return res.status(200).json({
    data: updatedPieArtist
  });
}

export async function banArtistController(req, res: Response) {
  const userId = req.user._id;
  const artistId = req.params.artistId;
  const isBanned = req.body.value === true;

  if (!artistId) {
    throw AppError.badRequest('Artist ID is required');
  }

  const updatedUserArtist = await pieService.banArtist(
    userId,
    artistId,
    isBanned
  );

  return res.status(200).json({
    data: updatedUserArtist
  });
}


export async function addMissingTracksAnytime(req, res) {
  try {
    const userId = req.user._id;
    const activePie = await Pie.findOne({
      user_id: userId,
      is_active: true,
      is_paid: true,
      is_completed: false
    });
    if (!activePie) {
      return res.status(404).json({
        success: false,
        message: 'No active pie found for user'
      });
    }
    const updateResult = await TrackListened.updateMany(
      { user_id: userId, pie_id: { $exists: false } },
      { $set: { pie_id: activePie._id } }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully added ${updateResult.modifiedCount} tracks to pie`,
      updatedCount: updateResult.modifiedCount
    });
  } catch (err) {
    logger.error('Error in addMissingTracksAnytime', {
      error: err instanceof Error ? err.message : 'Unknown error',
      userId: req.user?._id
    });
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export async function getPieRealtimeStats(req, res: Response) {
  const pieId = req.params.pieId;
  const limit = parseInt(req.query.limit as string) || 0;
  const popularity = parseInt(req.query.artistPopularity as string) || 0;
  const excludeNonActive = req.query.excludeNonActive === 'true';

  if (!pieId) {
    throw AppError.badRequest('Pie ID is required');
  }

  const pie = await Pie.findById(pieId);
  if (!pie) {
    throw AppError.notFound('Pie not found');
  }

  const stats = await pieService.getPieRealtimeStats(
    req.user._id,
    pieId,
    limit,
    popularity,
    excludeNonActive
  );

  const walletBalance = await getFanWalletBalance(req.user._id);
  const grossAmount = pie.amount / 100;
  const netAmountAfterFees = walletBalance.balance / 100;

  const artistsForMoneyCalc = stats.includedArtists.map((artist) => ({
    artist_external_url: artist.artist_external_url,
    artist_id: artist.artist_id,
    artist_image: artist.artist_image,
    artist_name: artist.artist_name,
    pie_artist_id: `${pieId}_${artist.artist_id}`,
    total_time_listened: artist.total_time_listened.toString(),
    total_tracks_listened: artist.total_tracks_listened,
    popularity: artist.popularity,
    manual_inclusion_status: artist.manual_inclusion_status,
    is_banned: artist.is_banned
  }));

  const { includedArtists: artistsWithMoney } = calculateArtistMoney(
    artistsForMoneyCalc,
    grossAmount,
    netAmountAfterFees,
    popularity
  );

  const includedArtistsWithMoney = stats.includedArtists.map((artist) => {
    const moneyData = artistsWithMoney.find(
      (a) => a.artist_id === artist.artist_id
    );
    return {
      ...artist,
      pie_artist_id: `${pieId}_${artist.artist_id}`,
      money: moneyData?.money,
      money_after_fees: moneyData?.money_after_fees,
      percentage: moneyData?.percentage,
      weight: moneyData?.weight ? parseFloat(moneyData.weight) : 1
    };
  });

  const excludedArtistsWithId = stats.excludedArtists.map((artist) => ({
    ...artist,
    pie_artist_id: `${pieId}_${artist.artist_id}`
  }));

  return res.status(200).json({
    data: {
      ...stats,
      includedArtists: includedArtistsWithMoney,
      excludedArtists: excludedArtistsWithId
    }
  });
}

export default {
  getActivePie: controllerWrapper(getActivePie),
  getActivePieDetails: controllerWrapper(getActivePieDetails),
  removePieArtist: controllerWrapper(removePieArtistController),
  banArtist: controllerWrapper(banArtistController),
  addMissingTracksAnytime: controllerWrapper(addMissingTracksAnytime),
  getPieRealtimeStats: controllerWrapper(getPieRealtimeStats)
};
