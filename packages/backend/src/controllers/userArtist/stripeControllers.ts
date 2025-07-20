import { Request, Response } from 'express';
import * as stripeService from '../../services/userArtist/stripeService';
import * as officeService from '../../services/userArtist/officeService';
import AppError from '../../utils/AppError';
import { IUserArtist } from '../../models/userArtist/AuthUserArtist';
import controllerWrapper from '../../decorators/controllerWrapper';
import logger from '../../utils/logger';

interface AuthRequest extends Request {
  user: IUserArtist;
}

const initiateManualPayout = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { officeId } = req.body;

  if (!officeId) {
    throw new AppError('Office ID is required', 400, {
      context: {
        operation: 'initiateManualPayout'
      }
    });
  }

  const isAdmin = await officeService.isUserAdminOfOffice(
    user._id.toString(),
    officeId
  );

  if (!isAdmin) {
    throw new AppError('User is not an admin of this office', 403, {
      context: {
        operation: 'initiateManualPayout',
        userId: user._id.toString(),
        officeId
      }
    });
  }

  const office = await officeService.getOfficeById(officeId);

  if (!office) {
    throw new AppError('Office not found', 404, {
      context: {
        operation: 'initiateManualPayout',
        officeId
      }
    });
  }

  if (!office.stripe_connect_account_id) {
    throw new AppError('Office does not have a connected Stripe account', 400, {
      context: {
        operation: 'initiateManualPayout',
        officeId
      }
    });
  }

  const { processOfficeWalletPayout } = await import(
    '../../services/userArtist/artistWalletTransactionService'
  );

  const payoutResult = await processOfficeWalletPayout(
    officeId,
    office.stripe_connect_account_id
  );

  logger.info('Processed office wallet payout', {
    officeId,
    result: payoutResult
  });

  if (!payoutResult.success) {
    throw new AppError(payoutResult.error || 'Payout failed', 400, {
      context: {
        operation: 'initiateManualPayout',
        officeId,
        payoutError: payoutResult.error
      }
    });
  }

  return res.status(200).json({
    success: true,
    data: payoutResult
  });
};

const completeOnboarding = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { officeId, country } = req.body;

  if (!officeId) {
    throw new AppError('Office ID is required', 400, {
      context: {
        operation: 'completeOnboarding'
      }
    });
  }

  const isAdmin = await officeService.isUserAdminOfOffice(
    user._id.toString(),
    officeId
  );

  if (!isAdmin) {
    throw new AppError('User is not an admin of this office', 403, {
      context: {
        operation: 'completeOnboarding',
        userId: user._id.toString(),
        officeId
      }
    });
  }

  const office = await officeService.getOfficeById(officeId);

  if (!office) {
    throw new AppError('Office not found', 404, {
      context: {
        operation: 'completeOnboarding',
        officeId
      }
    });
  }

  let accountId = office.stripe_connect_account_id;
  let isNewAccount = false;

  if (!accountId) {
    const accountCountry = country || user.country || 'US';

    const account = await stripeService.createStripeAccount(
      accountCountry,
      user,
      officeId
    );

    await stripeService.updateOfficeStripeDetails(
      officeId,
      account.id,
      'pending'
    );

    accountId = account.id;
    isNewAccount = true;
  }

  const accountLink = await stripeService.createAccountLink(accountId);

  return res.status(200).json({
    success: true,
    data: {
      account_id: accountId,
      is_new_account: isNewAccount,
      accountLink: accountLink
    }
  });
};

const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { officeId, limit = 20, page = 1, filter } = req.query;

  if (!officeId) {
    throw new AppError('Office ID is required', 400, {
      context: {
        operation: 'getTransactionHistory'
      }
    });
  }

  const isMember = await officeService.isUserMemberOfOffice(
    user._id.toString(),
    officeId.toString()
  );

  if (!isMember) {
    throw new AppError('User is not a member of this office', 403, {
      context: {
        operation: 'getTransactionHistory',
        userId: user._id.toString(),
        officeId
      }
    });
  }

  const office = await officeService.getOfficeById(officeId.toString());

  if (!office) {
    throw new AppError('Office not found', 404, {
      context: {
        operation: 'getTransactionHistory',
        officeId
      }
    });
  }

  let filterType: 'money_in' | 'money_out' | undefined;
  if (filter === 'credit') filterType = 'money_in';
  else if (filter === 'payout') filterType = 'money_out';

  const { getOfficeWalletTransactions } = await import(
    '../../services/userArtist/artistWalletTransactionService'
  );

  const transactions = await getOfficeWalletTransactions(
    officeId.toString(),
    Number(limit),
    Number(page),
    filterType
  );

  return res.status(200).json({
    success: true,
    data: transactions
  });
};

const getPayoutHistory = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { officeId, limit = 20, startingAfter } = req.query;

  if (!officeId) {
    throw new AppError('Office ID is required', 400, {
      context: {
        operation: 'getPayoutHistory'
      }
    });
  }

  const isMember = await officeService.isUserMemberOfOffice(
    user._id.toString(),
    officeId.toString()
  );

  if (!isMember) {
    throw new AppError('User is not a member of this office', 403, {
      context: {
        operation: 'getPayoutHistory',
        userId: user._id.toString(),
        officeId
      }
    });
  }

  const { default: OfficePayout } = await import('../../models/userArtist/OfficePayout');

  const query: any = { officeId: officeId.toString() };

  if (startingAfter) {
    query.createdAt = { $lt: new Date(startingAfter.toString()) };
  }

  const officePayouts = await OfficePayout.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  const payouts = officePayouts.map(payout => ({
    id: payout.payoutId || payout.transferId,
    amount: payout.transferAmount,
    arrival_date: payout.payoutPaidAt ?
      Math.floor(payout.payoutPaidAt.getTime() / 1000) :
      Math.floor(payout.transferCreatedAt.getTime() / 1000),
    created: Math.floor(payout.transferCreatedAt.getTime() / 1000),
    description: `Office payout: ${payout.artistBreakdown.length} artists`,
    status: payout.status === 'completed' ? 'paid' :
      payout.status === 'failed' ? 'failed' : 'pending'
  }));

  const response = {
    object: 'list',
    url: '/api/for-artists/stripe/payouts',
    has_more: officePayouts.length === Number(limit),
    data: payouts
  };

  return res.status(200).json({
    success: true,
    data: response
  });
};

const getWalletBalance = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { officeId } = req.query;

  if (!officeId) {
    throw new AppError('Office ID is required', 400, {
      context: {
        operation: 'getWalletBalance'
      }
    });
  }

  const isMember = await officeService.isUserMemberOfOffice(
    user._id.toString(),
    officeId.toString()
  );

  if (!isMember) {
    throw new AppError('User is not a member of this office', 403, {
      context: {
        operation: 'getWalletBalance',
        userId: user._id.toString(),
        officeId
      }
    });
  }

  const { getOfficeWalletBalance } = await import(
    '../../services/userArtist/artistWalletTransactionService'
  );

  const balance = await getOfficeWalletBalance(officeId.toString());

  return res.status(200).json({
    success: true,
    data: balance
  });
};

const createLoginLink = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { officeId } = req.query;

  if (!officeId) {
    throw new AppError('Office ID is required', 400, {
      context: {
        operation: 'createLoginLink'
      }
    });
  }

  const isMember = await officeService.isUserMemberOfOffice(
    user._id.toString(),
    officeId.toString()
  );

  if (!isMember) {
    throw new AppError('User is not a member of this office', 403, {
      context: {
        operation: 'createLoginLink',
        userId: user._id.toString(),
        officeId
      }
    });
  }

  const office = await officeService.getOfficeById(officeId.toString());

  if (!office) {
    throw new AppError('Office not found', 404, {
      context: {
        operation: 'createLoginLink',
        officeId
      }
    });
  }

  if (!office.stripe_connect_account_id) {
    throw new AppError('Office does not have a connected Stripe account', 400, {
      context: {
        operation: 'createLoginLink',
        officeId
      }
    });
  }

  const loginLink = await stripeService.createLoginLink(
    office.stripe_connect_account_id
  );

  return res.status(200).json({
    success: true,
    data: {
      login_url: loginLink.url
    }
  });
};

export default {
  initiateManualPayout: controllerWrapper(initiateManualPayout),
  completeOnboarding: controllerWrapper(completeOnboarding),
  getTransactionHistory: controllerWrapper(getTransactionHistory),
  getPayoutHistory: controllerWrapper(getPayoutHistory),
  getWalletBalance: controllerWrapper(getWalletBalance),
  createLoginLink: controllerWrapper(createLoginLink)
};
