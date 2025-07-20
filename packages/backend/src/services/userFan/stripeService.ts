import Stripe from 'stripe';
import { ALLOWED_COUNTRIES } from '../../utils/constants';
import Pie from '../../models/userFan/Pie';
import logger from '../../utils/logger';
import TrackListened from '../../models/userFan/TrackListened';
import { createPieRefundTransaction, createSubscriptionPaymentTransaction, getFanWalletBalance } from './fanWalletTransactionService';
import { endPie } from './pieService';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

export function isUserAdmin(email: string): boolean {
  return email && email.endsWith('@mypie.app');
}

export async function getOrCreateProduct() {
  const existingProducts = await stripe.products.list({
    limit: 1,
    active: true
  });
  const product = existingProducts.data.find(
    (product) => product.name === 'Artist Support Subscription'
  );

  if (product) {
    return product.id;
  } else {
    const newProduct = await stripe.products.create({
      name: 'Artist Support Subscription',
      description: 'Monthly support to your favorite artists'
    });
    logger.info('Created new Stripe product', { productId: newProduct.id });
    return newProduct.id;
  }
}

export async function createPrice(
  amount: number,
  productId: string,
  intervalDays: number = 30
) {


  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: amount,
    recurring: {
      interval: 'day',
      interval_count: intervalDays
    },
    product: productId
  });

  logger.debug('Created new Stripe price', {
    priceId: price.id,
    amount,
    productId,
    intervalDays
  });

  return price;
}

export async function createCheckoutSession(
  amount,
  artistLimit,
  artistPopularity,
  excludeNonActive,
  success_url,
  user_id,
  customerId,
  pieDays: number = 30
) {
  const productId = await getOrCreateProduct();

  const price = await createPrice(amount, productId, pieDays);

  const cancelUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/dashboard'
      : 'http://localhost:5173/dashboard';

  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
  {
    description: 'Artist Support Subscription',
    metadata: {
      user_id: user_id,
      artistLimit: String(artistLimit || 0),
      artistPopularity: String(artistPopularity || 0),
      excludeNonActive: String(excludeNonActive || false),
      pieDays: String(pieDays || 30),
      node_env: process.env.NODE_ENV || 'development'
    }
  };

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: price.id,
        quantity: 1
      }
    ],
    automatic_tax: {
      enabled: true
    },
    payment_method_collection: 'if_required',
    customer_update: {
      address: 'auto',
      shipping: 'auto'
    },
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ALLOWED_COUNTRIES
    },
    mode: 'subscription',
    success_url: success_url,
    cancel_url: cancelUrl,
    customer: customerId,
    allow_promotion_codes: true,
    subscription_data: subscriptionData
  });

  logger.info('Created Stripe checkout session', {
    sessionId: session.id,
    customerId,
    amount,
    pieDays
  });

  return session;
}

export async function createCustomerPortalSession(customerId) {
  const returnUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://mypie.app/dashboard'
      : 'http://localhost:5173/dashboard';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });

  return portalSession;
}

export async function createCustomer() {
  const customer = await stripe.customers.create();

  return customer;
}

export async function getDefaultPaymentMethod(
  customerId: string
): Promise<Stripe.PaymentMethod | null> {
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ['invoice_settings.default_payment_method']
  });

  if (!customer.deleted) {
    return (customer as Stripe.Customer).invoice_settings
      .default_payment_method as Stripe.PaymentMethod | null;
  }

  return null;
}

export async function listCustomerPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId
  });

  return paymentMethods.data;
}

export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      cancel_at_period_end: true
    }
  );

  logger.info('Scheduled subscription cancellation at period end', {
    subscriptionId,
    cancelAt: updatedSubscription.cancel_at
  });

  return updatedSubscription;
}

export async function handleInitialSubscription({
  userId,
  subscription,
  data,
  eventId,
  processingInfo,
  chargeId,
  subscriptionAmount
}: {
  userId: string;
  subscription: any;
  data: any;
  eventId: any;
  processingInfo: any;
  chargeId: any;
  subscriptionAmount: number;
}) {
  const Pie = require('../../models/userFan/Pie').default;
  const { getFanWalletBalance, createSubscriptionPaymentTransaction } = require('./fanWalletTransactionService');
  const mongoose = require('mongoose');
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST, { apiVersion: '2023-08-16' });

  const walletBalance = await getFanWalletBalance(userId);
  const currentWalletBalance = walletBalance.balance;
  const totalPieAmount = currentWalletBalance + subscriptionAmount;

  const pie = await Pie.create({
    _id: new mongoose.Types.ObjectId(),
    user_id: userId,
    is_active: true,
    is_recurring: true,
    is_completed: false,
    amount: totalPieAmount,
    is_paid: true,
    subscriptionId: data.subscription,
    stripe_charge_id: chargeId,
    artistLimit: parseInt(subscription.metadata.artistLimit) || 0,
    artistPopularity: parseInt(subscription.metadata.artistPopularity) || 0,
    excludeNonActive: subscription.metadata.excludeNonActive === 'true',
    is_trialing: false,
    cancelled_by_user: false,
    creation_state: 'pending',
    manual_artist_settings: [],
    start_date: new Date(subscription.current_period_start * 1000),
    end_date: new Date(subscription.current_period_end * 1000),
    invoiceId: data.id
  });

  if (data.charge) {
    const balanceTransactions = await stripe.balanceTransactions.list({ limit: 1, source: data.charge });
    if (balanceTransactions.data.length > 0) {
      const balanceTransaction = balanceTransactions.data[0];
      await createSubscriptionPaymentTransaction(userId, subscriptionAmount, data.charge, data.subscription, data.id, {
        balance_transaction_id: balanceTransaction.id,
        fee_amount: balanceTransaction.fee,
        net_amount: balanceTransaction.net
      });
    }
  }

  return {
    result: 'initial_success',
    pieId: pie._id,
    subscriptionAmount: subscriptionAmount / 100,
    walletBalance: currentWalletBalance / 100,
    totalAvailable: totalPieAmount / 100
  };
}


export async function handlePieRenewal({
  userId,
  subscription,
  data,
  eventId,
  processingInfo,
  chargeId,
  subscriptionAmount
}: {
  userId: string;
  subscription: any;
  data: any;
  eventId: any;
  processingInfo: any;
  chargeId: any;
  subscriptionAmount: number;
}) {


  const currentPie = await Pie.findOne({ subscriptionId: data.subscription, is_active: true, is_completed: false });
  if (!currentPie) {
    throw new Error('No active pie found for renewal');
  }

  const oldPieListeningCount = await TrackListened.countDocuments({
    user_id: userId,
    pie_id: currentPie._id,
  });

  if (oldPieListeningCount === 0) {
    await cancelSubscriptionAtPeriodEnd(data.subscription);
    const FanWalletTransaction = require('../../models/userFan/FanWalletTransaction').default;
    const piePaymentTx = await FanWalletTransaction.findOne({
      pieId: currentPie._id,
      transaction_type: 'debit',
      source: 'pie_payment'
    });
    if (!piePaymentTx) {
      throw new Error(
        `No pie payment transaction found for pie ${currentPie._id}. Refund aborted.`
      );
    }
    const refundAmount = piePaymentTx.amount;
    await createPieRefundTransaction(userId, refundAmount, currentPie._id.toString(), 'No listening activity in previous period - subscription cancelled');
    return {
      result: 'renewal_refund_no_listening',
      refundAmount,
      oldPieId: currentPie._id
    };
  }

  await endPie(userId, currentPie._id.toString(), subscription.customer);

  const walletBalance = await getFanWalletBalance(userId);
  const currentWalletBalance = walletBalance.balance;
  const totalPieAmount = currentWalletBalance + subscriptionAmount;

  const inheritedSettings = currentPie
    ? {
      artistLimit: currentPie.artistLimit,
      artistPopularity: currentPie.artistPopularity,
      excludeNonActive: currentPie.excludeNonActive,
      manual_artist_settings: currentPie.manual_artist_settings || []
    }
    : {
      artistLimit: parseInt(subscription.metadata.artistLimit) || 0,
      artistPopularity: parseInt(subscription.metadata.artistPopularity) || 0,
      excludeNonActive: subscription.metadata.excludeNonActive === 'true',
      manual_artist_settings: []
    };

  const newPie = await Pie.create({
    _id: new mongoose.Types.ObjectId(),
    user_id: userId,
    is_active: true,
    is_recurring: true,
    is_completed: false,
    amount: totalPieAmount,
    is_paid: true,
    subscriptionId: data.subscription,
    stripe_charge_id: chargeId,
    artistLimit: inheritedSettings.artistLimit,
    artistPopularity: inheritedSettings.artistPopularity,
    excludeNonActive: inheritedSettings.excludeNonActive,
    total_time_listened: 0,
    is_trialing: false,
    cancelled_by_user: false,
    creation_state: 'pending',
    manual_artist_settings: inheritedSettings.manual_artist_settings,
    start_date: new Date(subscription.current_period_start * 1000),
    end_date: new Date(subscription.current_period_end * 1000),
    invoiceId: data.id
  });

  if (data.charge) {
    const balanceTransactions = await stripe.balanceTransactions.list({ limit: 1, source: data.charge });
    if (balanceTransactions.data.length > 0) {
      const balanceTransaction = balanceTransactions.data[0];
      await createSubscriptionPaymentTransaction(userId, subscriptionAmount, data.charge, data.subscription, data.id, {
        balance_transaction_id: balanceTransaction.id,
        fee_amount: balanceTransaction.fee,
        net_amount: balanceTransaction.net
      });
    }
  }

  return {
    result: 'renewal_success',
    oldPieId: currentPie._id,
    newPieId: newPie._id,
    subscriptionAmount: subscriptionAmount / 100,
    walletBalance: currentWalletBalance / 100,
    totalAvailable: totalPieAmount / 100
  };
}
