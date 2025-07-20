import HttpError from '../helpers/HttpError';

const validateBody = (schema) => (req, _, next) => {
  const { error } = schema.validate(req.body);

  if (error) next(new HttpError(400, error.message));

  next();
};

export default validateBody;
