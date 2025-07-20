import { Response, Request } from 'express';
import { findUserArtistById } from '../../services/userArtist/userArtist';
import controllerWrapper from '../../decorators/controllerWrapper';
import Artist from '../../models/userFan/Artist';

interface AuthRequest extends Request {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

async function _getUserArtistById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.user;
    const userArtist = await findUserArtistById(id);
    res.status(200).json({ success: true, data: userArtist });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to fetch user artist'
    });
  }
}

async function _searchArtists(req: Request, res: Response) {
  try {
    const { search_term, page, limit } = req.query;
    if (!search_term) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const searchQuery = {
      name: { $regex: search_term as string, $options: 'i' },
      active: true,
      is_banned: { $ne: true }
    };

    const [artists, totalCount] = await Promise.all([
      Artist.find(searchQuery)
        .select('_id name image external_url popularity active social_networks')
        .sort({ popularity: -1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Artist.countDocuments(searchQuery)
    ]);

    const formattedArtists = artists.map((artist) => ({
      _id: artist._id,
      name: artist.name,
      image: artist.image,
      external_url: artist.external_url,
      popularity: artist.popularity || 0,
      active: artist.active,
      total_time_listened: 0,
      total_tracks_listened: 0,
      is_claimed: false,
      social_networks: artist.social_networks || []
    }));

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: formattedArtists,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to search artists'
    });
  }
}


export const searchArtists = controllerWrapper(_searchArtists);
export const getUserArtistById = controllerWrapper(_getUserArtistById);

export default {
  getUserArtistById,
  searchArtists
};
