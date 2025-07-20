import { Request, Response } from 'express';
import controllerWrapper from '../../decorators/controllerWrapper';
import * as userArtistAuthService from '../../services/userArtist/userArtistAuthService';
import { OfficeType } from '../../models/userArtist/AuthUserArtist';
import AuthUserArtist from '../../models/userArtist/AuthUserArtist';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger';
import AppError from '../../utils/AppError';

const { MY_PIE_JWT_TOKEN_SECRET } = process.env;

const loginGoogle = (req: Request, res: Response): void => {
  const authUrl = userArtistAuthService.getGoogleAuthUrl();
  res.redirect(authUrl);
};

const googleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.redirect(
      '/#' + new URLSearchParams({ error: 'invalid_code' }).toString()
    );
  }

  const tokens = await userArtistAuthService.getGoogleTokens(code);
  const userInfo = await userArtistAuthService.getGoogleUserInfo(
    tokens.access_token
  );

  const userArtist = await AuthUserArtist.findOne({ email: userInfo.email });

  if (!userArtist) {
    const registrationToken = jwt.sign(
      {
        email: userInfo.email,
        google_id: userInfo.id,
        first_name: userInfo.given_name,
        last_name: userInfo.family_name,
        image_url: userInfo.picture,
        auth_type: 'google'
      },
      MY_PIE_JWT_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    logger.info('Google auth - redirecting to registration completion', {
      email: userInfo.email
    });

    const redirectUrl =
      process.env.NODE_ENV === 'production'
        ? `https://mypie.app/for-artists/complete-registration?token=${registrationToken}`
        : `http://localhost:5173/for-artists/complete-registration?token=${registrationToken}`;

    return res.redirect(redirectUrl);
  }

  const token = jwt.sign(
    { user_id: userArtist._id, type: 'artist' },
    MY_PIE_JWT_TOKEN_SECRET,
    { expiresIn: '1w' }
  );

  logger.info('Artist user logged in with Google', {
    userId: userArtist._id
  });

  res.cookie('mypie_access_token_artist', token);

  const redirectUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/for-artists/dashboard'
      : 'http://localhost:5173/for-artists/dashboard';

  res.redirect(redirectUrl);
};

const completeRegister = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    throw AppError.badRequest('Registration token is required');
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, MY_PIE_JWT_TOKEN_SECRET) as {
      email: string;
      first_name: string;
      last_name: string;
      image_url?: string;
      google_id?: string;
      auth_type?: string;
    };
  } catch {
    throw AppError.badRequest('Invalid or expired registration token');
  }

  const {
    phone_number,
    type,
    role,
    label_name,
    country,
    country_of_incorporation,
    social_links,
    accepted_terms_and_conditions
  } = req.body;

  const requiredFields = {
    phone_number,
    type,
    accepted_terms_and_conditions
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (type === OfficeType.ARTIST && !role) {
    missingFields.push('role');
  } else if (type === OfficeType.LABEL) {
    if (!label_name) missingFields.push('label_name');
    if (!country_of_incorporation)
      missingFields.push('country_of_incorporation');
  }

  if (missingFields.length > 0) {
    throw AppError.badRequest('Missing required fields', {
      context: { fields: missingFields }
    });
  }

  const { token: authToken, userArtist } =
    await userArtistAuthService.completeGoogleRegistration({
      email: decodedToken.email,
      first_name: decodedToken.first_name,
      last_name: decodedToken.last_name,
      google_id: decodedToken.google_id,
      phone_number,
      type,
      role,
      label_name,
      country,
      country_of_incorporation,
      social_links,
      accepted_terms_and_conditions,
      image_url: decodedToken.image_url
    });

  logger.info('Google registration completed', {
    userId: userArtist._id
  });

  res.cookie('mypie_access_token_artist', authToken);

  res.status(201).json({
    message: 'Registration completed successfully',
    user: {
      email: userArtist.email,
      first_name: userArtist.first_name,
      last_name: userArtist.last_name,
      country_of_incorporation: userArtist.country_of_incorporation
    }
  });
};

export default {
  loginGoogle: controllerWrapper(loginGoogle),
  googleCallback: controllerWrapper(googleCallback),
  completeRegister: controllerWrapper(completeRegister)
};
