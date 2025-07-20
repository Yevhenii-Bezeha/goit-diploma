import express from 'express';
import userControllers from '../../controllers/userFan/userControllers';
import isAuthenticated from '../../middlewares/isAuthenticated';

const userRouter = express.Router();

userRouter.get('/', isAuthenticated, userControllers.getUserInfo);

export default userRouter;
