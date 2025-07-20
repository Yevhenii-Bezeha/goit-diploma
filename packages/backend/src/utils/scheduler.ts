import cron from 'node-cron';
import User, { IUser } from '../models/userFan/User';
import Pie from '../models/userFan/Pie';
import { processUserListenedSongs } from '../services/userFan/spotifyService';
import { refreshAccessToken } from '../services/userFan/authService';
import logger from '../utils/logger';
import { getSpotifyRefreshToken } from '../services/userFan/usersServices';


const fetchListenedSongs = async (user?: IUser, pieId?: string) => {
  if (user) {
    const refreshToken = getSpotifyRefreshToken(user);
    if (refreshToken) {
      const newAccessToken = await refreshAccessToken(user);
      if (newAccessToken) {
        await processUserListenedSongs(user, pieId);
      } else {
        logger.error(`Failed to refresh token for user ${user._id}`);
      }
      return;
    }
  }

  const activePies = await Pie.find({
    is_active: true,
    is_paid: true,
    end_date: { $gt: new Date() }
  });

  const userIds = activePies.map((pie) => pie.user_id);

  const users = await User.find({
    _id: { $in: userIds },
    'linked_accounts.provider': 'spotify',
    'linked_accounts.refresh_token': { $exists: true, $ne: null }
  });

  logger.info(
    'Starting scheduled fetch of listened songs for users with active pies',
    {
      userCount: users.length,
      activePieCount: activePies.length
    }
  );

  for (const user of users) {
    try {
      const activePie = activePies.find(
        (pie) => pie.user_id === user._id.toString()
      );

      if (!activePie) {
        logger.warn(
          `No active pie found for user ${user._id} - skipping scheduled fetch`
        );
        continue;
      }

      const newAccessToken = await refreshAccessToken(user);
      if (newAccessToken) {
        await processUserListenedSongs(user, activePie._id);
      } else {
        logger.error(`Failed to refresh token for user ${user._id}`);
        continue;
      }
    } catch (error) {
      logger.error(`Error processing user ${user._id} in scheduled fetch`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      continue;
    }
  }

  logger.info('Completed scheduled fetch of listened songs', {
    userCount: users.length
  });
};



cron.schedule('0 */3 * * *', fetchListenedSongs);








export {
  fetchListenedSongs,
};

export default fetchListenedSongs;
