import TrackListened from '../../models/userFan/TrackListened';
import Artist from '../../models/userFan/Artist';
import AppError from '../../utils/AppError';
import logger from '../../utils/logger';

export const getListenedSongs = async (query, skip, itemsPerPage) => {
  try {
    const tracks = await TrackListened.find({
      ...query,
      played_at: { $exists: true, $ne: null }
    })
      .sort({ played_at: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    const artistIds = [...new Set(tracks.flatMap((track) => track.artists))];

    const artists = await Artist.find({ _id: { $in: artistIds } })
      .select('_id name image external_url')
      .lean();

    const artistMap = new Map(artists.map((artist) => [artist._id, artist]));

    const tracksWithArtists = tracks.map((track) => ({
      ...track,
      artists: track.artists.map(
        (artistId) =>
          artistMap.get(artistId) || { _id: artistId, name: 'Unknown Artist' }
      )
    }));

    logger.info('Successfully fetched tracks', {
      query,
      resultCount: tracks.length
    });

    return tracksWithArtists;
  } catch (error) {
    logger.error('Failed to fetch tracks', {
      error: error.message,
      query
    });
    throw new AppError('Failed to fetch tracks', 500);
  }
};

export const trackListenedTotalCount = async (query) => {
  return await TrackListened.countDocuments(query);
};
