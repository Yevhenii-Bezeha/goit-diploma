import Fund from '../../assets/icons/funds.svg';
import { useState } from 'react';
import { Pagination } from '../../components/shared/Pagination/Pagination';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { isUserOfficeAdminSelector } from '../../redux/userArtist/userArtistSlice';
import PayoutModal from '../../components/userArtist/ArtistFund/PayoutModal';

import {
  useGetWalletBalanceQuery,
  useGetUserArtistQuery,
  useGetTransactionsQuery,
  useGetPayoutsQuery,
  useCreateStripeOnboardingLinkMutation,
} from '../../redux/userArtist';

interface OfficeWithStripe {
  _id: string;
  name: string;
  stripe_connect_account_id?: string;
  stripe_connect_account_status?: string;
  members: {
    user_id: string;
    role: 'admin' | 'member';
    added_at: string;
    _id: string;
  }[];
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

const formatUSD = (amount: number) => `$${(amount / 100).toFixed(2)}`;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ArtistFundPage = () => {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [allTransactionsPage, setAllTransactionsPage] = useState(1);
  const [isStripeSetupLoading, setIsStripeSetupLoading] = useState(false);

  const { isLoading: userLoading } = useGetUserArtistQuery();
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice) as OfficeWithStripe | null;
  const officeId = selectedOffice?._id || '';
  const isAdmin = useSelector(isUserOfficeAdminSelector);

  const isStripeSetupComplete = selectedOffice?.stripe_connect_account_status === 'complete';

  const { data: walletBalance, isLoading: balanceLoading } = useGetWalletBalanceQuery(
    { officeId },
    {
      skip: !officeId,
    }
  );

  const { data: allTransactions, isLoading: allTransactionsLoading } = useGetTransactionsQuery(
    {
      officeId,
      page: allTransactionsPage,
    },
    {
      skip: !officeId,
    }
  );

  const { data: payoutsData, isLoading: payoutsLoading } = useGetPayoutsQuery(
    {
      officeId,
    },
    {
      skip: !officeId,
    }
  );

  const [createStripeOnboardingLink] = useCreateStripeOnboardingLinkMutation();

  const handleStripeSetup = async () => {
    if (!officeId) return;

    try {
      setIsStripeSetupLoading(true);
      const response = await createStripeOnboardingLink({ officeId }).unwrap();
      if (response?.url) {
        window.open(response.url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to create Stripe onboarding link:', error);
    } finally {
      setIsStripeSetupLoading(false);
    }
  };

  if (!selectedOffice) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-xl text-violet-500 mb-4">No Office Selected</div>
          <p className="text-white mb-4">Please select an office from the sidebar to view funds.</p>
        </div>
      </div>
    );
  }

  const isLoading = userLoading || balanceLoading;

  const availableAmount = walletBalance?.totalAvailable ?? 0;
  const totalPaidOut = walletBalance?.totalPaidOut ?? 0;



  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Loading funds...</div>
      </div>
    );
  }

  const StripeSetupStatus = () => {
    if (!selectedOffice?.stripe_connect_account_id) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="bg-[#1F1B29] p-8 rounded-xl max-w-md w-full text-center shadow-lg border border-violet-800/30">
            <p className="text-lg mb-2">Stripe Account Required</p>
            <p className="text-gray-400 mb-4">
              You need to set up a Stripe account to receive payments.
            </p>
            {isAdmin ? (
              <button
                onClick={handleStripeSetup}
                disabled={isStripeSetupLoading}
                className="bg-violet-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-600 disabled:opacity-50 flex items-center justify-center mx-auto"
              >
                {isStripeSetupLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Setting up Stripe...
                  </>
                ) : (
                  'Set up Stripe Account'
                )}
              </button>
            ) : (
              <p className="text-yellow-500">Please ask an admin to set up the Stripe account.</p>
            )}
          </div>
        </div>
      );
    }

    if (selectedOffice?.stripe_connect_account_status !== 'complete') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="bg-[#1F1B29] p-8 rounded-xl max-w-md w-full text-center shadow-lg border border-violet-800/30">
            <p className="text-lg mb-2">Stripe Setup Incomplete</p>
            <p className="text-gray-400 mb-4">
              Your Stripe account setup needs to be completed.
            </p>
            {isAdmin ? (
              <button
                onClick={handleStripeSetup}
                disabled={isStripeSetupLoading}
                className="bg-violet-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-600 disabled:opacity-50 flex items-center justify-center mx-auto"
              >
                {isStripeSetupLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  'Complete Stripe Setup'
                )}
              </button>
            ) : (
              <p className="text-yellow-500">Please ask an admin to complete the Stripe setup.</p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isStripeSetupComplete) {
    return <StripeSetupStatus />;
  }

  const PayoutsTable = ({ payouts, loading }: any) => (
    <div className="space-y-2">
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
      ) : payouts?.data?.length ? (
        payouts.data.map((payout: any) => (
          <div
            key={payout.id}
            className="bg-[#120E16] rounded-lg p-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                  <Fund className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="text-white font-medium font-mono">
                    {payout.id.substring(0, 8)}...
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(new Date(payout.created * 1000).toISOString())}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-500">
                  {formatUSD(payout.amount)}
                </div>
                <div className={`text-sm ${payout.status === 'paid'
                  ? 'text-green-500'
                  : payout.status === 'failed'
                    ? 'text-red-500'
                    : 'text-yellow-500'
                  }`}>
                  {payout.status === 'paid'
                    ? 'Paid Out'
                    : payout.status === 'failed'
                      ? 'Failed'
                      : 'In Progress'}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          <div className="text-sm mb-2">No payouts found</div>
          <div className="text-xs text-gray-500">
            Payouts will appear here when you make payouts
          </div>
        </div>
      )}
    </div>
  );

  const TransactionTable = ({ transactions, loading, onPageChange, currentPage }: any) => (
    <div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : transactions?.data?.length ? (
          transactions.data.map((transaction: any) => {
            const isCredit = transaction.transaction_type === 'credit';

            let transactionLabel = 'Earnings';
            if (transaction.transaction_type === 'payout') {
              if (transaction.source === 'artist_payout') {
                transactionLabel = 'Payout';
              }
            } else if (transaction.transaction_type === 'credit') {
              transactionLabel = 'Earnings';
            }

            return (
              <div
                key={transaction.transaction_id}
                className="bg-[#120E16] rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {transaction.artist_image ? (
                      <img
                        src={transaction.artist_image}
                        alt={transaction.artist_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-white text-sm">?</span>
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">{transaction.artist_name}</div>
                      <div className="text-gray-400 text-sm">{formatDate(transaction.created_at)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                      {isCredit ? '+' : '-'}{formatUSD(transaction.amount)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {transactionLabel}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-sm mb-2">No transactions found</div>
            <div className="text-xs text-gray-500">
              Transactions will appear here when fans support your artists
            </div>
          </div>
        )}
      </div>

      {transactions?.data?.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalCount={transactions?.total_pages ?? 1}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );

  const allTransactionsContent = (
    <TransactionTable
      transactions={allTransactions}
      loading={allTransactionsLoading}
      onPageChange={setAllTransactionsPage}
      currentPage={allTransactionsPage}
    />
  );

  const payoutsContent = (
    <PayoutsTable
      payouts={payoutsData}
      loading={payoutsLoading}
    />
  );

  const tabs = ['All Transactions', 'Payouts'];
  const tabContent = [allTransactionsContent, payoutsContent];

  return (
    <div className="flex flex-col items-left w-full h-full">
      <div className="w-full">
        <div className="px-4 pt-0 pb-4 w-full mt-4">

          <div className="bg-[#1A1520] rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-green-500">{formatUSD(availableAmount)}</div>
                <div className="text-gray-400 text-sm">Available</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-semibold text-blue-400">{formatUSD(totalPaidOut)}</div>
                <div className="text-gray-400 text-sm">Total Paid</div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  disabled={availableAmount <= 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Payout
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#1A1520] rounded-lg p-4">
            <div className="flex gap-1 mb-4 bg-[#120E16] rounded-lg p-1">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(index)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === index
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {tabContent[activeTab]}
          </div>

          <PayoutModal
            isOpen={isPayoutModalOpen}
            onClose={() => setIsPayoutModalOpen(false)}
            maxAmount={availableAmount}
            officeId={officeId}
            artistBreakdown={walletBalance?.artistBreakdown || []}
          />
        </div>
      </div>
    </div>
  );
};

export default ArtistFundPage;
