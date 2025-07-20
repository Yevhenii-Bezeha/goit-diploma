import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../api/api.ts';
import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { AxiosRequestConfig } from 'axios';
import { User } from './userArtistApi.ts';

interface LoginResponse {
  token: string;
  user: User;
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

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery() as AxiosBaseQueryType,
  endpoints: (build) => ({
    completeGoogleRegistration: build.mutation<LoginResponse, any>({
      query: (data) => ({
        url: `${domainUrl}/auth/complete-registration`,
        method: 'POST',
        data,
        withCredentials: true,
      }),
    }),
  }),
});

export const {
  useCompleteGoogleRegistrationMutation,
} = authApi;
