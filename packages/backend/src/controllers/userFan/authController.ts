import {
  SpotifyUser,
  SpotifyTokens,
  findOrCreateUser,
  fetchSpotifyUserData
} from '../../services/userFan/usersServices';
import { SpotifyService } from '../../services/userFan/spotifyService';
import controllerWrapper from '../../decorators/controllerWrapper';
import {
  generateRandomString,
  getAuthUrl,
  getAuthToken,
  getSpotifyAndroidIntentUrl
} from '../../services/userFan/authService';

const { MY_PIE_JWT_TOKEN_SECRET } = process.env;
import jwt from 'jsonwebtoken';
import User from '../../models/userFan/User';
import { Request, Response } from 'express';
import logger from '../../utils/logger';
import AppError from '../../utils/AppError';

const stateKey = 'spotify_auth_state';

const loginSpotify = (req: Request, res: Response): void => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000
  });
  const scope = 'user-read-email user-read-recently-played';

  const userAgent = req.headers['user-agent'] || '';
  const isAndroid = /Android/i.test(userAgent);

  logger.info('Spotify login requested', {
    userAgent,
    isAndroid,
    operation: 'spotifyLogin'
  });

  if (isAndroid) {
    const intentUrl = getSpotifyAndroidIntentUrl(scope, state);
    logger.info('Redirecting to Android intent URL', {
      operation: 'spotifyLogin',
      platform: 'android'
    });
    res.redirect(intentUrl);
  } else {
    const webUrl = getAuthUrl(scope, state);
    logger.info('Redirecting to web URL', {
      operation: 'spotifyLogin',
      platform: 'web'
    });
    res.redirect(webUrl);
  }
};

const connectSpotify = (req: AuthenticatedRequest, res: Response): void => {
  const state = generateRandomString(16);
  const stateWithUserId = `${state}:${req.user._id}`;

  res.cookie(stateKey, stateWithUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000
  });
  const scope = 'user-read-email user-read-recently-played';

  const userAgent = req.headers['user-agent'] || '';
  const isAndroid = /Android/i.test(userAgent);

  logger.info('Spotify connect requested for existing user', {
    userId: req.user._id,
    userAgent,
    isAndroid,
    operation: 'spotifyConnect'
  });

  if (isAndroid) {
    const intentUrl = getSpotifyAndroidIntentUrl(scope, stateWithUserId);
    logger.info('Redirecting to Android intent URL for connect', {
      operation: 'spotifyConnect',
      platform: 'android'
    });
    res.redirect(intentUrl);
  } else {
    const webUrl = getAuthUrl(scope, stateWithUserId);
    logger.info('Redirecting to web URL for connect', {
      operation: 'spotifyConnect',
      platform: 'web'
    });
    res.redirect(webUrl);
  }
};

const callback = async (req: Request, res: Response) => {
  const { code, state, error: spotifyError } = req.query;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (spotifyError) {
    logger.warn('Spotify OAuth error received', {
      error: spotifyError,
      errorDescription: req.query.error_description,
      state: state as string,
      operation: 'spotifyCallback'
    });

    const errorRedirectUrl =
      process.env.NODE_ENV === 'production'
        ? `https://mypie.app/error?type=spotify_oauth_error&error=${encodeURIComponent(spotifyError as string)}`
        : `http://localhost:5173/error?type=spotify_oauth_error&error=${encodeURIComponent(spotifyError as string)}`;

    return res.redirect(errorRedirectUrl);
  }

  if (!code) {
    logger.warn('Spotify auth callback missing authorization code', {
      hasState: !!state,
      storedState,
      operation: 'spotifyCallback'
    });

    const errorRedirectUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://mypie.app/error?type=missing_code'
        : 'http://localhost:5173/error?type=missing_code';

    return res.redirect(errorRedirectUrl);
  }

  let isConnectFlow = false;
  let existingUserId = null;

  const decodedState = state ? decodeURIComponent(state as string) : null;

  logger.info('State parameter analysis', {
    providedState: state,
    decodedState,
    storedState,
    hasStoredState: !!storedState,
    storedStateIncludesColon: storedState?.includes(':'),
    operation: 'spotifyCallback'
  });

  if (storedState && storedState.includes(':')) {
    const [statePart, userId] = storedState.split(':');
    logger.info('Parsed connect flow state', {
      statePart,
      userId,
      stateMatches: decodedState === storedState,
      operation: 'spotifyCallback'
    });

    if (decodedState === storedState && userId) {
      isConnectFlow = true;
      existingUserId = userId;
      logger.info('Detected Spotify connect flow', {
        existingUserId,
        operation: 'spotifyCallback'
      });
    } else {
      logger.warn('Connect flow state mismatch', {
        providedState: state,
        decodedState,
        storedState,
        statePart,
        userId,
        operation: 'spotifyCallback'
      });
    }
  } else {
    if (decodedState === null || decodedState !== storedState) {
      logger.warn('Spotify auth state mismatch', {
        providedState: state,
        decodedState,
        storedState,
        hasStoredState: !!storedState,
        operation: 'spotifyCallback'
      });

      const errorRedirectUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/error?type=state_mismatch'
          : 'http://localhost:5173/error?type=state_mismatch';

      return res.redirect(errorRedirectUrl);
    }
  }

  res.clearCookie(stateKey);

  try {
    logger.info('Starting Spotify token exchange', {
      codeLength: (code as string).length,
      operation: 'spotifyCallback'
    });

    const authData: SpotifyTokens = await getAuthToken(code as string);

    if (!authData || !authData.access_token) {
      logger.error('Spotify auth failed - no access token received', {
        code: code as string,
        hasAuthData: !!authData,
        operation: 'spotifyCallback'
      });

      const errorRedirectUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/error?type=invalid_token'
          : 'http://localhost:5173/error?type=invalid_token';

      return res.redirect(errorRedirectUrl);
    }

    logger.info('Successfully exchanged authorization code for tokens', {
      hasAccessToken: !!authData.access_token,
      hasRefreshToken: !!authData.refresh_token,
      expiresIn: authData.expires_in,
      operation: 'spotifyCallback'
    });

    let spotifyUserData: SpotifyUser;
    try {
      spotifyUserData = await fetchSpotifyUserData(authData.access_token);
      logger.info('Successfully fetched Spotify user data', {
        spotifyId: spotifyUserData.id,
        email: spotifyUserData.email,
        operation: 'spotifyCallback'
      });
    } catch (fetchError) {
      logger.error('Failed to fetch Spotify user data', {
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        operation: 'spotifyCallback'
      });

      const errorRedirectUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/error?type=user_data_fetch_failed'
          : 'http://localhost:5173/error?type=user_data_fetch_failed';

      return res.redirect(errorRedirectUrl);
    }

    let user;

    if (isConnectFlow) {
      user = await User.findById(existingUserId);
      if (!user) {
        throw new Error('User not found for connect flow');
      }

      const existingSpotifyAccount = user.linked_accounts?.find(
        account => account.provider === 'spotify' && account.provider_id === spotifyUserData.id
      );

      if (existingSpotifyAccount) {
        logger.info('Spotify already connected to user, updating tokens', {
          userId: user._id,
          spotifyId: spotifyUserData.id,
          operation: 'spotifyCallback'
        });

        await User.findOneAndUpdate(
          {
            _id: user._id,
            'linked_accounts.provider_id': spotifyUserData.id,
            'linked_accounts.provider': 'spotify'
          },
          {
            $set: {
              'linked_accounts.$.access_token': authData.access_token,
              'linked_accounts.$.refresh_token': authData.refresh_token,
              'linked_accounts.$.provider_email': spotifyUserData.email,
              'linked_accounts.$.provider_name': spotifyUserData.display_name,
              'linked_accounts.$.connected_at': new Date()
            }
          }
        );
      } else {
        logger.info('Connecting Spotify to existing user for first time', {
          userId: user._id,
          spotifyId: spotifyUserData.id,
          operation: 'spotifyCallback'
        });

        await User.findOneAndUpdate({ _id: user._id }, {
          $push: {
            linked_accounts: {
              provider: 'spotify',
              provider_id: spotifyUserData.id,
              provider_email: spotifyUserData.email,
              provider_name: spotifyUserData.display_name,
              access_token: authData.access_token,
              refresh_token: authData.refresh_token,
              connected_at: new Date()
            }
          }
        });
      }

      user = await User.findById(user._id);

      logger.info('Successfully connected Spotify to existing user', {
        userId: user._id,
        spotifyId: spotifyUserData.id,
        operation: 'spotifyCallback'
      });
    } else {
      user = await findOrCreateUser(spotifyUserData, authData);

      logger.info('Successfully created or updated user', {
        userId: user._id,
        isNewUser: !user.last_successful_fetch_date,
        operation: 'spotifyCallback'
      });
    }

    try {
      await SpotifyService.processUserListenedSongs(user);
      logger.info('Successfully processed user listening history', {
        userId: user._id,
        operation: 'spotifyCallback'
      });
    } catch (fetchError) {
      logger.error('Failed to fetch user songs from Spotify after login', {
        userId: user._id,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        operation: 'spotifyCallback'
      });
    }

    if (isConnectFlow) {
      const redirectUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/dashboard?spotifyConnected=true'
          : 'http://localhost:5173/dashboard?spotifyConnected=true';

      logger.info('Spotify connection completed successfully', {
        userId: user._id,
        operation: 'spotifyCallback'
      });

      return res.redirect(redirectUrl);
    } else {
      const myPieToken = jwt.sign(
        { user_id: user._id, type: 'fan' },
        MY_PIE_JWT_TOKEN_SECRET,
        { expiresIn: '1w' }
      );

      res.cookie('mypie_access_token_fan', myPieToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      const redirectUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://mypie.app/dashboard'
          : 'http://localhost:5173/dashboard';

      logger.info('Spotify authentication completed successfully', {
        userId: user._id,
        operation: 'spotifyCallback'
      });

      return res.redirect(redirectUrl);
    }
  } catch (error) {
    logger.error('Spotify authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'spotifyCallback'
    });

    const errorRedirectUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://mypie.app/error?type=authentication_failed'
        : 'http://localhost:5173/error?type=authentication_failed';

    return res.redirect(errorRedirectUrl);
  }
};

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
  };
}

const wrappedControllers = {
  loginSpotify: controllerWrapper(loginSpotify),
  connectSpotify: controllerWrapper(connectSpotify),
  callback: controllerWrapper(callback)
};

export default wrappedControllers;
