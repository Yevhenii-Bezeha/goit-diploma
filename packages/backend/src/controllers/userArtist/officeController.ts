import { Request, Response } from 'express';
import HttpError from '../../helpers/HttpError';
import * as officeService from '../../services/userArtist/officeService';
import { IUserArtist } from '../../models/userArtist/AuthUserArtist';

interface AuthRequest extends Request {
  user: IUserArtist;
}


const createOffice = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.user._id as string;

  if (!name || typeof name !== 'string') {
    throw new HttpError(400, 'Office name is required and must be a string');
  }

  const office = await officeService.createOffice(userId, name);

  res.status(201).json({
    success: true,
    data: office
  });
};


const getUserOffices = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id as string;
  const offices = await officeService.getUserOffices(userId);

  res.status(200).json({
    success: true,
    data: offices
  });
};

export default {
  createOffice,
  getUserOffices
};
