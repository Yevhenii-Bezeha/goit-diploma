import express from 'express';
import userArtistAuthController from '../../controllers/userArtist/userArtistAuthController';

const artistAuthRouter = express.Router();

artistAuthRouter.get(
  '/loginGoogle',
  userArtistAuthController.loginGoogle
);
artistAuthRouter.get(
  '/google/callback',
  userArtistAuthController.googleCallback
);
artistAuthRouter.post(
  '/complete-registration',
  userArtistAuthController.completeRegister
);

export default artistAuthRouter;
