import TrackListened from '../../models/userFan/TrackListened';
import Artist from '../../models/userFan/Artist';
import Pie from '../../models/userFan/Pie';
import { UserListeningStatsService } from './UserListeningStatsService';
import logger from '../../utils/logger';
import { Types } from 'mongoose';

export interface RealtimePieArtistData {
  artist_id: string;
  artist_name: string;
  artist_external_url: string;
  artist_image: string;
  total_time_listened: number;
  total_tracks_listened: number;
  popularity: number;
  manual_inclusion_status: 'DEFAULT' | 'INCLUDED' | 'EXCLUDED';
  is_banned: boolean;
}

export interface RealtimePieCalculation {
  includedArtists: RealtimePieArtistData[];
  excludedArtists: RealtimePieArtistData[];
  allArtists: RealtimePieArtistData[];
  stats: {
    count_tracks: number;
    count_artists: number;
    total_time_listened: number;
  };
}

/**
 * Calculate pie data in real-time from TrackListened records
 */
export async function calculateRealtimePieData(
  userId: string,
  pieId: string,
  limit?: number,
  popularity?: number,
  excludeNonActive?: boolean
): Promise<RealtimePieCalculation> {
  const pie = await Pie.findById(pieId);
  if (!pie) {
    throw new Error('Pie not found');
  }

  logger.info('Starting real-time pie calculation', {
    userId,
    pieId,
    startDate: pie.start_date,
    endDate: pie.end_date
  });

  const rawTracks = await TrackListened.find({
    user_id: userId,
    pie_id: new Types.ObjectId(pieId)
  }).lean();

  logger.info('Raw tracks before aggregation', {
    trackCount: rawTracks.length,
    sampleTracks: rawTracks.slice(0, 3).map(track => ({
      spotify_id: track.spotify_id,
      name: track.name,
      artists: track.artists,
      artist_count: track.artist_count,
      duration: track.duration
    }))
  });

  const artistStats = await TrackListened.aggregate([
    {
      $match: {
        user_id: userId,
        pie_id: new Types.ObjectId(pieId)
      }
    },
    { $unwind: '$artists' },
    {
      $group: {
        _id: '$artists',
        total_time_listened: {
          $sum: { $divide: ['$duration', '$artist_count'] }
        },
        total_tracks_listened: { $sum: 1 }
      }
    },
    { $sort: { total_time_listened: -1 } }
  ]);

  logger.info('Artist stats from aggregation - DETAILED', {
    artistCount: artistStats.length,
    rawArtistStats: artistStats.slice(0, 3),
    aggregationStages: [
      { match: { user_id: userId, pie_id: new Types.ObjectId(pieId) } },
      { unwind: '$artists' },
      {
        group: {
          _id: '$artists',
          total_time_listened: { $sum: { $divide: ['$duration', '$artist_count'] } },
          total_tracks_listened: { $sum: 1 }
        }
      },
    ],
  });

  const artistIds = artistStats.map(stat => stat._id);
  const artists = await Artist.find({ _id: { $in: artistIds } });
  const artistMap = new Map(artists.map(artist => [artist._id.toString(), artist]));

  const bannedArtistIds = new Set(
    await UserListeningStatsService.getBannedArtistIds(userId)
  );

  const manualSettings = new Map<string, string>();
  (pie.manual_artist_settings || []).forEach(setting => {
    manualSettings.set(setting.artist_id, setting.inclusion_status);
  });

  const allArtists: RealtimePieArtistData[] = artistStats
    .map(stat => {
      const artist = artistMap.get(stat._id);
      if (!artist) {
        logger.info('Artist not found in database', {
          artistId: stat._id,
          stats: stat
        });
        return null;
      }

      const manualStatus = manualSettings.get(stat._id) || 'DEFAULT';

      return {
        artist_id: stat._id,
        artist_name: artist.name,
        artist_external_url: artist.external_url,
        artist_image: artist.image,
        total_time_listened: stat.total_time_listened,
        total_tracks_listened: stat.total_tracks_listened,
        popularity: artist.popularity,
        manual_inclusion_status: manualStatus,
        is_banned: bannedArtistIds.has(stat._id)
      };
    })
    .filter(Boolean) as RealtimePieArtistData[];

  const totalTimeListened = allArtists.reduce(
    (sum, artist) => sum + artist.total_time_listened,
    0
  );

  const stats = {
    count_tracks: artistStats.reduce((sum, stat) => sum + stat.total_tracks_listened, 0),
    count_artists: allArtists.length,
    total_time_listened: totalTimeListened
  };

  allArtists.sort((a, b) => b.total_time_listened - a.total_time_listened);

  const { includedArtists, excludedArtists } = filterArtistsBySettings(
    allArtists,
    limit,
    popularity,
    excludeNonActive
  );

  logger.info('Real-time pie calculation completed', {
    includedCount: includedArtists.length,
    excludedCount: excludedArtists.length,
    totalArtists: allArtists.length,
    stats,
    filteringDebug: {
      limit,
      popularity,
      excludeNonActive,
      allArtistsTimeSum: allArtists.reduce((sum, a) => sum + a.total_time_listened, 0),
      includedArtistsTimeSum: includedArtists.reduce((sum, a) => sum + a.total_time_listened, 0),
      excludedArtistsTimeSum: excludedArtists.reduce((sum, a) => sum + a.total_time_listened, 0)
    }
  });

  return {
    includedArtists,
    excludedArtists,
    allArtists,
    stats
  };
}


function filterArtistsBySettings(
  artists: RealtimePieArtistData[],
  limit?: number,
  popularity?: number,
  excludeNonActive?: boolean
): {
  includedArtists: RealtimePieArtistData[];
  excludedArtists: RealtimePieArtistData[];
} {
  const includedArtists: RealtimePieArtistData[] = [];
  const excludedArtists: RealtimePieArtistData[] = [];

  logger.info('Starting artist filtering', {
    totalArtists: artists.length,
    limit,
    popularity,
    excludeNonActive,
    artistTimes: artists
      .map((a) => ({ name: a.artist_name, time: a.total_time_listened }))
      .slice(0, 5)
  });

  for (const artist of artists) {
    if (artist.manual_inclusion_status === 'EXCLUDED') {
      excludedArtists.push(artist);
      continue;
    }

    if (artist.is_banned) {
      excludedArtists.push(artist);
      continue;
    }

    if (excludeNonActive && !artist.artist_name) {
      excludedArtists.push(artist);
      continue;
    }

    if (artist.manual_inclusion_status === 'INCLUDED') {
      includedArtists.push(artist);
      continue;
    }

    if (limit && includedArtists.length >= limit) {
      excludedArtists.push(artist);
      continue;
    }

    includedArtists.push(artist);
  }

  return { includedArtists, excludedArtists };
}


export async function updateManualArtistSetting(
  pieId: string,
  artistId: string,
  inclusionStatus: 'DEFAULT' | 'INCLUDED' | 'EXCLUDED'
): Promise<void> {
  await Pie.findByIdAndUpdate(pieId, {
    $pull: { manual_artist_settings: { artist_id: artistId } }
  });

  if (inclusionStatus !== 'DEFAULT') {
    await Pie.findByIdAndUpdate(pieId, {
      $push: {
        manual_artist_settings: {
          artist_id: artistId,
          inclusion_status: inclusionStatus
        }
      }
    });
  }

  logger.info('Updated manual artist setting', {
    pieId,
    artistId,
    inclusionStatus
  });
}
