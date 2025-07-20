import jwt from 'jsonwebtoken';
const { MY_PIE_JWT_TOKEN_SECRET } = process.env;
import HttpError from '../helpers/HttpError';
import { findUserArtistById } from '../services/userArtist/userArtist';
import logger from '../utils/logger';

const isUserArtistAuthenticated = async (req, res, next) => {
  const token = req.cookies['mypie_access_token_artist'];

  if (!token) return next(new HttpError(401, 'Not authorized'));

  try {
    const decoded = jwt.verify(token, MY_PIE_JWT_TOKEN_SECRET);

    if (typeof decoded !== 'object' || !('user_id' in decoded)) {
      return next(new HttpError(401, 'Not authorized'));
    }
    const { user_id } = decoded as jwt.JwtPayload;

    const user = await findUserArtistById(user_id);

    if (!user) return next(new HttpError(401, 'Not authorized'));

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired, please login again.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token, please login again.' });
    } else {
      logger.error('Artist authentication error', {
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res
        .status(500)
        .json({ error: 'An error occurred. Please try after some time.' });
    }
  }
};

export default isUserArtistAuthenticated;
