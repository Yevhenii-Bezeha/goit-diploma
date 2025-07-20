import express from 'express';

import claimsControllers from '../../controllers/userArtist/claimsControllers';
import isIdValid from '../../middlewares/isIdValid';
import isUserArtistAuthenticated from '../../middlewares/isAuthenticatedUserArtist';

const claimsRouter = express.Router();

claimsRouter.get('/', isUserArtistAuthenticated, claimsControllers.getClaims);

claimsRouter.post(
  '/',
  isUserArtistAuthenticated,
  claimsControllers.createClaim
);

claimsRouter.delete(
  '/:id',
  isUserArtistAuthenticated,
  isIdValid,
  claimsControllers.deleteClaim
);

export default claimsRouter;
