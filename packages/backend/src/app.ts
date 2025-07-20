import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';

import { Request, Response, NextFunction } from 'express';
import AppError from './utils/AppError';

import logger from './utils/logger';

import './utils/scheduler';
import artistAuthRouter from './routes/userArtist/artistAuthRouter';
import webhookStripeRouter from './routes/userFan/webhookStripeRouter';
import webhookStripeConnectRouter from './routes/userArtist/webhookStripeRouter';
import fanAuthRouter from './routes/userFan/authRouter';
import stripeRouter from './routes/userFan/stripeRouter';
import artistStripeRouter from './routes/userArtist/stripeRouter';
import claimsRouter from './routes/userArtist/claimsRouter';
import officeRouter from './routes/userArtist/officeRouter';
import userRouter from './routes/userFan/userRouter';
import pieRouter from './routes/userFan/pieRouter';
import tracksRouter from './routes/userFan/tracksRouter';
import userArtistRouter from './routes/userArtist/userArtistRouter';

const { MONGO_DB, PORT = 3000 } = process.env;

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://mypie.app', 'mypie.azurewebsites.net']
      : 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use('/api/webhook/stripe/connect', webhookStripeConnectRouter);
app.use('/api/webhook/stripe', webhookStripeRouter);

app.use(express.json());

app.use('/api/for-artists/auth', artistAuthRouter);
app.use('/api/for-artists/stripe', artistStripeRouter);
app.use('/api/for-artists/claims', claimsRouter);
app.use('/api/for-artists/offices', officeRouter);
app.use('/api/for-artists/', userArtistRouter);

app.use('/api/auth', fanAuthRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/user', userRouter);
app.use('/api/pie', pieRouter);
app.use('/api/tracks', tracksRouter);


app.use(express.static(path.resolve(__dirname, '..', 'frontend-dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend-dist', 'index.html'));
});

interface RequestWithId extends Request {
  requestId: string;
}

app.use((req: Request, res: Response) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method
  });
  res.status(404).json({ message: 'Route not found' });
});

app.use(
  (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    const requestId =
      (err as AppError).requestId ||
      (req as RequestWithId).requestId ||
      'unknown';

    const status = (err as AppError).status || 500;
    const message = err.message || 'Server error';
    const code = (err as AppError).code || 'INTERNAL_SERVER_ERROR';
    const isLogged = (err as AppError).logged || false;

    if (!isLogged) {
      const logLevel = status >= 500 ? 'error' : 'warn';
      const context = {
        requestId,
        path: req.path,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: status,
        ip: req.ip
      };

      logger[logLevel](
        `${logLevel === 'error' ? 'Server error' : 'Client error'}: ${message}`,
        {
          error: err,
          ...context
        }
      );
    }

    const errorResponse = {
      status,
      message,
      code,
      requestId,
      ...(process.env.NODE_ENV !== 'production'
        ? {
          stack:
            err instanceof Error && err.stack
              ? err.stack.split('\n').map((line) => line.trim())
              : undefined
        }
        : {})
    };

    res.status(status).json(errorResponse);
  }
);

mongoose
  .connect(MONGO_DB as string)
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    logger.error('Database connection failed', { message: error.message });
    process.exit(1);
  });
