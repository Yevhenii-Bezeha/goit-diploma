import axios from 'axios';
import logger from '../../utils/logger';
import AppError from '../../utils/AppError';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface TokenRequestOptions {
  url: string;
  form: {
    code: string;
    redirect_uri: string;
    grant_type: string;
  };
  headers: {
    'content-type': string;
    Authorization: string;
  };
  json: boolean;
}

export const requestAccessToken = async (options: TokenRequestOptions): Promise<SpotifyTokenResponse> => {
  const retryRequest = async (attempt: number): Promise<SpotifyTokenResponse> => {
    try {
      const response = await axios.post(options.url,
        new URLSearchParams({
          code: options.form.code,
          redirect_uri: options.form.redirect_uri,
          grant_type: options.form.grant_type
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: options.headers.Authorization
          },
          timeout: 10000
        }
      );

      logger.info('Spotify token exchange successful', {
        operation: 'tokenExchange',
        attempt,
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        expiresIn: response.data.expires_in
      });

      return response.data;
    } catch (error) {
      const axiosError = error;
      const isRetryableError =
        !axiosError.response ||
        axiosError.response.status >= 500 ||
        axiosError.response.status === 429;

      if (attempt < 3 && isRetryableError) {
        const delay = Math.pow(2, attempt) * 1000;
        logger.warn(`Spotify token exchange failed, retrying in ${delay}ms`, {
          attempt,
          status: axiosError.response?.status,
          error: axiosError.message,
          code: options.form.code
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return retryRequest(attempt + 1);
      }

      logger.error('Spotify token exchange failed after all retries', {
        status: axiosError.response?.status,
        error: axiosError.message,
        errorDetails: axiosError.response?.data || {},
        totalAttempts: attempt,
        code: options.form.code
      });

      throw new AppError('Failed to exchange Spotify authorization code for tokens', 400, {
        context: {
          operation: 'tokenExchange',
          status: axiosError.response?.status,
          error: axiosError.message,
          errorDetails: axiosError.response?.data || {},
          totalAttempts: attempt
        }
      });
    }
  };

  return retryRequest(1);
};

export const getAuthorizeUrl = (scope: string, clientId: string, redirectUri: string, state: string): string => {
  return (
    `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${redirectUri}&` +
    `scope=${scope}&` +
    `state=${state}`
  );
};
