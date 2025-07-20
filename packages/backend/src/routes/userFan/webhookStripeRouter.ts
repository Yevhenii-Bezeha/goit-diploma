import express from 'express';
import Stripe from 'stripe';

import checkStripeCheckoutEvent from '../../middlewares/checkStripeCheckoutEvent';
import stripeControllers from '../../controllers/userFan/stripeControllers';
import logger from '../../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

const webhookStripeRouter = express.Router();

const checkEnvironment = async (req, res, next) => {
  const event = req.stripeEvent;
  let eventEnv = null;

  if (event.data.object.metadata?.node_env) {
    eventEnv = event.data.object.metadata.node_env;
  } else if (event.data.object.subscription_details?.metadata?.node_env) {
    eventEnv = event.data.object.subscription_details.metadata.node_env;
  } else if (event.type.includes('subscription') && event.data.object.id) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id
      );
      eventEnv = subscription.metadata?.node_env;
    } catch (error) {
      logger.warn('Could not retrieve subscription for environment check', {
        eventId: event.id,
        subscriptionId: event.data.object.id,
        error: error.message
      });
    }
  } else if (event.type.includes('invoice') && event.data.object.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.subscription
      );
      eventEnv = subscription.metadata?.node_env;
    } catch (error) {
      logger.warn('Could not retrieve subscription for environment check', {
        eventId: event.id,
        subscriptionId: event.data.object.subscription,
        error: error.message
      });
    }
  }

  const currentEnv = process.env.NODE_ENV || 'development';

  if (eventEnv && eventEnv !== currentEnv) {
    logger.info(
      `Skipping event - environment mismatch: event(${eventEnv}) vs current(${currentEnv})`,
      { eventId: event.id, eventType: event.type }
    );
    return res
      .status(200)
      .json({ received: true, skipped: true, reason: 'environment_mismatch' });
  }

  next();
};

webhookStripeRouter.post(
  '/checkoutCompleted',
  [
    express.raw({ type: 'application/json' }),
    checkStripeCheckoutEvent,
    checkEnvironment
  ],
  (req, res, next) => {
    const event = req.stripeEvent;

    switch (event.type) {
      case 'invoice.paid':
        return stripeControllers.handleInvoicePaid(req, res, next);
      case 'customer.subscription.deleted':
        return stripeControllers.handleSubscriptionDeleted(req, res, next);
      case 'customer.subscription.updated':
        return stripeControllers.handleSubscriptionUpdated(req, res, next);
      case 'invoice.upcoming':
        return stripeControllers.handleInvoiceUpcoming(req, res, next);
      case 'billing_portal.session.created':
        return res.status(200).json({ received: true });
      default:
        logger.info(`Unhandled webhook event: ${event.type}`, {
          eventId: event.id
        });
        return res.status(200).json({ received: true });
    }
  }
);

export default webhookStripeRouter;
