import express from 'express';
import officeController from '../../controllers/userArtist/officeController';
import isUserArtistAuthenticated from '../../middlewares/isAuthenticatedUserArtist';

const officeRouter = express.Router();

officeRouter.use(isUserArtistAuthenticated);

officeRouter.post('/', officeController.createOffice);
officeRouter.get('/', officeController.getUserOffices);

export default officeRouter;
