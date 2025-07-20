import controllerWrapper from '../../decorators/controllerWrapper';

import logger from '../../utils/logger';
import * as officeService from '../../services/userArtist/officeService';
import Office from '../../models/userArtist/Office';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

const handleAccountUpdated = async (req, res) => {
  const event = req.stripeEvent;
  const account = event.data.object;

  try {
    const office = await officeService.findOfficeByStripeAccountId(account.id);

    if (!office) {
      logger.warn('No office found for Stripe account:', {
        accountId: account.id,
        event: event.type
      });
      return res.status(200).json({ received: true });
    }

    let accountStatus = 'pending';
    if (
      account.payouts_enabled &&
      account.capabilities?.transfers === 'active'
    ) {
      accountStatus = 'complete';
    } else if (account.requirements?.currently_due?.length > 0) {
      accountStatus = 'requires_information';
    } else if (account.requirements?.pending_verification?.length > 0) {
      accountStatus = 'pending_verification';
    }

    if (office.stripe_connect_account_status !== accountStatus) {
      await Office.findByIdAndUpdate(office._id, {
        stripe_connect_account_status: accountStatus
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling account.updated event:', {
      error: error.message,
      accountId: account.id
    });
    res.status(500).json({ error: error.message });
  }
};

const handleCapabilityUpdated = async (req, res) => {
  const event = req.stripeEvent;
  const capability = event.data.object;

  try {
    const office = await officeService.findOfficeByStripeAccountId(
      capability.account
    );

    if (!office) {
      logger.warn('No office found for Stripe capability update:', {
        accountId: capability.account,
        event: event.type
      });
      return res.status(200).json({ received: true });
    }

    if (capability.id === 'transfers') {
      const stripeAccount = await stripe.accounts.retrieve(capability.account);

      let accountStatus = 'pending';
      if (stripeAccount.payouts_enabled && capability.status === 'active') {
        accountStatus = 'complete';

      } else if (stripeAccount.requirements?.currently_due?.length > 0) {
        accountStatus = 'requires_information';
      } else if (stripeAccount.requirements?.pending_verification?.length > 0) {
        accountStatus = 'pending_verification';
      }

      if (office.stripe_connect_account_status !== accountStatus) {
        await Office.findByIdAndUpdate(office._id, {
          stripe_connect_account_status: accountStatus
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling capability.updated event:', {
      error: error.message,
      accountId: capability.account
    });
    res.status(500).json({ error: error.message });
  }
};

const handlePersonUpdated = async (req, res) => {
  const event = req.stripeEvent;
  const person = event.data.object;

  try {
    const office = await officeService.findOfficeByStripeAccountId(
      person.account
    );

    if (!office) {
      logger.warn('No office found for Stripe person update:', {
        accountId: person.account,
        event: event.type
      });
      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling person.updated event:', {
      error: error.message,
      accountId: person.account
    });
    res.status(500).json({ error: error.message });
  }
};

export default {
  handleAccountUpdated: controllerWrapper(handleAccountUpdated),
  handleCapabilityUpdated: controllerWrapper(handleCapabilityUpdated),
  handlePersonUpdated: controllerWrapper(handlePersonUpdated)
};
