
import FanWallet from '../../models/userFan/FanWallet';
import FanWalletTransaction, {
  IFanWalletTransaction
} from '../../models/userFan/FanWalletTransaction';
import logger from '../../utils/logger';
import { InsufficientWalletBalanceError } from '../../utils/AppError';


export async function getOrCreateFanWallet(userId: string) {
  let wallet = await FanWallet.findOne({ userId });

  if (!wallet) {
    try {
      wallet = await FanWallet.create({ userId });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof err.message === 'string' &&
        err.message.includes('duplicate key')
      ) {
        wallet = await FanWallet.findOne({ userId });
        if (!wallet) {
          throw new Error(
            'Failed to create or find wallet after duplicate key error'
          );
        }
      } else {
        throw err;
      }
    }
  }

  return wallet;
}


export async function createWalletTransaction(
  userId: string,
  amount: number,
  transactionType: 'credit' | 'debit',
  source: string,
  metadata: Record<string, unknown> = {},
  options: {
    pieId?: string;
    chargeId?: string;
    pieReference?: string;
    status?: 'pending' | 'processed' | 'failed';
  } = {}
): Promise<{
  transaction: IFanWalletTransaction;
  previousBalance: number;
  newBalance: number;
}> {
  if (!userId || typeof amount !== 'number' || amount === 0) {
    throw new Error(
      `Invalid transaction parameters: userId=${userId}, amount=${amount}`
    );
  }

  if (transactionType === 'debit') {
    const balanceCheck = await checkMinimumBalance(userId, amount, -10);
    if (!balanceCheck.isAllowed) {
      throw new InsufficientWalletBalanceError(
        balanceCheck.currentBalance,
        amount,
        -10
      );
    }
  }

  const fanWallet = await getOrCreateFanWallet(userId);

  const currentWallet = await FanWallet.findOne({ userId });
  const previousBalance = currentWallet?.balance || 0;

  const transaction = await FanWalletTransaction.create({
    fanWalletId: fanWallet._id,
    userId: userId,
    pieId: options.pieId,
    amount: amount,
    transaction_type: transactionType,
    status: options.status || 'processed',
    charge_id: options.chargeId,
    source: source,
    pie_reference: options.pieReference,
    date: new Date(),
    metadata: metadata
  });

  const updatedWallet = await FanWallet.findOneAndUpdate(
    { userId },
    {
      $inc: { balance: amount },
      $set: { updatedAt: new Date() }
    },
    {
      new: true,
      upsert: true
    }
  );

  const newBalance = updatedWallet!.balance;

  const expectedBalance = previousBalance + amount;
  if (Math.abs(newBalance - expectedBalance) > 1) {
    throw new Error(
      `Balance inconsistency detected: expected=${expectedBalance}, actual=${newBalance}`
    );
  }

  logger.info('Created wallet transaction with balance update', {
    transactionId: transaction._id,
    userId,
    amount: amount / 100,
    transactionType,
    source,
    previousBalance: previousBalance / 100,
    newBalance: newBalance / 100
  });

  return {
    transaction,
    previousBalance,
    newBalance
  };
}


export async function createSubscriptionPaymentTransaction(
  userId: string,
  amount: number,
  chargeId: string,
  subscriptionId: string,
  invoiceId: string,
  stripeMetadata: {
    balance_transaction_id?: string;
    fee_amount?: number;
    net_amount?: number;
  }
): Promise<IFanWalletTransaction> {
  const result = await createWalletTransaction(
    userId,
    amount,
    'credit',
    'subscription_payment',
    {
      subscription_id: subscriptionId,
      invoice_id: invoiceId,
      stripe_details: {
        charge_id: chargeId,
        balance_transaction_id: stripeMetadata.balance_transaction_id,
        fee_amount: stripeMetadata.fee_amount,
        net_amount: stripeMetadata.net_amount,
        gross_amount: amount
      }
    },
    {
      chargeId: chargeId
    }
  );

  return result.transaction;
}


export async function createPiePaymentTransaction(
  userId: string,
  amount: number,
  pieId: string,
  pieDetails: {
    start_date: Date;
    end_date: Date;
    amount: number;
  },
  transactionChainId?: string,
  paymentBreakdown?: {
    wallet_balance_used: number;
    subscription_payment: number;
  }
): Promise<IFanWalletTransaction> {
  const result = await createWalletTransaction(
    userId,
    -Math.abs(amount),
    'debit',
    'pie_payment',
    {
      pie_details: {
        pie_id: pieId,
        start_date: pieDetails.start_date,
        end_date: pieDetails.end_date,
        amount: pieDetails.amount
      },
      payment_breakdown: paymentBreakdown
        ? {
          wallet_balance_used: paymentBreakdown.wallet_balance_used / 100,
          subscription_payment: paymentBreakdown.subscription_payment / 100,
          total_amount: amount / 100
        }
        : undefined
    },
    {
      pieId: pieId,
      pieReference: pieId
    }
  );

  return result.transaction;
}


export async function createPieRefundTransaction(
  userId: string,
  amount: number,
  originalPieId: string,
  reason: string
): Promise<IFanWalletTransaction> {
  const result = await createWalletTransaction(
    userId,
    Math.abs(amount),
    'credit',
    'pie_refund',
    {
      refund_details: {
        reason: reason,
        original_pie_id: originalPieId,
        explanation:
          'Refund credit: adding money back to wallet for empty pie. Amount is net after all fees.'
      }
    },
    {
      pieId: originalPieId,
      pieReference: originalPieId
    }
  );

  return result.transaction;
}


export async function getFanWalletBalance(userId: string): Promise<{
  balance: number;
}> {
  try {
    const result = await FanWalletTransaction.aggregate([
      {
        $match: {
          userId: userId,
          status: 'processed'
        }
      },
      {
        $group: {
          _id: null,
          balance: { $sum: '$amount' }
        }
      }
    ]);

    const calculatedBalance = result[0]?.balance || 0;

    return {
      balance: calculatedBalance
    };
  } catch (error) {
    logger.error('Failed to calculate fan wallet balance from transactions', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      balance: 0
    };
  }
}


export async function checkMinimumBalance(
  userId: string,
  debitAmount: number,
  minimumBalance: number = -10
): Promise<{
  currentBalance: number;
  projectedBalance: number;
  isAllowed: boolean;
}> {
  const { balance: currentBalance } = await getFanWalletBalance(userId);
  const projectedBalance = currentBalance + debitAmount;
  const isAllowed = projectedBalance >= minimumBalance;
  return {
    currentBalance,
    projectedBalance,
    isAllowed
  };
}
