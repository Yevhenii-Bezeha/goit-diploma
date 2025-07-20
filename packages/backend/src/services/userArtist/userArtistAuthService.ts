import jwt from 'jsonwebtoken';
import AuthUserArtist, {
  ArtistRole,
  OfficeType
} from '../../models/userArtist/AuthUserArtist';
import { ALLOWED_COUNTRIES } from '../../utils/constants';
import type { Stripe } from 'stripe';
import { createDefaultOfficeForUser } from './officeService';
import logger from '../../utils/logger';
import AppError from '../../utils/AppError';
import Office from '../../models/userArtist/Office';

const { MY_PIE_JWT_TOKEN_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } =
  process.env;

const GOOGLE_OAUTH_SCOPES = ['email', 'profile'];

export const getGoogleAuthUrl = () => {
  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/api/for-artists/auth/google/callback'
      : 'http://localhost:3000/api/for-artists/auth/google/callback';

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUrl);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', GOOGLE_OAUTH_SCOPES.join(' '));
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');

  return url.toString();
};

export const getGoogleTokens = async (code: string) => {
  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/api/for-artists/auth/google/callback'
      : 'http://localhost:3000/api/for-artists/auth/google/callback';

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new AppError('Failed to get Google tokens', 500, {
      context: {
        operation: 'googleAuth',
        status: response.status
      }
    });
  }

  return response.json();
};

export const getGoogleUserInfo = async (access_token: string) => {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppError('Failed to get Google user info', 500, {
      context: {
        operation: 'googleUserInfo',
        status: response.status,
        errorDetails: errorData
      }
    });
  }

  return response.json();
};

interface CompleteGoogleRegistrationData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  country: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;
  type: OfficeType;
  role?: ArtistRole;
  label_name?: string;
  country_of_incorporation?: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  accepted_terms_and_conditions: boolean;
  image_url?: string;
  google_id?: string;
  password?: string;
}

export async function completeGoogleRegistration(
  data: CompleteGoogleRegistrationData
) {
  const {
    email,
    first_name,
    last_name,
    phone_number,
    country,
    type,
    role,
    label_name,
    country_of_incorporation,
    social_links,
    accepted_terms_and_conditions,
    image_url,
    google_id,
    password
  } = data;

  try {
    if (!accepted_terms_and_conditions) {
      throw AppError.badRequest('You must accept the terms and conditions');
    }

    if (type === OfficeType.ARTIST && !role) {
      throw AppError.badRequest('Role is required for Artist type');
    }

    if (type === OfficeType.LABEL) {
      if (!label_name) {
        throw AppError.badRequest('Label name is required for Label type');
      }
      if (!country_of_incorporation) {
        throw AppError.badRequest(
          'Country of incorporation is required for Label type'
        );
      }
      if (!ALLOWED_COUNTRIES.includes(country_of_incorporation)) {
        throw AppError.badRequest(
          'Invalid country of incorporation. Please select from the allowed countries list'
        );
      }
    }

    const authUserArtist = new AuthUserArtist({
      email,
      first_name,
      last_name,
      phone_number,
      country,
      country_of_incorporation,
      social_links,
      accepted_terms_and_conditions,
      image_url,
      google_id,
      auth_type: 'google',
      email_verified: true
    });
    if (password) {
      authUserArtist.password = password;
    }
    await authUserArtist.save();

    const updatedArtist = await AuthUserArtist.findById(authUserArtist._id).select('+password');
    if (!updatedArtist) {
      throw AppError.notFound('AuthUserArtist not found after creation');
    }

    try {
      const officeName =
        type === OfficeType.LABEL && label_name
          ? label_name
          : `${first_name}'s Office`;

      logger.info('Creating office during Google registration', {
        userId: authUserArtist._id,
        officeName,
        type
      });

      const userOffices = await Office.find({
        'members.user_id': authUserArtist._id
      });

      if (userOffices.length === 0) {
        const office = await createDefaultOfficeForUser(
          authUserArtist._id.toString(),
          officeName,
          type
        );

        if (office === null) {
          logger.info(
            'Office creation skipped during Google registration due to incomplete user profile',
            {
              userId: authUserArtist._id
            }
          );
        } else {
          logger.info(
            'Office created successfully during Google registration',
            {
              userId: authUserArtist._id,
              officeId: office._id
            }
          );
        }
      } else {
        logger.info(
          'User already has offices, skipping default office creation',
          {
            userId: authUserArtist._id,
            officeCount: userOffices.length
          }
        );
      }
    } catch (error) {
      logger.error(
        'Failed to create default office during Google registration:',
        {
          userId: authUserArtist._id,
          error: error instanceof Error ? error.message : String(error)
        }
      );
    }

    const token = jwt.sign(
      { user_id: authUserArtist._id, type: 'artist' },
      MY_PIE_JWT_TOKEN_SECRET,
      { expiresIn: '1w' }
    );

    return { token, userArtist: authUserArtist };
  } catch (error) {
    logger.error('Error during Google registration', {
      email,
      error: error instanceof Error ? error.message : String(error)
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw AppError.badRequest(
      error instanceof Error ? error.message : 'Google registration failed'
    );
  }
}
