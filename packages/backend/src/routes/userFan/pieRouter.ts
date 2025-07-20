import express from 'express';

import isAuthenticated from '../../middlewares/isAuthenticated';
import pieControllers from '../../controllers/userFan/pieControllers';

const pieRouter = express.Router();

pieRouter.get('/active', isAuthenticated, pieControllers.getActivePie);

pieRouter.get('/active/:pieId', isAuthenticated, pieControllers.getActivePieDetails);

pieRouter.get(
  '/:pieId/realtime-stats',
  isAuthenticated,
  pieControllers.getPieRealtimeStats
);

pieRouter.post(
  '/add-missing-tracks-anytime',
  isAuthenticated,
  pieControllers.addMissingTracksAnytime
);

pieRouter.patch(
  '/artist/:artistId/ban',
  isAuthenticated,
  pieControllers.banArtist
);

pieRouter.patch(
  '/artist/:pieArtistId/set-inclusion',
  isAuthenticated,
  pieControllers.removePieArtist
);

export default pieRouter;
