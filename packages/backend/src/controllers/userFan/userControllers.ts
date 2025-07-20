import controllerWrapper from '../../decorators/controllerWrapper';
import AppError from '../../utils/AppError';
import { getSpotifyAccessToken } from '../../services/userFan/usersServices';

const getUserInfo = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const userWithSpotifyToken = {
    ...user,
    access_token: getSpotifyAccessToken(user)
  };

  res.json({ data: userWithSpotifyToken });
};

export default {
  getUserInfo: controllerWrapper(getUserInfo)
};
