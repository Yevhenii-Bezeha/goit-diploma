import crypto from 'crypto';
import { getAuthorizeUrl, requestAccessToken } from './spotifyApiService';
import User, { IUser } from '../../models/userFan/User';
import logger from '../../utils/logger';
import { SpotifyTokenResponse } from '../../types/spotify.types';
import axios from 'axios';
import AppError from '../../utils/AppError';
import { getSpotifyRefreshToken, updateSpotifyTokens } from './usersServices';

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET
} = process.env;

const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api/token';

export const generateRandomString = (length: number) => {
  return crypto.randomBytes(60).toString('hex').slice(0, length);
};

export const getAuthUrl = (scope: string, state: string) => {
  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/api/auth/callback'
      : 'http://localhost:3000/api/auth/callback';

  return getAuthorizeUrl(scope, SPOTIFY_CLIENT_ID, redirectUrl, state);
};

export const getAuthToken = async (code: string) => {
  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/api/auth/callback'
      : 'http://localhost:3000/api/auth/callback';

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          'base64'
        )
    },
    json: true
  };

  return await requestAccessToken(authOptions);
};

export async function refreshAccessToken(user: IUser): Promise<string | null> {
  const requestId = crypto.randomBytes(8).toString('hex');

  const refreshToken = getSpotifyRefreshToken(user);
  if (!refreshToken) {
    throw new AppError(`No refresh token found for user ${user._id}`, 400, {
      context: {
        userId: user._id,
        operation: 'tokenRefresh'
      },
      requestId
    });
  }

  try {
    const response = await axios.post<SpotifyTokenResponse>(
      SPOTIFY_ACCOUNTS_URL,
      null,
      {
        params: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!response.data.access_token) {
      throw new AppError(
        'Failed to refresh access token - missing token in response',
        400,
        {
          context: {
            userId: user._id,
            operation: 'tokenRefresh',
            responseStatus: response.status
          },
          requestId
        }
      );
    }

    const expiry_date = new Date();
    expiry_date.setHours(expiry_date.getHours() + 1);

    await updateSpotifyTokens(
      user._id.toString(),
      response.data.access_token,
      response.data.refresh_token
    );

    await User.findByIdAndUpdate(user._id, {
      expiry_date: expiry_date
    });

    logger.info('Access token refreshed successfully', {
      userId: user._id,
      operation: 'tokenRefresh',
      newExpiryDate: expiry_date.toISOString(),
      refreshTokenUpdated: !!response.data.refresh_token,
      requestId
    });
    return response.data.access_token;
  } catch (error) {
    logger.error('Failed to refresh access token', {
      userId: user._id,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: 'tokenRefresh',
      requestId
    });
    return null;
  }
}

export const getSpotifyAndroidIntentUrl = (
  scope: string,
  state: string
): string => {
  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/api/auth/callback'
      : 'http://localhost:3000/api/auth/callback';

  const fallbackUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  return `intent://accounts.spotify.com/inapp-authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${encodeURIComponent(scope)}&state=${state}#Intent;scheme=https;package=com.spotify.music;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
};
