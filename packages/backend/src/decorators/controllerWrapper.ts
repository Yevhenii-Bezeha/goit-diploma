import { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from '../utils/logger';
import AppError from '../utils/AppError';
import crypto from 'crypto';

interface RequestWithId extends Request {
  requestId: string;
}

type Controller = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;


const controllerWrapper = (controller: Controller): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!Object.prototype.hasOwnProperty.call(req, 'requestId')) {
        const requestId = crypto.randomBytes(8).toString('hex');
        Object.defineProperty(req, 'requestId', {
          value: requestId,
          writable: false,
          enumerable: true
        });
      }

      await controller(req, res, next);
    } catch (error) {
      const controllerName = controller.name || 'Unknown controller';
      const context = {
        controller: controllerName,
        path: req.path,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestId: (req as RequestWithId).requestId
      };

      if (error instanceof AppError) {
        if (!error.requestId) {
          error.requestId = (req as RequestWithId).requestId;
        }

        error.context = { ...error.context, ...context };

        error.logged = true;

        logger.error(`Error in ${controllerName}: ${error.message}`, { error });
      } else if (error instanceof Error) {
        const appError = new AppError(
          error.message || 'Internal Server Error',
          500,
          {
            context,
            requestId: (req as RequestWithId).requestId,
            originalError: error,
            code: 'INTERNAL_SERVER_ERROR'
          }
        );

        appError.logged = true;

        logger.error(
          `Unexpected error in ${controllerName}: ${error.message}`,
          {
            error: appError
          }
        );

        next(appError);
        return;
      } else {
        const message = typeof error === 'string' ? error : 'Unknown error';
        const appError = new AppError(message, 500, {
          context,
          requestId: (req as RequestWithId).requestId,
          code: 'INTERNAL_SERVER_ERROR'
        });

        appError.logged = true;

        logger.error(`Non-standard error in ${controllerName}`, {
          error: appError,
          originalValue: error
        });

        next(appError);
        return;
      }

      next(error);
    }
  };
};

export default controllerWrapper;
