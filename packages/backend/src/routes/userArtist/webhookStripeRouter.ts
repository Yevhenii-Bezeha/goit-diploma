import express from 'express';
import checkStripeConnectEvent from '../../middlewares/checkStripeConnectEvent';
import stripeWebhookControllers from '../../controllers/userArtist/stripeWebhookControllers';
import logger from '../../utils/logger';

const webhookStripeRouter = express.Router();

webhookStripeRouter.post(
  '/',
  [express.raw({ type: 'application/json' }), checkStripeConnectEvent],
  (req, res, next) => {
    const event = req.stripeEvent;

    logger.debug('Received Stripe Connect webhook event:', {
      eventType: event.type,
      eventId: event.id,
      accountId: event.account
    });

    switch (event.type) {
      case 'account.updated':
        return stripeWebhookControllers.handleAccountUpdated(req, res, next);

      case 'capability.updated':
        return stripeWebhookControllers.handleCapabilityUpdated(req, res, next);

      case 'person.updated':
        return stripeWebhookControllers.handlePersonUpdated(req, res, next);

      case 'file.created':
      case 'account.application.authorized':
      case 'account.external_account.created':
      case 'person.created':
        logger.debug(`Acknowledged event type: ${event.type}`, {
          eventId: event.id,
          accountId: event.account
        });
        return res.status(200).json({ received: true });

      default:
        logger.info(`Unhandled event type: ${event.type}`, {
          eventId: event.id,
          accountId: event.account
        });
        return res.status(200).json({ received: true });
    }
  }
);

export default webhookStripeRouter;
