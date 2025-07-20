import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../api/api.ts';

type UserType = {
  data: {
    _id: string;
    email: string;
    first_name: string;
    last_name: string;
    user_name: string;
    accepted_terms_and_conditions: boolean;
    stripe_customer_id: string;
    stripe_account_url: string;
    email_verified: boolean;
    auth_type: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    access_token?: string;
    spotify_email?: string;
    spotify_id?: string;
    spotify_user_name?: string;
    image_url?: string;
    is_public?: boolean;
    wallet?: number;
    last_successful_fetch_date?: string | null;
    linked_accounts?: Array<{
      provider: string;
      provider_id: string;
      provider_email?: string;
      provider_name?: string;
      access_token?: string;
      refresh_token?: string;
      connected_at: string;
    }>;
  };
};

const domainUrl = process.env.NODE_ENV === 'production' ? 'https://mypie.app/api' : 'http://localhost:3000/api';

export const userApi = createApi({
  reducerPath: 'user',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User'],
  endpoints: (build) => ({
    getUser: build.query<UserType, void>({
      query: () => ({
        url: `${domainUrl}/user`,
        withCredentials: true,
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserQuery,
} = userApi;
