import controllerWrapper from '../../decorators/controllerWrapper';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import {
  createCustomer,
  createCheckoutSession,
  cancelSubscriptionAtPeriodEnd,
  isUserAdmin
} from '../../services/userFan/stripeService';

import { endPie } from '../../services/userFan/pieService';
import { updateUserStripeCustomerId } from '../../services/userFan/usersServices';
import User from '../../models/userFan/User';
import Pie from '../../models/userFan/Pie';
import TrackListened from '../../models/userFan/TrackListened';
import AppError, { InsufficientWalletBalanceError } from '../../utils/AppError';
import logger from '../../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

const createCheckout = async (req, res) => {
  const { amount, artistLimit, artistPopularity, excludeNonActive, pieDays } =
    req.body;

  if (!amount) {
    throw AppError.badRequest('Amount is required');
  }

  const { _id, stripe_customer_id, email } = req.user;

  let finalPieDays = 30;

  if (isUserAdmin(email) && pieDays && pieDays > 0) {
    finalPieDays = pieDays;
  } else if (pieDays && !isUserAdmin(email)) {
    logger.warn('Non-admin user attempted to set custom pie duration', {
      email,
      requestedPieDays: pieDays
    });
  }

  if (!stripe_customer_id) {
    const customer = await createCustomer();
    await updateUserStripeCustomerId(_id, customer.id);
    req.user.stripe_customer_id = customer.id;
  }

  const success_url =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/pie/successCheckout'
      : 'http://localhost:5173/pie/successCheckout';

  const session = await createCheckoutSession(
    amount,
    artistLimit,
    artistPopularity,
    excludeNonActive,
    success_url,
    _id,
    req.user.stripe_customer_id,
    finalPieDays
  );

  res.status(200).json({
    data: session
  });
};

const handleInvoicePaid = async (req, res) => {
  const data = req.stripeEvent.data.object;
  const eventId = req.stripeEvent.id;
  const processingInfo = req.stripeEventProcessing;

  try {
    const subscription = await stripe.subscriptions.retrieve(data.subscription);
    if (!subscription.metadata.user_id) {
      logger.error('No user_id in subscription metadata', {
        subscriptionId: data.subscription,
        metadata: subscription.metadata
      });
      return res.status(400).json({ message: 'No user_id found in subscription metadata' });
    }
    const userId = subscription.metadata.user_id;
    const userExists = await User.findById(userId);
    if (!userExists) {
      logger.error('User not found in local database - webhook processing failed', {
        userId,
        subscriptionId: data.subscription,
        eventId,
        environment: process.env.NODE_ENV || 'development'
      });
      return res.status(500).json({
        message: 'User not found in local database - webhook processing failed',
        error: 'user_not_found_locally',
        requiresRetry: true
      });
    }
    const subscriptionAmount = subscription.items.data[0].price.unit_amount;
    let chargeId;
    if (data.amount_paid === 0) {
      const hasPromotionalDiscount = data.discount || subscription.discount;
      if (hasPromotionalDiscount) {
        chargeId = 'promotional_pie';
      } else {
        logger.error('Payment required - amount_paid is 0 but no promotional discount', {
          subscriptionId: data.subscription,
          invoiceId: data.id,
          amountPaid: data.amount_paid
        });
        return res.status(400).json({ message: 'Payment required - no promotional discount found' });
      }
    } else {
      chargeId = data.charge || 'regular_payment';
    }

    if (data.billing_reason === 'subscription_cycle') {
      try {
        const { handlePieRenewal } = await import('../../services/userFan/stripeService');
        const result = await handlePieRenewal({
          userId,
          subscription: subscription as any,
          data,
          eventId,
          processingInfo,
          chargeId,
          subscriptionAmount
        });
        return res.status(200).json({
          message: result.result === 'renewal_success'
            ? 'Renewal processed successfully - old pie ended, new pie created with wallet balance + subscription amount'
            : 'No listening activity detected in previous period, subscription cancelled and funds refunded',
          ...result
        });
      } catch (error) {
        logger.error('Error in handlePieRenewal', {
          subscriptionId: data.subscription,
          chargeId: data.charge,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return res.status(500).json({
          message: 'Failed to process pie renewal',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      try {
        const { handleInitialSubscription } = await import('../../services/userFan/stripeService');
        const result = await handleInitialSubscription({
          userId,
          subscription: subscription as any,
          data,
          eventId,
          processingInfo,
          chargeId,
          subscriptionAmount
        });
        return res.status(200).json({
          message: 'Initial subscription processed successfully with wallet balance + subscription amount',
          ...result
        });
      } catch (error) {
        logger.error('Error in handleInitialSubscription', {
          subscriptionId: data.subscription,
          chargeId: data.charge,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return res.status(500).json({
          message: 'Failed to process initial subscription',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  } catch (error) {
    const processingInfo = req.stripeEventProcessing;
    if (error instanceof InsufficientWalletBalanceError) {
      logger.error('Webhook failed due to insufficient wallet balance', {
        subscriptionId: data.subscription,
        error: error.message,
        eventId: req.stripeEvent.id
      });
      return res.status(422).json({
        error: 'insufficient_wallet_balance',
        message: error.message,
        subscription_id: data.subscription,
        requires_manual_review: true
      });
    }
    logger.error('Error in handleInvoicePaid', {
      subscriptionId: data.subscription,
      chargeId: data.charge,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({
      message: 'Failed to upsert pie/payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


const handleSubscriptionDeleted = async (req, res) => {
  const data = req.stripeEvent.data.object;
  const eventId = req.stripeEvent.id;

  try {
    const pie = await Pie.findOne({ subscriptionId: data.id, is_active: true });

    if (!pie) {
      logger.warn('No pie found for deleted subscription', {
        subscriptionId: data.id
      });

      return res.status(200).json({
        message: 'No pie found for deleted subscription'
      });
    }

    const userExists = await User.findById(pie.user_id);
    if (!userExists) {
      logger.warn(
        'User not found in local database - skipping subscription deletion processing',
        {
          userId: pie.user_id,
          subscriptionId: data.id,
          pieId: pie._id,
          environment: process.env.NODE_ENV || 'development'
        }
      );

      return res.status(200).json({
        message: 'User not found in local database - event skipped',
        skipped: true,
        reason: 'user_not_found_locally'
      });
    }

    if (!pie.is_paid) {
      await Pie.findByIdAndUpdate(pie._id, {
        $set: {
          is_active: false,
          is_completed: true
        }
      });

      return res.status(200).json({
        message: 'Unpaid pie marked as completed'
      });
    }

    await endPie(pie.user_id, pie._id.toString(), data.customer);

    return res.status(200).json({
      message: 'Pie ended successfully',
      pieId: pie._id
    });
  } catch (error) {

    logger.error('Error in handleSubscriptionDeleted', {
      subscriptionId: data.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      message: 'Failed to process subscription deletion',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


const handleSubscriptionUpdated = async (req, res) => {
  const data = req.stripeEvent.data.object;

  try {
    if (!data.metadata.user_id) {
      logger.error('No user_id in subscription metadata', {
        subscriptionId: data.id,
        metadata: data.metadata
      });

      return res.status(400).json({
        message: 'No user_id found in subscription metadata'
      });
    }

    const userExists = await User.findById(data.metadata.user_id);
    if (!userExists) {
      logger.error(
        'User not found in local database - webhook processing failed',
        {
          userId: data.metadata.user_id,
          subscriptionId: data.id,
          eventId: req.stripeEvent.id,
          environment: process.env.NODE_ENV || 'development'
        }
      );

      return res.status(500).json({
        message: 'User not found in local database - webhook processing failed',
        error: 'user_not_found_locally',
        requiresRetry: true
      });
    }

    const pies = await Pie.find({
      subscriptionId: data.id,
      is_active: true
    });

    if (pies.length === 0) {
      logger.warn(
        'No pies found for subscription update - invoice.paid may not have arrived yet',
        {
          subscriptionId: data.id,
          status: data.status,
          eventId: req.stripeEvent.id
        }
      );

      return res.status(200).json({
        message: 'No pies found for subscription - waiting for invoice.paid',
        subscriptionId: data.id,
        status: data.status
      });
    }

    switch (data.status) {
      case 'active':
        if (data.pause_collection) {
          for (const pie of pies) {
            await Pie.findByIdAndUpdate(pie._id, {
              $set: {
                is_active: false,
                is_completed: false,
                is_trialing: false
              }
            });
          }
        } else {
          for (const pie of pies) {
            await Pie.findByIdAndUpdate(pie._id, {
              $set: {
                is_active: true,
                is_completed: false,
                is_trialing: false
              }
            });
          }
        }
        break;

      case 'past_due':
        for (const pie of pies) {
          await Pie.findByIdAndUpdate(pie._id, {
            $set: {
              is_active: false
            }
          });
        }
        break;

      case 'canceled':
      case 'unpaid':
        for (const pie of pies) {
          if (!pie.is_paid) {
            await Pie.findByIdAndUpdate(pie._id, {
              $set: {
                is_active: false,
                is_completed: true
              }
            });
          } else {
            await endPie(pie.user_id, pie._id.toString(), data.customer);
          }
        }
        break;

      case 'incomplete':
        for (const pie of pies) {
          await Pie.findByIdAndUpdate(pie._id, {
            $set: {
              is_active: false,
              is_trialing: false
            }
          });
        }
        break;

      default:
        logger.warn(`Unhandled subscription status: ${data.status}`, {
          subscriptionId: data.id,
          eventId: req.stripeEvent.id
        });
    }

    res.status(200).json({
      message: 'Subscription status processed successfully',
      updatedPiesCount: pies.length,
      subscriptionId: data.id,
      status: data.status
    });
  } catch (error) {

    logger.error('Error in handleSubscriptionUpdated', {
      subscriptionId: data.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      message: 'Failed to process subscription status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


const handleInvoiceUpcoming = async (req, res) => {
  const data = req.stripeEvent.data.object;
  const subscriptionId = data.subscription;

  try {
    const pie = await Pie.findOne({
      subscriptionId
    });

    if (!pie) {
      return res.status(200).json({
        message: 'No pie found with this subscription, nothing to cancel'
      });
    }

    const hasTracks = await TrackListened.exists({ pie_id: pie._id });
    if (!hasTracks) {
      try {
        await cancelSubscriptionAtPeriodEnd(subscriptionId);
        return res.status(200).json({
          message: 'Subscription cancelled at period end due to empty pie',
          subscriptionId,
          pieId: pie._id
        });
      } catch (stripeError) {
        if (
          stripeError.message &&
          stripeError.message.includes('Test clock advancement underway')
        ) {
          logger.info(
            'Test clock advancement in progress - skipping subscription cancellation',
            {
              subscriptionId,
              pieId: pie._id,
              testClock: data.test_clock,
              error: stripeError.message
            }
          );

          return res.status(200).json({
            message:
              'Test clock advancement in progress - subscription cancellation skipped',
            subscriptionId,
            pieId: pie._id,
            reason: 'test_clock_advancement'
          });
        }

        throw stripeError;
      }
    }

    return res.status(200).json({
      message: 'Pie is not empty, subscription will continue',
      subscriptionId,
      pieId: pie._id
    });
  } catch (error) {
    logger.error('Error in handleInvoiceUpcoming', {
      subscriptionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({
      message: 'Failed to process invoice.upcoming',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  createCheckout: controllerWrapper(createCheckout),
  handleInvoicePaid: controllerWrapper(handleInvoicePaid),
  handleSubscriptionDeleted: controllerWrapper(handleSubscriptionDeleted),
  handleSubscriptionUpdated: controllerWrapper(handleSubscriptionUpdated),
  handleInvoiceUpcoming: controllerWrapper(handleInvoiceUpcoming)
};
