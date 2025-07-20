import TrackListened from '../../models/userFan/TrackListened';
import BannedArtist from '../../models/userFan/BannedArtist';

import { getUserTotalWalletContributions } from '../userArtist/artistWalletTransactionService';

export interface UserArtistStats {
  artist_id: string;
  total_time_listened: number;
  total_tracks_listened: number;
  is_banned: boolean;
}

export interface UserArtistData {
  _id: string;
  name: string;
  external_url: string;
  image: string;
  total_time_listened: string;
  total_money: number;
  last_listened: Date;
}

export class UserListeningStatsService {

  static async getUserTopArtists(
    userId: string,
    limit: number = 200
  ): Promise<UserArtistStats[]> {
    const [artistStats, bannedArtists] = await Promise.all([
      TrackListened.aggregate([
        { $match: { user_id: userId } },
        { $unwind: '$artists' },
        {
          $group: {
            _id: '$artists',
            total_time_listened: { $sum: '$duration' },
            total_tracks_listened: { $sum: 1 }
          }
        },
        { $sort: { total_time_listened: -1 } },
        { $limit: limit }
      ]),

      BannedArtist.find({ user_id: userId }).select('artist_id')
    ]);

    const bannedArtistIds = new Set(bannedArtists.map((ba) => ba.artist_id));

    return artistStats.map((stat) => ({
      artist_id: stat._id,
      total_time_listened: stat.total_time_listened,
      total_tracks_listened: stat.total_tracks_listened,
      is_banned: bannedArtistIds.has(stat._id)
    }));
  }

  static async getUserArtistListeningStats(
    userId: string,
    artistId: string
  ): Promise<UserArtistStats | null> {
    const [artistStats, bannedArtist] = await Promise.all([
      TrackListened.aggregate([
        { $match: { user_id: userId, artists: artistId } },
        {
          $group: {
            _id: null,
            total_time_listened: { $sum: '$duration' },
            total_tracks_listened: { $sum: 1 }
          }
        }
      ]),

      BannedArtist.findOne({ user_id: userId, artist_id: artistId })
    ]);

    const stats = artistStats[0];
    if (!stats) return null;

    const result = {
      artist_id: artistId,
      total_time_listened: stats.total_time_listened,
      total_tracks_listened: stats.total_tracks_listened,
      is_banned: !!bannedArtist
    };

    return result;
  }

  static async banArtist(
    userId: string,
    artistId: string,
    reason?: string
  ): Promise<void> {
    await BannedArtist.findOneAndUpdate(
      { user_id: userId, artist_id: artistId },
      {
        user_id: userId,
        artist_id: artistId,
        reason,
        banned_at: new Date()
      },
      { upsert: true }
    );
  }

  static async unbanArtist(userId: string, artistId: string): Promise<void> {
    await BannedArtist.deleteOne({ user_id: userId, artist_id: artistId });
  }

  static async getBannedArtistIds(userId: string): Promise<string[]> {
    const banned = await BannedArtist.find({ user_id: userId }).select(
      'artist_id'
    );
    return banned.map((ba) => ba.artist_id);
  }
}

export default new UserListeningStatsService();
