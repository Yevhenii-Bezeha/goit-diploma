import AuthUserArtist from '../../models/userArtist/AuthUserArtist';
import AppError from '../../utils/AppError';

export const findUserArtistById = async (userArtistId) => {
  try {
    const userArtist = await AuthUserArtist.findById(userArtistId);
    return userArtist;
  } catch (error) {
    throw new AppError(`Unable to find user: ${error.message}`, 500, {
      context: { userArtistId },
      originalError: error instanceof Error ? error : undefined
    });
  }
};
