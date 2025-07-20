import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

import HttpError from '../helpers/HttpError';

const checkStripeCheckoutEvent = async (request, response, next) => {
  try {
    let event = request.body;
    const { STRIPE_CHECKOUT_ENDPOINT_SECRET } = process.env;

    if (STRIPE_CHECKOUT_ENDPOINT_SECRET) {
      const signature = request.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          STRIPE_CHECKOUT_ENDPOINT_SECRET
        );
      } catch (err) {
        next(new HttpError(401, err.message));
      }
    }

    request.stripeEvent = event;

    next();
  } catch (error) {
    next(new HttpError(500, error.message));
  }
};

export default checkStripeCheckoutEvent;
