import { Stripe } from 'stripe';
import { Request, Response, NextFunction } from 'express';
import HttpError from '../helpers/HttpError';
import logger from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

interface StripeRequest extends Request {
  stripeEvent?: Stripe.Event;
  rawBody?: Buffer;
}

const checkStripeConnectEvent = async (
  request: StripeRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const endpointSecret = process.env.STRIPE_CONNECT_ENDPOINT_SECRET;

    const signature = request.headers['stripe-signature'] as string;

    logger.debug('Received Stripe Connect webhook:', {
      signature: signature ? 'present' : 'missing',
      endpointSecret: endpointSecret ? 'configured' : 'missing',
      contentType: request.headers['content-type'],
      bodyType: typeof request.body,
      bodyLength: request.body?.length
    });

    if (!endpointSecret) {
      logger.warn(
        'No Stripe Connect endpoint secret configured - webhook verification skipped'
      );
      request.stripeEvent = request.body;
      return next();
    }

    if (!signature) {
      logger.error('Stripe Connect webhook signature missing');
      return next(new HttpError(401, 'Stripe signature missing'));
    }

    try {
      const event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );

      logger.debug('Stripe Connect webhook verified:', {
        eventId: event.id,
        eventType: event.type
      });

      request.stripeEvent = event;
      next();
    } catch (err) {
      logger.error('Stripe Connect webhook signature verification failed:', {
        error: err.message
      });
      next(
        new HttpError(
          401,
          `Webhook signature verification failed: ${err.message}`
        )
      );
    }
  } catch (error) {
    logger.error('Error processing Stripe Connect webhook:', {
      error: error.message
    });
    next(
      new HttpError(500, `Server error processing webhook: ${error.message}`)
    );
  }
};

export default checkStripeConnectEvent;
