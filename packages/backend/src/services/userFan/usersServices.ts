import User from '../../models/userFan/User';
import request from 'request-promise';

export interface SpotifyUser {
  display_name: string;
  email: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: any[];
  type: string;
  uri: string;
}

export interface SpotifyTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export const fetchSpotifyUserData = async (accessToken: string) => {
  const attemptFetch = async (attempt: number): Promise<SpotifyUser> => {
    try {
      const options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { Authorization: 'Bearer ' + accessToken },
        json: true
      };

      const userData = await request.get(options);

      if (!userData || !userData.id) {
        throw new Error('Invalid user data received from Spotify API');
      }

      return userData;
    } catch (error) {
      const isRetryableError =
        (error.statusCode && error.statusCode >= 500) ||
        (error.statusCode && error.statusCode === 429) ||
        (!error.statusCode && error.code);

      if (attempt < 3 && isRetryableError) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptFetch(attempt + 1);
      }

      throw error;
    }
  };

  return attemptFetch(1);
};

import logger from '../../utils/logger';

export const findOrCreateUser = async (
  spotifyUserData: SpotifyUser,
  spotifyTokens: SpotifyTokens
) => {
  logger.info('Looking for user with Spotify ID', {
    spotifyId: spotifyUserData.id,
    spotifyEmail: spotifyUserData.email,
    operation: 'findOrCreateUser'
  });

  let user = await User.findOne({
    'linked_accounts.provider_id': spotifyUserData.id,
    'linked_accounts.provider': 'spotify'
  });

  if (user) {
    logger.info('Found existing user with Spotify account', {
      userId: user._id,
      authType: user.auth_type,
      email: user.email,
      operation: 'findOrCreateUser'
    });

    await User.findOneAndUpdate(
      {
        _id: user._id,
        'linked_accounts.provider_id': spotifyUserData.id,
        'linked_accounts.provider': 'spotify'
      },
      {
        $set: {
          'linked_accounts.$.access_token': spotifyTokens.access_token,
          'linked_accounts.$.refresh_token': spotifyTokens.refresh_token,
          'linked_accounts.$.provider_email': spotifyUserData.email,
          'linked_accounts.$.provider_name': spotifyUserData.display_name,
          'linked_accounts.$.connected_at': new Date()
        }
      }
    );

    user = await User.findById(user._id);
  } else {
    logger.info('No existing user found, will create new one', {
      operation: 'findOrCreateUser'
    });

    user = await User.create({
      email: spotifyUserData.email,
      user_name: spotifyUserData.display_name,
      image_url: spotifyUserData.images[0]?.url,
      auth_type: 'spotify',
      accepted_terms_and_conditions: true,
      linked_accounts: [{
        provider: 'spotify',
        provider_id: spotifyUserData.id,
        provider_email: spotifyUserData.email,
        provider_name: spotifyUserData.display_name,
        access_token: spotifyTokens.access_token,
        refresh_token: spotifyTokens.refresh_token,
        connected_at: new Date()
      }]
    });
  }

  return user;
};

export const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    if (user) {
      user._id = user._id.toString();
    }
    return user;
  } catch (error) {
    throw new Error(`Unable to find user: ${error.message}`);
  }
};

export const updateUserStripeCustomerId = async (user_id, customer_id) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user_id },
      {
        stripe_customer_id: customer_id
      },
      { new: false, upsert: false }
    );

    return updatedUser;
  } catch (error) {
    throw new Error(`Unable to update user: ${error.message}`);
  }
};

export const getSpotifyAccessToken = (user: any): string | undefined => {
  const spotifyAccount = user.linked_accounts?.find(
    (account: any) => account.provider === 'spotify'
  );
  return spotifyAccount?.access_token;
};

export const getSpotifyRefreshToken = (user: any): string | undefined => {
  const spotifyAccount = user.linked_accounts?.find(
    (account: any) => account.provider === 'spotify'
  );
  return spotifyAccount?.refresh_token;
};

export const updateSpotifyTokens = async (
  userId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> => {
  const updateFields: any = {
    'linked_accounts.$.access_token': accessToken
  };

  if (refreshToken) {
    updateFields['linked_accounts.$.refresh_token'] = refreshToken;
  }

  await User.findOneAndUpdate(
    {
      _id: userId,
      'linked_accounts.provider': 'spotify'
    },
    {
      $set: updateFields
    }
  );
};


