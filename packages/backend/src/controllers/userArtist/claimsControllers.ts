import { Request, Response } from 'express';
import * as claimsService from '../../services/userArtist/claimsService';
import controllerWrapper from '../../decorators/controllerWrapper';
import { IUserArtist } from '../../models/userArtist/AuthUserArtist';
import AppError from '../../utils/AppError';

interface AuthRequest extends Request {
  user: IUserArtist;
}


const getClaims = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id as string;
  const { status, officeId } = req.query;

  if (!officeId) {
    throw AppError.badRequest('Office ID is required');
  }

  const data = await claimsService.getUserClaims(
    userId,
    status as string | undefined,
    officeId as string
  );

  return res.status(200).json({
    success: true,
    data
  });
};


const createClaim = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id as string;
  const claim = await claimsService.createClaim(userId, req.body);

  return res.status(201).json({
    success: true,
    data: claim
  });
};


const deleteClaim = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user._id;

  const result = await claimsService.deleteClaim(id, userId.toString());

  return res.status(200).json({
    success: true,
    data: result
  });
};

const wrappedControllers = {
  getClaims: controllerWrapper(getClaims),
  createClaim: controllerWrapper(createClaim),
  deleteClaim: controllerWrapper(deleteClaim)
};

export default wrappedControllers;
