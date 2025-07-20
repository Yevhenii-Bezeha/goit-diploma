import express from 'express';
import tracksControllers from '../../controllers/userFan/tracksControllers';
import isAuthenticated from '../../middlewares/isAuthenticated';

const tracksRouter = express.Router();

tracksRouter.get(
  '/user/latest',
  isAuthenticated,
  tracksControllers.getLatestListenedTracks
);

export default tracksRouter;
