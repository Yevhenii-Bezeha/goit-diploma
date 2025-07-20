import controllerWrapper from '../../decorators/controllerWrapper';
import {
  getListenedSongs,
  trackListenedTotalCount
} from '../../services/userFan/tracksService';
import logger from '../../utils/logger';

const getLatestListenedTracks = async (req, res) => {
  try {
    const itemsPerPage = 20;
    const page = req.query.page || 1;
    const skip = (page - 1) * itemsPerPage;
    const query = { user_id: req.user._id };

    const songs = await getListenedSongs(query, skip, itemsPerPage);
    const totalCount = await trackListenedTotalCount(query);

    res.json({
      currentPage: page,
      totalCount,
      data: songs
    });
  } catch (error) {
    logger.error('Error in getLatestListenedTracks', {
      error: error.message,
      userId: req.user?._id
    });
    res.status(500).json({
      error: 'Failed to get latest listened tracks',
      message: error.message
    });
  }
};

export default {
  getLatestListenedTracks: controllerWrapper(getLatestListenedTracks)
};
