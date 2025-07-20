import axios from 'axios';
import { Types } from 'mongoose';
import User, { IUser } from '../../models/userFan/User';
import TrackListened from '../../models/userFan/TrackListened';
import Artist from '../../models/userFan/Artist';
import logger from '../../utils/logger';
import { refreshAccessToken } from './authService';
import AppError from '../../utils/AppError';
import {
  SpotifyArtist,
  SpotifyRecentlyPlayedResponse,
  SpotifyPlayHistoryItem
} from '../../types/spotify.types';
import { getSpotifyAccessToken, getSpotifyRefreshToken } from './usersServices';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const BATCH_SIZE = 40;


export class SpotifyService {

  static async processUserListenedSongs(
    user: IUser,
    pieId?: string
  ): Promise<void> {
    const startTime = Date.now();
    let tracksProcessed = 0;
    let artistsProcessed = 0;

    try {
      const accessToken = getSpotifyAccessToken(user);
      if (!accessToken) {
        throw new AppError('No Spotify access token found for user', 400, {
          context: { userId: user._id }
        });
      }

      const recentlyPlayed = await this.fetchRecentlyPlayed(
        accessToken,
        user.last_successful_fetch_date,
        user
      );

      const validTracks = this.filterValidTracks(
        recentlyPlayed.items,
        user.last_successful_fetch_date
      );
      const mostRecentPlayedAt = this.getMostRecentPlayedAt(validTracks);

      if (validTracks.length === 0) {
        await this.updateLastFetchDate(user._id, mostRecentPlayedAt);
        logger.info('No new tracks to process', { userId: user._id });
        return;
      }

      tracksProcessed = await this.storeTracksInBatch(
        validTracks,
        user._id.toString(),
        pieId ? new Types.ObjectId(pieId) : undefined
      );

      if (tracksProcessed > 0) {
      }

      try {
        await this.processArtistOperations(validTracks);
        artistsProcessed = validTracks.length;
        logger.info('Artist operations completed successfully', {
          userId: user._id,
          estimatedArtists: artistsProcessed,
          totalTracks: validTracks.length
        });
      } catch (error) {
        logger.warn('Artist operations had some errors - continuing', {
          userId: user._id,
          error: error instanceof Error ? error.message : 'Unknown error',
          totalTracks: validTracks.length
        });
      }

      try {
        await this.updateNewArtistImages(validTracks, accessToken);
        logger.info('Artist image updates completed successfully', {
          userId: user._id,
          totalTracks: validTracks.length
        });
      } catch (error) {
        logger.warn('Artist image updates failed - continuing', {
          userId: user._id,
          error: error instanceof Error ? error.message : 'Unknown error',
          totalTracks: validTracks.length
        });
      }

      await this.updateLastFetchDate(user._id, mostRecentPlayedAt);

      logger.info('Spotify processing completed successfully', {
        userId: user._id,
        tracksProcessed,
        totalTracks: validTracks.length,
        duration: Date.now() - startTime
      });
    } catch (error) {
      const errorContext = {
        userId: user._id,
        duration: Date.now() - startTime,
        tracksProcessed,
        artistsProcessed,
        errorType: this.categorizeError(error)
      };

      logger.error('Spotify processing failed', {
        ...errorContext,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private static categorizeError(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) return 'AUTH_ERROR';
      if (axiosError.response?.status === 429) return 'RATE_LIMIT';
      if (axiosError.response?.status && axiosError.response.status >= 500)
        return 'SPOTIFY_SERVER_ERROR';
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const networkError = error as { code?: string };
      if (networkError.code === 'ECONNABORTED') return 'TIMEOUT_ERROR';
      if (
        networkError.code === 'ENOTFOUND' ||
        networkError.code === 'ECONNREFUSED'
      )
        return 'NETWORK_ERROR';
    }

    if (error && typeof error === 'object' && 'name' in error) {
      const dbError = error as { name?: string };
      if (dbError.name === 'MongoError' || dbError.name === 'MongoServerError')
        return 'DATABASE_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  static async fetchRecentlyPlayed(
    accessToken: string,
    after?: number,
    user?: IUser
  ): Promise<SpotifyRecentlyPlayedResponse> {
    try {
      const afterInSeconds = after ? Math.floor(after / 1000) : undefined;
      const url = `${SPOTIFY_API_URL}/me/player/recently-played?limit=50${afterInSeconds ? `&after=${afterInSeconds}` : ''
        }`;

      const response = await axios.get<SpotifyRecentlyPlayedResponse>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      const axiosError = error;

      const refreshToken = getSpotifyRefreshToken(user);
      if (axiosError.response?.status === 401 && refreshToken) {
        logger.info('Attempting token refresh for recently played tracks', {
          userId: user._id
        });
        const newAccessToken = await refreshAccessToken(user);
        if (newAccessToken) {
          return this.fetchRecentlyPlayed(newAccessToken, after);
        }
      }

      throw new AppError('Error fetching recently played tracks', 500, {
        context: {
          status: axiosError.response?.status,
          error: axiosError.message,
          userId: user?._id,
          isTimeout: axiosError.code === 'ECONNABORTED'
        }
      });
    }
  }

  static async fetchArtistsInfo(
    artistIds: string[],
    accessToken: string,
    retries: number = 3
  ): Promise<SpotifyArtist[]> {
    const attemptFetch = async (attempt: number): Promise<SpotifyArtist[]> => {
      try {
        const chunks = this.chunkArray(artistIds, BATCH_SIZE);
        const promises = chunks.map((chunk) => {
          const ids = chunk.join(',');
          return axios.get<{ artists: SpotifyArtist[] }>(
            `${SPOTIFY_API_URL}/artists?ids=${ids}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              timeout: 10000
            }
          );
        });

        const responses = await Promise.all(promises);
        const artists = responses.flatMap((response) => response.data.artists);

        logger.info('Successfully fetched artist info from Spotify', {
          requestedCount: artistIds.length,
          returnedCount: artists.length,
          attempt
        });

        return artists;
      } catch (error) {
        const axiosError = error;
        const isRetryableError =
          !axiosError.response ||
          axiosError.response.status >= 500 ||
          axiosError.response.status === 429;

        if (attempt < retries && isRetryableError) {
          const delay = Math.pow(2, attempt) * 1000;
          logger.warn(`Spotify API call failed, retrying in ${delay}ms`, {
            attempt,
            artistCount: artistIds.length,
            status: axiosError.response?.status,
            error: axiosError.message
          });

          await new Promise((resolve) => setTimeout(resolve, delay));
          return attemptFetch(attempt + 1);
        }

        logger.error(
          'Failed to fetch artist info from Spotify after all retries',
          {
            artistCount: artistIds.length,
            artistIds: artistIds,
            status: axiosError.response?.status,
            error: axiosError.message,
            totalAttempts: attempt
          }
        );

        throw new AppError('Error fetching artists info', 500, {
          context: {
            artistCount: artistIds.length,
            status: axiosError.response?.status,
            error: axiosError.message,
            totalAttempts: attempt
          }
        });
      }
    };

    return attemptFetch(1);
  }

  static async searchSpotifyArtists(
    query: string,
    accessToken: string
  ): Promise<SpotifyArtist[]> {
    try {
      const response = await axios.get(
        `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      return response.data.artists.items;
    } catch (error) {
      const axiosError = error;
      throw new AppError('Error searching Spotify artists', 500, {
        context: {
          query,
          status: axiosError.response?.status,
          error: axiosError.message
        }
      });
    }
  }

  static async fetchArtistTopTracks(
    artistId: string,
    accessToken: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      duration_ms: number;
      album: {
        id: string;
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
      };
      artists: Array<{ id: string; name: string }>;
      preview_url?: string;
      popularity: number;
    }>
  > {
    try {
      const url = `${SPOTIFY_API_URL}/artists/${artistId}/top-tracks`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data.tracks;
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 404 || error.response.status === 400)
      ) {
        return [];
      }
      const axiosError = error;
      throw new AppError(
        `Error fetching artist top tracks for ${artistId}`,
        500,
        {
          context: {
            artistId,
            status: axiosError.response?.status,
            error: axiosError.message
          }
        }
      );
    }
  }


  static async storeTracksInBatch(
    tracks: SpotifyPlayHistoryItem[],
    userId: string,
    pieId?: Types.ObjectId
  ): Promise<number> {
    if (tracks.length === 0) return 0;

    const bulkOps = tracks.map((item) => ({
      updateOne: {
        filter: {
          user_id: userId,
          spotify_id: item.track.id,
          played_at: new Date(item.played_at)
        },
        update: {
          $setOnInsert: {
            _id: new Types.ObjectId(),
            spotify_id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map((artist) => artist.id),
            duration: item.track.duration_ms,
            played_at: new Date(item.played_at),
            user_id: userId,
            popularity: item.track.popularity || 0,
            image: item.track.album.images[0]?.url || '',
            album_id: item.track.album.id,
            album_name: item.track.album.name,
            external_url: item.track.external_urls.spotify,
            artist_count: item.track.artists.length,
            ...(pieId && { pie_id: pieId })
          }
        },
        upsert: true
      }
    }));

    try {
      const result = await TrackListened.bulkWrite(bulkOps, { ordered: true });
      const insertedCount = result.upsertedCount || 0;

      logger.info('Tracks processed successfully', {
        userId,
        totalTracks: tracks.length,
        newTracks: insertedCount,
        existingTracks: tracks.length - insertedCount
      });

      return insertedCount;
    } catch (error) {
      logger.error('Error processing tracks', {
        userId,
        trackCount: tracks.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }


  static async processArtistOperations(
    tracks: SpotifyPlayHistoryItem[]
  ): Promise<void> {
    if (tracks.length === 0) return;

    const artistOperations = [];
    const processedArtists = new Set<string>();

    tracks.forEach((item) => {
      const timePerArtist = item.track.duration_ms / item.track.artists.length;

      item.track.artists.forEach((artist) => {
        if (!processedArtists.has(artist.id)) {
          processedArtists.add(artist.id);

          artistOperations.push({
            updateOne: {
              filter: { _id: artist.id },
              update: {
                $setOnInsert: {
                  _id: artist.id,
                  name: artist.name,
                  external_url: artist.external_urls.spotify,
                  active: true
                }
              },
              upsert: true
            }
          });
        }
      });
    });

    if (artistOperations.length === 0) return;

    try {
      await Artist.bulkWrite(artistOperations, { ordered: false });
    } catch (error) {
      logger.warn('Artist operations had some errors - continuing', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operationCount: artistOperations.length
      });
    }
  }


  static async updateNewArtistImages(
    tracks: SpotifyPlayHistoryItem[],
    accessToken: string
  ): Promise<void> {
    const uniqueArtistIds = [
      ...new Set(
        tracks.flatMap((item) => item.track.artists.map((artist) => artist.id))
      )
    ];

    if (uniqueArtistIds.length === 0) return;

    const existingArtists = await Artist.find(
      {
        _id: { $in: uniqueArtistIds },
        $and: [
          { image: { $exists: true } },
          { image: { $ne: null } },
          { image: { $ne: '' } }
        ]
      },
      { _id: 1, image: 1 }
    ).lean();

    const existingArtistIds = new Set(
      existingArtists.map((artist) => artist._id)
    );
    const newArtistIds = uniqueArtistIds.filter(
      (id) => !existingArtistIds.has(id)
    );

    if (newArtistIds.length === 0) {
      logger.info('All artists already have images', {
        totalArtists: uniqueArtistIds.length
      });
      return;
    }

    const CHUNK_SIZE = 20;
    const chunks = this.chunkArray(newArtistIds, CHUNK_SIZE);
    let successfulUpdates = 0;
    let failedChunks = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const artistsInfo = await this.fetchArtistsInfo(chunk, accessToken);

        if (artistsInfo.length > 0) {
          await this.updateNewArtistData(artistsInfo);
          successfulUpdates += artistsInfo.length;
          logger.info(
            `Successfully processed artist chunk ${i + 1}/${chunks.length}`,
            {
              chunkSize: chunk.length,
              artistsUpdated: artistsInfo.length,
              totalSuccess: successfulUpdates
            }
          );
        }
      } catch (error) {
        failedChunks++;
        logger.warn(
          `Failed to process artist chunk ${i + 1}/${chunks.length} - continuing`,
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            chunkSize: chunk.length,
            artistIds: chunk,
            failedChunks
          }
        );
      }
    }

    logger.info('Artist image updates completed', {
      requestedCount: newArtistIds.length,
      successfulUpdates,
      failedChunks,
      successRate: Math.round((successfulUpdates / newArtistIds.length) * 100)
    });
  }

  static async updateNewArtistData(artists: SpotifyArtist[]): Promise<void> {
    if (artists.length === 0) return;

    const imageOperations = artists.map((artist) => ({
      updateOne: {
        filter: { _id: artist.id },
        update: {
          $set: {
            image: artist.images?.[0]?.url || null,
            popularity: artist.popularity || 0
          },
          $setOnInsert: {
            _id: artist.id,
            name: artist.name,
            external_url: artist.external_urls?.spotify || '',
            active: true
          }
        },
        upsert: true
      }
    }));

    try {
      const result = await Artist.bulkWrite(imageOperations, {
        ordered: false
      });
      logger.info('Successfully updated artist images and popularity', {
        artistCount: artists.length,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      logger.error('Failed to update artist data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        artistCount: artists.length
      });
      throw error;
    }

  }

  private static filterValidTracks(
    tracks: SpotifyPlayHistoryItem[],
    lastFetchDate?: number
  ): SpotifyPlayHistoryItem[] {
    if (!lastFetchDate) return tracks;

    const lastFetch = new Date(lastFetchDate);
    return tracks.filter((item) => new Date(item.played_at) > lastFetch);
  }

  private static getMostRecentPlayedAt(
    tracks: SpotifyPlayHistoryItem[]
  ): number {
    return tracks.length > 0
      ? Math.max(...tracks.map((item) => new Date(item.played_at).getTime()))
      : Date.now();
  }

  private static async updateLastFetchDate(
    userId: string,
    timestamp: number
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      last_successful_fetch_date: timestamp
    });
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  }
}

export const processUserListenedSongs =
  SpotifyService.processUserListenedSongs.bind(SpotifyService);
export const fetchRecentlyPlayed =
  SpotifyService.fetchRecentlyPlayed.bind(SpotifyService);
export const fetchArtistsInfo =
  SpotifyService.fetchArtistsInfo.bind(SpotifyService);
export const updateNewArtistData =
  SpotifyService.updateNewArtistData.bind(SpotifyService);
export const searchSpotifyArtists =
  SpotifyService.searchSpotifyArtists.bind(SpotifyService);
export const fetchArtistTopTracks =
  SpotifyService.fetchArtistTopTracks.bind(SpotifyService);

export default SpotifyService;
