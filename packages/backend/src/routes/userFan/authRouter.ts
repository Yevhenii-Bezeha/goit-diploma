import express from 'express';

import authController from '../../controllers/userFan/authController';
import isAuthenticated from '../../middlewares/isAuthenticated';

const fanAuthRouter = express.Router();

fanAuthRouter.get(
  '/loginSpotify',
  authController.loginSpotify
);

fanAuthRouter.get(
  '/connectSpotify',
  isAuthenticated,
  authController.connectSpotify
);

fanAuthRouter.get('/callback', authController.callback);

export default fanAuthRouter;
