import { isValidObjectId } from 'mongoose';

import HttpError from '../helpers/HttpError';

const isIdValid = (req, _, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) return next(new HttpError(404, 'Not valid id'));

  next();
};

export default isIdValid;
