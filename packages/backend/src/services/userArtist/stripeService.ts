import { Stripe } from 'stripe';
import { IUserArtist } from '../../models/userArtist/AuthUserArtist';
import AppError from '../../utils/AppError';
import logger from '../../utils/logger';
import * as officeService from './officeService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

export async function updateOfficeStripeDetails(
  officeId: string,
  stripeAccountId: string,
  accountStatus?: string
) {
  try {
    const office = await officeService.getOfficeById(officeId);

    if (!office) {
      logger.error('Office not found when updating Stripe details', {
        officeId
      });
      throw new AppError('Office not found', 404, {
        context: {
          operation: 'updateOfficeStripeDetails',
          officeId
        }
      });
    }

    const updatedOffice = await officeService.updateOfficeStripeDetails(
      officeId,
      stripeAccountId,
      accountStatus
    );

    if (!updatedOffice) {
      throw new AppError('Error updating office stripe details', 500, {
        context: {
          operation: 'updateOfficeStripeDetails',
          officeId
        }
      });
    }

    return updatedOffice;
  } catch (error) {
    throw new AppError('Error updating Stripe details', 500, {
      context: {
        operation: 'updateOfficeStripeDetails',
        officeId
      },
      originalError: error instanceof Error ? error : undefined
    });
  }
}

export async function createStripeAccount(
  country: string,
  userData: IUserArtist,
  officeId: string
) {
  try {
    const office = await officeService.getOfficeById(officeId);

    if (!office) {
      logger.error('Office not found when creating Stripe account', {
        officeId
      });
      throw new AppError('Office not found', 404, {
        context: {
          operation: 'createStripeAccount',
          officeId
        }
      });
    }

    const accountParams: Stripe.AccountCreateParams = {
      country: country,
      type: 'express',
      capabilities: {
        transfers: {
          requested: true
        }
      },
      email: userData.email,
      metadata: {
        user_id: userData._id.toString(),
        office_id: officeId
      }
    };

    if (country !== 'US') {
      accountParams.tos_acceptance = {
        service_agreement: 'recipient'
      };
    }

    const account = await stripe.accounts.create(accountParams);
    return account;
  } catch (error) {
    throw new AppError('Error creating Stripe account', 500, {
      context: {
        operation: 'createStripeAccount',
        officeId,
        country
      },
      originalError: error instanceof Error ? error : undefined
    });
  }
}

export async function createAccountLink(accountId: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: `https://mypie.app/for-artists`,
      refresh_url: `https://mypie.app/for-artists`,
      type: 'account_onboarding'
    });

    return accountLink;
  } catch (error) {
    throw new AppError('Error creating account link', 500, {
      context: {
        operation: 'createAccountLink',
        accountId
      },
      originalError: error instanceof Error ? error : undefined
    });
  }
}

export async function createLoginLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink;
  } catch (error) {
    throw new AppError('Error creating login link', 500, {
      context: {
        operation: 'createLoginLink',
        accountId
      },
      originalError: error instanceof Error ? error : undefined
    });
  }
}


