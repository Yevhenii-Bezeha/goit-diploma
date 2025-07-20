import jwt from 'jsonwebtoken';
import { findUserById } from '../services/userFan/usersServices';
const { MY_PIE_JWT_TOKEN_SECRET } = process.env;
import HttpError from '../helpers/HttpError';
import logger from '../utils/logger';

const isAuthenticated = async (req, res, next) => {
  const token = req.cookies['mypie_access_token_fan'];

  if (!token) {
    logger.warn('No authentication token found in cookies', {
      path: req.path,
      method: req.method,
      cookies: Object.keys(req.cookies || {}),
      userAgent: req.headers['user-agent']
    });
    return next(new HttpError(401, 'Not authorized'));
  }

  try {
    const decoded = jwt.verify(token, MY_PIE_JWT_TOKEN_SECRET);

    if (typeof decoded !== 'object' || !('user_id' in decoded)) {
      logger.warn('Invalid token structure', {
        path: req.path,
        method: req.method,
        decodedType: typeof decoded
      });
      return next(new HttpError(401, 'Not authorized'));
    }
    const { user_id } = decoded as jwt.JwtPayload;

    const user = await findUserById(user_id);

    if (!user) {
      logger.warn('User not found for valid token', {
        path: req.path,
        method: req.method,
        userId: user_id
      });
      return next(new HttpError(401, 'Not authorized'));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error details', {
      path: req.path,
      method: req.method,
      tokenPresent: !!token,
      tokenLength: token ? token.length : 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error.constructor.name
    });

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired, please login again.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token, please login again.' });
    } else {
      logger.error('Authentication error', {
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

export default isAuthenticated;
