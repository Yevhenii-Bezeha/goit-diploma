import express from 'express';
import stripeControllers from '../../controllers/userArtist/stripeControllers';
import isUserArtistAuthenticated from '../../middlewares/isAuthenticatedUserArtist';

const stripeRouter = express.Router();

stripeRouter.get(
  '/createLoginLink',
  isUserArtistAuthenticated,
  stripeControllers.createLoginLink
);

stripeRouter.post(
  '/completeOnboarding',
  isUserArtistAuthenticated,
  stripeControllers.completeOnboarding
);

stripeRouter.post(
  '/create-payout',
  isUserArtistAuthenticated,
  stripeControllers.initiateManualPayout
);

stripeRouter.get(
  '/wallet-balance',
  isUserArtistAuthenticated,
  stripeControllers.getWalletBalance
);

stripeRouter.get(
  '/transactions',
  isUserArtistAuthenticated,
  stripeControllers.getTransactionHistory
);

stripeRouter.get(
  '/payouts',
  isUserArtistAuthenticated,
  stripeControllers.getPayoutHistory
);

export default stripeRouter;
