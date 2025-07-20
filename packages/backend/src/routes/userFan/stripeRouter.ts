import express from 'express';

import stripeControllers from '../../controllers/userFan/stripeControllers';
import isAuthenticated from '../../middlewares/isAuthenticated';

const stripeRouter = express.Router();

stripeRouter.post(
  '/createCheckout',
  isAuthenticated,
  stripeControllers.createCheckout
);

export default stripeRouter;
