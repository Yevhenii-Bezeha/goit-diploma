import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../api/api.ts';
import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { AxiosRequestConfig } from 'axios';

// Helper function to generate random verification string
export const generateVerificationString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'mypie_';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Types
export interface User {
  _id: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  user_name: string;
  phone_number: string;
  country: string;
  type: string;
  role: string;
  label_name?: string;
  office?: string;
  accepted_terms_and_conditions: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  stripe_connect_account_id?: string;
  stripe_connect_account_status?: string;
  image_url?: string;
}

export interface Office {
  _id: string;
  name: string;
  type: string;
  members: {
    user_id: string;
    role: 'admin' | 'member';
    added_at: string;
    _id: string;
  }[];
  created_by: string;
  createdAt: string;
  updatedAt: string;
  stripe_connect_account_id?: string;
  stripe_connect_account_status?: string;
}

export interface ArtistSearchResult {
  _id: string;
  image: string;
  name: string;
  popularity: number;
  is_claimed?: boolean;
  amount?: number;
  social_networks: string[];
  external_url?: string;
}

export interface ArtistClaim {
  claim: {
    id: string;
    status: 'Pending' | 'Successful' | 'Deleted';
    created_at: string;
  };
  artist: {
    id: string;
    name: string;
    image: string;
    external_url: string;
  };
  wallet: {
    total_earned: number;
    available_to_payout: number;
    total_paid_out: number;
    // in_payout: number; // Added to match backend and fix linter error
  };
  office?: {
    id: string;
    name: string;
  };
}

export interface StripeBalance {
  amount: number;
  source_types: {
    card: number;
  };
}

interface Transaction {
  transaction_id: string;
  artist_id: string;
  artist_name: string;
  artist_image: string;
  amount: number;
  user_id?: string;
  created_at: string;
  available_at: string;
  status: string;
  transaction_type: 'credit' | 'payout' | 'debit';
  payout_id: string | null;
}

interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

interface Payout {
  id: string;
  amount: number;
  arrival_date: number;
  created: number;
  description: string;
  status: string;
}


interface PayoutsResponse {
  object: string;
  url: string;
  has_more: boolean;
  data: Payout[];
}

// ClaimTransaction interface - represents artist wallet transactions
// that have been processed into transfers for a specific claim
interface ClaimTransaction {
  transaction_id: string; // Maps to ArtistWalletTransaction._id
  artist_id: string;
  artist_name: string;
  artist_image: string;
  amount: number;
  user_id: string; // Fan user who made the payment
  created_at: string;
  available_at: string;
  status: string; // Maps to ArtistWalletTransaction.status
  payout_id: string | null;
  fan_customer_id: string;
  fan_user_id: string;
  pie_id: string;
  charge_id: string;
  transfer_id?: string;
}


interface ClaimPayout {
  payout_id: string;
  amount: number;
  created_at: string;
  arrival_date: string;
  status: string;
  description: string;
  method: string;
  type: string;
  transfer_count: number;
  total_transfer_amount: number;
  transfer_ids: string[];
  fee_amount?: number;
  net_amount?: number;
  has_platform_fee?: boolean;
  fee_details?: {
    type: string;
    description: string;
  };
}


interface WalletBalance {
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
  feeAlreadyPaidThisMonth: boolean;
}

type AxiosBaseQueryType = BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
    withCredentials?: boolean;
  },
  unknown,
  unknown
>;

const domainUrl =
  process.env.NODE_ENV === 'production' ? 'https://mypie.app/api/for-artists' : 'http://localhost:3000/api/for-artists';

export const userArtistApi = createApi({
  reducerPath: 'userArtistApi',
  baseQuery: axiosBaseQuery() as AxiosBaseQueryType,
  tagTypes: ['Claims', 'Balance', 'Payouts', 'Transactions', 'ClaimPayouts', 'UserArtist', 'Office', 'Claim', 'Artist'],
  endpoints: (build) => ({
    createStripeLoginLink: build.query<{ url: string }, { officeId: string }>({
      query: (params) => ({
        url: `${domainUrl}/stripe/createLoginLink`,
        method: 'GET',
        params,
        withCredentials: true,
      }),
      transformResponse: (response: { success: boolean; data: { login_url: string } }) => ({
        url: response.data.login_url,
      }),
    }),

    createStripeOnboardingLink: build.mutation<{ url: string }, { officeId: string; country?: string }>({
      query: (data) => ({
        url: `${domainUrl}/stripe/completeOnboarding`,
        method: 'POST',
        data,
        withCredentials: true,
      }),
      transformResponse: (response: any) => ({
        url: response.data.accountLink.url,
      }),
    }),
    getUserArtist: build.query<User, void>({
      query: () => ({
        url: `${domainUrl}/user`,
        method: 'GET',
        withCredentials: true,
      }),
      transformResponse: (response: { data: User }) => response.data,
      providesTags: ['UserArtist'],
    }),
    deleteClaim: build.mutation<void, string>({
      query: (claimId) => ({
        url: `${domainUrl}/claims/${claimId}`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['Claims'],
    }),
    getClaims: build.query<ArtistClaim[], { officeId?: string }>({
      query: (params) => ({
        url: `${domainUrl}/claims`,
        method: 'GET',
        params,
        withCredentials: true,
      }),
      transformResponse: (response: { data: ArtistClaim[] }) => response.data,
      providesTags: ['Claims'],
    }),
    searchArtists: build.query<
      {
        data: ArtistSearchResult[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      },
      { searchTerm: string; page: number }
    >({
      query: ({ searchTerm, page = 1 }) => ({
        url: `${domainUrl}/search`,
        method: 'GET',
        params: { search_term: searchTerm, page, limit: 6 },
        withCredentials: true,
      }),
      transformResponse: (response: {
        success: boolean;
        data: ArtistSearchResult[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
    }),
    createClaim: build.mutation<{ success: boolean; data: { _id: string;[key: string]: any } }, any>({
      query: (data) => ({
        url: `${domainUrl}/claims`,
        method: 'POST',
        data,
        withCredentials: true,
      }),
      invalidatesTags: ['Claims'],
    }),
    verifyBio: build.mutation<{ success: boolean; message: string }, { claimId: string; spotifyArtistUrl: string; mypieLink: string }>({
      query: ({ claimId, spotifyArtistUrl, mypieLink }) => ({
        url: `${domainUrl}/claims/${claimId}/verify-bio`,
        method: 'POST',
        data: { spotifyArtistUrl, mypieLink },
        withCredentials: true,
      }),
      invalidatesTags: ['Claims'],
    }),
    getPayouts: build.query<PayoutsResponse, { officeId: string; starting_after?: string }>({
      query: (params) => ({
        url: `${domainUrl}/stripe/payouts`,
        method: 'GET',
        params,
        withCredentials: true,
      }),
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      providesTags: ['Payouts'],
    }),
    createPayout: build.mutation<
      {
        success: boolean;
        transferId: string;
        payoutId?: string;
        transferAmount: number;
        payoutAmount?: number;
        feeDeducted: number;
        totalTransactionsProcessed: number;
        artistBreakdown: Array<{
          artistId: string;
          artistName: string;
          amount: number;
          transactionCount: number;
        }>;
        error?: string;
        message?: string;
      },
      {
        officeId: string;
      }
    >({
      query: ({ officeId }) => ({
        url: `${domainUrl}/stripe/create-payout`,
        method: 'POST',
        data: { officeId },
        withCredentials: true,
      }),
      transformResponse: (response: {
        success: boolean;
        data: {
          transferId: string;
          payoutId?: string;
          transferAmount: number;
          payoutAmount?: number;
          feeDeducted: number;
          totalTransactionsProcessed: number;
          artistBreakdown: Array<{
            artistId: string;
            artistName: string;
            amount: number;
            transactionCount: number;
          }>;
          error?: string;
          message?: string;
        };
      }) => ({
        success: response.success,
        ...response.data,
      }),
      invalidatesTags: (result, error, { officeId }) => [
        'Balance',
        'Payouts',
        { type: 'Transactions', id: `${officeId}-all` },
        { type: 'Transactions', id: `${officeId}-credit` },
        { type: 'Transactions', id: `${officeId}-payout` },
        'ClaimPayouts'
      ],
    }),


    getWalletBalance: build.query<WalletBalance, { officeId: string }>({
      query: (params) => ({
        url: `${domainUrl}/stripe/wallet-balance`,
        method: 'GET',
        params,
        withCredentials: true,
      }),
      transformResponse: (response: { data: WalletBalance }) => response.data,
      providesTags: ['Balance'],
    }),
    getTransactions: build.query<
      TransactionsResponse,
      { officeId: string; page: number; filter?: 'credit' | 'payout' }
    >({
      query: (params) => ({
        url: `${domainUrl}/stripe/transactions`,
        method: 'GET',
        params,
        withCredentials: true,
      }),
      transformResponse: (response: { success: boolean; data: TransactionsResponse }) => response.data,
      providesTags: (result, error, { officeId, filter }) => [
        { type: 'Transactions', id: `${officeId}-${filter || 'all'}` },
        { type: 'Transactions', id: 'LIST' }
      ],
    }),


    getOffices: build.query<Office[], void>({
      query: () => ({
        url: `${domainUrl}/offices`,
        method: 'GET',
        withCredentials: true,
      }),
      transformResponse: (response: { success: boolean; data: Office[] }) => response.data,
      providesTags: ['UserArtist'],
    }),
    createOffice: build.mutation<Office, { name: string }>({
      query: (data) => ({
        url: `${domainUrl}/offices`,
        method: 'POST',
        data,
        withCredentials: true,
      }),
      transformResponse: (response: { success: boolean; data: Office }) => response.data,
      invalidatesTags: ['UserArtist'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate the offices query to refetch the list after creating a new office
          dispatch(userArtistApi.util.invalidateTags(['UserArtist']));
        } catch (err) {
          console.error('Failed to create office:', err);
        }
      },
    }),


  }),
});

export const {
  useCreateStripeLoginLinkQuery,
  useGetUserArtistQuery,
  useSearchArtistsQuery,
  useGetClaimsQuery,
  useDeleteClaimMutation,
  useCreateStripeOnboardingLinkMutation,
  useCreateClaimMutation,
  useVerifyBioMutation,
  useGetWalletBalanceQuery,
  useCreatePayoutMutation,
  useGetTransactionsQuery,
  useGetPayoutsQuery,
  useGetOfficesQuery,
  useCreateOfficeMutation,
} = userArtistApi;
