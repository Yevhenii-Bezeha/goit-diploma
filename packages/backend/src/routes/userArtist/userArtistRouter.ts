import express from 'express';
import { getUserArtistById, searchArtists } from '../../controllers/userArtist/userArtistController';
import isUserArtistAuthenticated from '../../middlewares/isAuthenticatedUserArtist';

const userArtistRouter = express.Router();

userArtistRouter.get(
  '/user',
  isUserArtistAuthenticated,
  getUserArtistById
);

userArtistRouter.get('/search', searchArtists);

export default userArtistRouter;
