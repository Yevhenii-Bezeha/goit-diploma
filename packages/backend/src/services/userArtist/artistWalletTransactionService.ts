
import ArtistWallet from '../../models/userFan/ArtistWallet';
import ArtistWalletTransaction, {
  IArtistWalletTransaction
} from '../../models/userFan/ArtistWalletTransaction';
import OfficePayout from '../../models/userArtist/OfficePayout';
import Claim from '../../models/userFan/Claim';
import Artist from '../../models/userFan/Artist';

import { Stripe } from 'stripe';
import logger from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST as string, {
  apiVersion: '2023-08-16'
});

export async function getOrCreateArtistWallet(artistId: string) {
  let wallet = await ArtistWallet.findOne({ artistId });

  if (!wallet) {
    try {
      wallet = await ArtistWallet.create({ artistId });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof err.message === 'string' &&
        err.message.includes('duplicate key')
      ) {
        wallet = await ArtistWallet.findOne({ artistId });
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


export async function createArtistWalletTransaction(
  artistId: string,
  amount: number,
  transactionType: 'money_in' | 'money_out',
  source: 'pie_distribution' | 'artist_payout' | 'manual_adjustment',
  metadata: Record<string, unknown> = {},
  options: {
    pieId?: string;
    chargeId?: string;
    transferId?: string;
    fanWalletTransactionId?: string;
    fanCustomerId?: string;
    fanUserId?: string;
    payoutReference?: string;
  } = {}
): Promise<IArtistWalletTransaction> {
  if (!artistId || typeof amount !== 'number' || amount === 0) {
    throw new Error(
      `Invalid transaction parameters: artistId=${artistId}, amount=${amount}`
    );
  }

  if (transactionType === 'money_out' && amount > 0) {
    amount = -Math.abs(amount);
  }

  if (transactionType === 'money_in' && amount < 0) {
    amount = Math.abs(amount);
  }

  if (transactionType === 'money_out') {
    const currentBalance = await getArtistWalletBalance(artistId);
    const projectedBalance = currentBalance.balance + amount;
    if (projectedBalance < 0) {
      throw new Error(
        `Insufficient artist wallet balance. Current: ${currentBalance.balance / 100}, Requested: ${Math.abs(amount) / 100}`
      );
    }
  }

  const artistWallet = await getOrCreateArtistWallet(artistId);

  const transaction = await ArtistWalletTransaction.create({
    artistWalletId: artistWallet._id,
    artistId: artistId,
    amount: amount,
    transaction_type: transactionType,
    status: 'processed',
    source: source,
    date: new Date(),
    pieId: options.pieId,
    charge_id: options.chargeId,
    transfer_id: options.transferId,
    fanWalletTransactionId: options.fanWalletTransactionId,
    fan_customer_id: options.fanCustomerId,
    fan_user_id: options.fanUserId,
    payout_reference: options.payoutReference,
    metadata: metadata
  });

  logger.info('Created artist wallet transaction', {
    transactionId: transaction._id,
    artistId,
    amount: amount / 100,
    transactionType,
    source
  });

  return transaction;
}


export async function getArtistWalletBalance(artistId: string): Promise<{
  balance: number;
  totalMoneyIn: number;
  totalMoneyOut: number;
  totalInPayout: number;
  totalPaidOut: number;
}> {
  try {
    const [result, payoutTxs] = await Promise.all([
      ArtistWalletTransaction.aggregate([
        {
          $match: {
            artistId: artistId
          }
        },
        {
          $group: {
            _id: '$transaction_type',
            total: { $sum: '$amount' }
          }
        }
      ]),
      ArtistWalletTransaction.find({
        artistId: artistId,
        transaction_type: 'money_out',
        source: 'artist_payout',
        payout_reference: { $exists: true }
      })
    ]);

    let totalMoneyIn = 0;
    let totalMoneyOut = 0;
    for (const group of result) {
      if (group._id === 'money_in') {
        totalMoneyIn = group.total;
      } else if (group._id === 'money_out') {
        totalMoneyOut = Math.abs(group.total);
      }
    }

    let totalPaidOut = 0;
    let totalInPayout = 0;
    if (payoutTxs.length > 0) {
      const payoutRefs = [...new Set(payoutTxs.map(tx => tx.payout_reference))];
      const officePayouts = await OfficePayout.find({ payoutReference: { $in: payoutRefs } });
      const payoutStatusMap = new Map();
      for (const op of officePayouts) {
        payoutStatusMap.set(op.payoutReference, op.status);
      }
      for (const tx of payoutTxs) {
        const status = payoutStatusMap.get(tx.payout_reference);
        const absAmount = Math.abs(tx.amount);
        if (status === 'completed') {
          totalPaidOut += absAmount;
        } else if (status === 'pending' || status === 'in_progress') {
          totalInPayout += absAmount;
        }
      }
    }

    const balance = totalMoneyIn - totalMoneyOut;

    return {
      balance,
      totalMoneyIn,
      totalMoneyOut,
      totalInPayout,
      totalPaidOut
    };
  } catch (error) {
    logger.error('Failed to calculate artist wallet balance', {
      artistId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return {
      balance: 0,
      totalMoneyIn: 0,
      totalMoneyOut: 0,
      totalInPayout: 0,
      totalPaidOut: 0
    };
  }
}


export async function createArtistCreditTransaction(
  artist: {
    artist_id: string;
    artist_name: string;
    money_after_fees: string;
    total_time_listened: string;
    total_tracks_listened: number;
    percentage?: string;
  },
  pieId: string,
  customerId: string,
  userId: string,
  chargeId: string,
  fanWalletTransactionId?: string,
  fanDebitAmount?: number
): Promise<IArtistWalletTransaction> {
  if (!fanWalletTransactionId || typeof fanDebitAmount !== 'number') {
    throw new Error(
      'fanWalletTransactionId and fanDebitAmount are required for artist credit creation'
    );
  }

  const amount = Math.round(parseFloat(artist.money_after_fees) * 100);

  const currentSum = await getArtistCreditsSumForFanWalletTransaction(
    fanWalletTransactionId
  );

  if (currentSum + amount > Math.abs(fanDebitAmount) + 10) {
    throw new Error(
      `Artist credits would exceed fan debit. Current sum: ${currentSum}, new credit: ${amount}, fan debit: ${Math.abs(fanDebitAmount)}`
    );
  }

  return createArtistWalletTransaction(
    artist.artist_id,
    amount,
    'money_in',
    'pie_distribution',
    {
      artist_name: artist.artist_name,
      time_listened: parseInt(artist.total_time_listened.replace(/[^0-9]/g, '')),
      total_tracks_listened: artist.total_tracks_listened,
      percentage: artist.percentage
    },
    {
      pieId,
      chargeId,
      fanWalletTransactionId,
      fanCustomerId: customerId,
      fanUserId: userId
    }
  );
}


export async function createArtistPayoutTransaction(
  artistId: string,
  amount: number,
  transferId: string,
  metadata: {
    artist_name?: string;
    total_transactions_processed?: number;
    fee_amount?: number;
    net_amount?: number;
    gross_amount?: number;
  } = {}
): Promise<IArtistWalletTransaction> {
  return createArtistWalletTransaction(
    artistId,
    -Math.abs(amount),
    'money_out',
    'artist_payout',
    {
      ...metadata,
      payout_breakdown: {
        gross: metadata.gross_amount || amount,
        fee: metadata.fee_amount || 0,
        net: metadata.net_amount || amount
      }
    },
    {
      transferId,
      payoutReference: transferId
    }
  );
}


export async function getArtistCreditsSumForFanWalletTransaction(
  fanWalletTransactionId: string
): Promise<number> {
  const result = await ArtistWalletTransaction.aggregate([
    {
      $match: {
        fanWalletTransactionId,
        transaction_type: 'money_in',
        source: 'pie_distribution'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result[0]?.total || 0;
}


export async function getUserTotalWalletContributions(userId: string): Promise<{
  totalContributed: number;
  transactionCount: number;
}> {
  try {
    const userTransactions = await ArtistWalletTransaction.find({
      fan_user_id: userId,
      transaction_type: 'money_in',
      source: 'pie_distribution'
    });

    const totalContributed = userTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return {
      totalContributed,
      transactionCount: userTransactions.length
    };
  } catch (error) {
    logger.error('Failed to get user total wallet contributions', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      totalContributed: 0,
      transactionCount: 0
    };
  }
}


export async function getOfficeWalletBalance(officeId: string): Promise<{
  totalAvailable: number;
  totalInPayout: number;
  totalPaidOut: number;
  artistBreakdown: Array<{
    artistId: string;
    artistName: string;
    availableAmount: number;
    inPayoutAmount: number;
    paidOutAmount: number;
    transactionCount: number;
  }>;
}> {
  try {
    const claims = await Claim.find({
      office_id: officeId,
      status: 'Successful'
    });

    if (claims.length === 0) {
      return {
        totalAvailable: 0,
        totalInPayout: 0,
        totalPaidOut: 0,
        artistBreakdown: []
      };
    }

    const artistIds = claims.map((claim) => claim.artist_id);

    const balancePromises = artistIds.map(artistId => getArtistWalletBalance(artistId));
    const balances = await Promise.all(balancePromises);

    const artists = await Artist.find({ _id: { $in: artistIds } });
    const artistMap = new Map(artists.map(a => [a._id.toString(), a]));

    const [inPayoutData, paidOutData] = await Promise.all([
      OfficePayout.find({
        officeId,
        status: { $in: ['pending', 'in_progress'] }
      }),
      OfficePayout.find({
        officeId,
        status: 'completed'
      })
    ]);

    const inPayoutMap = new Map<string, number>();
    const paidOutMap = new Map<string, number>();

    inPayoutData.forEach(payout => {
      const current = inPayoutMap.get('TOTAL') || 0;
      inPayoutMap.set('TOTAL', current + payout.transferAmount);

      payout.artistBreakdown.forEach(artist => {
        const current = inPayoutMap.get(artist.artistId) || 0;
        inPayoutMap.set(artist.artistId, current + artist.amount);
      });
    });

    paidOutData.forEach(payout => {
      const current = paidOutMap.get('TOTAL') || 0;
      paidOutMap.set('TOTAL', current + payout.transferAmount);

      payout.artistBreakdown.forEach(artist => {
        const current = paidOutMap.get(artist.artistId) || 0;
        paidOutMap.set(artist.artistId, current + artist.amount);
      });
    });

    let totalAvailable = 0;
    const totalInPayout = inPayoutMap.get('TOTAL') || 0;
    const totalPaidOut = paidOutMap.get('TOTAL') || 0;
    const artistBreakdown = [];

    for (let i = 0; i < artistIds.length; i++) {
      const artistId = artistIds[i];
      const balance = balances[i];
      const artist = artistMap.get(artistId);

      const inPayoutAmount = inPayoutMap.get(artistId) || 0;
      const paidOutAmount = paidOutMap.get(artistId) || 0;

      totalAvailable += balance.balance;

      const transactionCount = await ArtistWalletTransaction.countDocuments({
        artistId: artistId,
        transaction_type: 'money_in'
      });

      artistBreakdown.push({
        artistId,
        artistName: artist?.name || `Artist ${artistId}`,
        availableAmount: balance.balance,
        inPayoutAmount,
        paidOutAmount,
        transactionCount
      });
    }

    return {
      totalAvailable,
      totalInPayout,
      totalPaidOut,
      artistBreakdown
    };
  } catch (error) {
    logger.error('Failed to get office wallet balance', {
      officeId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      totalAvailable: 0,
      totalInPayout: 0,
      totalPaidOut: 0,
      artistBreakdown: []
    };
  }
}

function canPayout(officeBalance: any): boolean {
  return officeBalance.totalAvailable >= 300 && officeBalance.artistBreakdown.length > 0;
}

function payoutError(officeBalance: any) {
  if (officeBalance.totalAvailable < 300) {
    return { success: false, error: 'Total payout amount must be at least $3.00' };
  }
  if (officeBalance.artistBreakdown.length === 0) {
    return { success: false, error: 'No artists with positive balance found' };
  }
  return { success: false, error: 'Unknown payout error' };
}

export function calculatePayoutDetails(officeBalance: any) {
  const totalAmount = officeBalance.totalAvailable;
  const artistsWithMoney = officeBalance.artistBreakdown.filter(artist => artist.availableAmount > 0);
  const numArtistsWithMoney = artistsWithMoney.length;

  let transferAmount = 0;

  for (let i = 0; i < officeBalance.artistBreakdown.length; i++) {
    const artist = officeBalance.artistBreakdown[i];

    if (artist.availableAmount > 0) {
      transferAmount += artist.availableAmount;
    } else {
      transferAmount += 0;
    }
  }

  return {
    totalAmount,
    transferAmount,
    artists: officeBalance.artistBreakdown,
    numArtists: officeBalance.artistBreakdown.length,
    numArtistsWithMoney
  };
}

async function createAllArtistTransactions({
  artists,
  officeId,
  payoutReference
}: {
  artists: any[];
  officeId: string;
  payoutReference: string;
}) {
  const breakdown = [];

  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i];

    if (artist.availableAmount > 0) {
      const netPayout = artist.availableAmount;
      const { transactionIds } = await createArtistPayoutAndFeeTransactions({
        artist,
        netPayout,
        transferId: null,
        officeId,
        payoutReference
      });
      breakdown.push({
        artistId: artist.artistId,
        artistName: artist.artistName,
        amount: netPayout,
        transactionIds
      });
    } else {
      breakdown.push({
        artistId: artist.artistId,
        artistName: artist.artistName,
        amount: 0,
        transactionIds: []
      });
    }
  }
  return breakdown;
}

async function createArtistPayoutAndFeeTransactions({
  artist,
  netPayout,
  transferId,
  officeId,
  payoutReference
}: {
  artist: { artistId: string; artistName: string; availableAmount: number; transactionCount: number };
  netPayout: number;
  transferId: string | null;
  officeId: string;
  payoutReference: string;
}) {
  const payoutTx = await createArtistPayoutTransaction(
    artist.artistId,
    netPayout,
    payoutReference,
    {
      artist_name: artist.artistName,
      total_transactions_processed: artist.transactionCount,
      gross_amount: artist.availableAmount,
      net_amount: netPayout,
      fee_amount: 0
    }
  );

  const transactionIds = [payoutTx._id.toString()];

  return {
    transactionIds,
    netPayout
  };
}

async function createStripeTransfer({
  amount,
  stripeConnectAccountId,
  totalAmount,
  numArtists,
  payoutReference
}: {
  amount: number;
  stripeConnectAccountId: string;
  totalAmount: number;
  numArtists: number;
  payoutReference: string;
}) {
  const transfer = await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination: stripeConnectAccountId,
    description: `Office payout: $${(totalAmount / 100).toFixed(2)}`,
    metadata: {
      office_id: stripeConnectAccountId,
      total_amount: totalAmount.toString(),
      artists_count: numArtists.toString(),
      payout_reference: payoutReference
    }
  });
  return transfer.id;
}

async function createOfficePayoutRecord({
  officeId,
  stripeConnectAccountId,
  transferId,
  totalAmount,
  transferAmount,
  artistBreakdown,
  stripeMetadata,
  payoutReference
}: {
  officeId: string;
  stripeConnectAccountId: string;
  transferId: string;
  totalAmount: number;
  transferAmount: number;
  artistBreakdown: any[];
  stripeMetadata: any;
  payoutReference: string;
}) {
  return OfficePayout.create({
    officeId,
    stripeConnectAccountId,
    transferId,
    status: 'pending',
    totalAmount,
    transferAmount,
    feeAmount: 0,
    transferCreatedAt: new Date(),
    artistBreakdown,
    stripeMetadata,
    payoutReference
  });
}

function buildPayoutResult({
  success,
  transferId,
  transferAmount,
  artists,
  totalAmount
}: {
  success: boolean;
  transferId: string;
  transferAmount: number;
  artists: any[];
  totalAmount: number;
}) {
  return {
    success,
    transferId,
    transferAmount,
    feeDeducted: 0,
    totalTransactionsProcessed: artists.reduce((sum, a) => sum + a.transactionCount, 0),
    artistBreakdown: artists.map(a => ({
      artistId: a.artistId,
      artistName: a.artistName,
      amount: a.availableAmount,
      transactionCount: a.transactionCount
    })),
    message: `✅ Payout request sent!`
  };
}

export async function processOfficeWalletPayout(
  officeId: string,
  stripeConnectAccountId: string
): Promise<{
  success: boolean;
  transferId?: string;
  transferAmount?: number;
  feeDeducted?: number;
  totalTransactionsProcessed?: number;
  artistBreakdown?: Array<{
    artistId: string;
    artistName: string;
    amount: number;
    transactionCount: number;
  }>;
  error?: string;
  message?: string;
}> {
  try {
    const officeBalance = await getOfficeWalletBalance(officeId);
    if (!canPayout(officeBalance)) return payoutError(officeBalance);

    const payoutDetails = calculatePayoutDetails(officeBalance);
    const payoutReference = uuidv4();
    let transferId: string | null = null;
    let artistBreakdown: any[] = [];

    artistBreakdown = await createAllArtistTransactions({
      artists: payoutDetails.artists,
      officeId,
      payoutReference
    });
    transferId = await createStripeTransfer({
      amount: payoutDetails.transferAmount,
      stripeConnectAccountId,
      totalAmount: payoutDetails.totalAmount,
      numArtists: payoutDetails.numArtistsWithMoney,
      payoutReference
    });
    await createOfficePayoutRecord({
      officeId,
      stripeConnectAccountId,
      transferId,
      totalAmount: payoutDetails.totalAmount,
      transferAmount: payoutDetails.transferAmount,
      artistBreakdown,
      stripeMetadata: {},
      payoutReference
    });

    return buildPayoutResult({
      success: true,
      transferId: transferId!,
      transferAmount: payoutDetails.transferAmount,
      artists: payoutDetails.artists,
      totalAmount: payoutDetails.totalAmount
    });
  } catch (error) {
    logger.error('Failed to process office wallet payout', {
      officeId,
      stripeConnectAccountId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getOfficeWalletTransactions(
  officeId: string,
  limit = 20,
  page = 1,
  filterType?: 'money_in' | 'money_out'
): Promise<{
  data: Array<{
    transaction_id: string;
    artist_id: string;
    artist_name: string;
    artist_image: string;
    amount: number;
    user_id?: string;
    created_at: Date;
    transaction_type: string;
    source: string;
    payout_id?: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}> {
  try {
    logger.info('getOfficeWalletTransactions called', { officeId, limit, page, filterType });

    const claims = await Claim.find({
      office_id: officeId,
      status: 'Successful'
    });

    logger.info('Found claims for office', { officeId, claimCount: claims.length });

    if (claims.length === 0) {
      logger.info('No claims found for office', { officeId });
      return {
        data: [],
        total: 0,
        page,
        limit,
        total_pages: 0,
        has_next_page: false,
        has_previous_page: false
      };
    }

    const artistIds = claims.map((claim) => claim.artist_id);
    logger.info('Artist IDs from claims', { artistIds });

    const query: Record<string, unknown> = {
      artistId: { $in: artistIds }
    };
    if (filterType) {
      query.transaction_type = filterType;
    }

    logger.info('Query for transactions', { query });

    const totalCount = await ArtistWalletTransaction.countDocuments(query);
    logger.info('Total transaction count', { totalCount });

    const transactions = await ArtistWalletTransaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    logger.info('Found transactions', { transactionCount: transactions.length });

    const uniqueArtistIds = [...new Set(transactions.map(t => t.artistId))];
    logger.info('Unique artist IDs from transactions', { uniqueArtistIds });

    const artists = await Artist.find({ _id: { $in: uniqueArtistIds } });
    logger.info('Found artists', { artistCount: artists.length, artistIds: artists.map(a => a._id) });

    const artistMap = new Map(artists.map(a => [a._id.toString(), a]));

    const formattedTransactions = transactions.map((transaction) => {
      const artist = artistMap.get(transaction.artistId);
      logger.info('Processing transaction', {
        transactionId: transaction._id,
        artistId: transaction.artistId,
        artistFound: !!artist,
        artistName: artist?.name || 'Unknown'
      });
      return {
        transaction_id: transaction._id.toString(),
        artist_id: transaction.artistId,
        artist_name: transaction.metadata?.artist_name || artist?.name || 'Unknown Artist',
        artist_image: artist?.image || '',
        amount: Math.abs(transaction.amount),
        user_id: transaction.fan_user_id,
        created_at: transaction.date,
        transaction_type: transaction.transaction_type === 'money_in' ? 'credit' : 'payout',
        source: transaction.source,
        payout_id: transaction.transfer_id
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    logger.info('Returning formatted transactions', {
      formattedCount: formattedTransactions.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });

    return {
      data: formattedTransactions,
      total: totalCount,
      page,
      limit,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_previous_page: page > 1
    };
  } catch (error) {
    logger.error('Failed to get office wallet transactions', {
      officeId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      data: [],
      total: 0,
      page,
      limit,
      total_pages: 0,
      has_next_page: false,
      has_previous_page: false
    };
  }
}




