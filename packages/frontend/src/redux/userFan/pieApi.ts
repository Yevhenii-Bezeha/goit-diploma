import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../api/api.ts';

type PieArtistsResponse = {
  includedArtists: ArtistPieData[];
  excludedArtists: ArtistPieData[];
  allArtists: ArtistPieData[];
};

export type ArtistPieData = {
  artist_external_url: string;
  artist_id: string;
  artist_image: string;
  artist_name: string;
  percentage?: string;
  pie_artist_id: string;
  total_time_listened: number;
  money?: string;
  money_after_fees?: string;
  is_claimed?: boolean;
  reasons?: string[];
  total_tracks_listened: string;
  is_banned?: boolean;
  manual_inclusion_status?: string;
  weight?: number;
  popularity?: number;
};

export interface PieData {
  is_recurring: boolean;
  id: string;
  amount: number;
  is_paid: boolean;
  start_date: string;
  end_date: string;
  count_tracks: number;
  count_artists: number;
  total_time_listened_artists: number;
  artistLimit: number;
  artistPopularity: number | null;
  excludeNonActive: boolean;
}

const domainUrl = process.env.NODE_ENV === 'production' ? 'https://mypie.app/api' : 'http://localhost:3000/api';

export const pieApi = createApi({
  reducerPath: 'pie',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['PieActive', 'PieArtists', 'FanWallet'],
  endpoints: (build) => ({
    getPieActive: build.query<{ data: PieData }, string | undefined>({
      query: (pieId) => ({
        url: pieId ? `${domainUrl}/pie/active/${pieId}` : `${domainUrl}/pie/active`,
        withCredentials: true,
      }),
      providesTags: ['PieActive'],
    }),
    getPieArtists: build.query<
      { data: PieArtistsResponse },
      { limit: number | undefined; pieId: string; artistPopularity: number | undefined; excludeNonActive: boolean }
    >({
      query: ({ limit, pieId, artistPopularity, excludeNonActive }) => ({
        url: `${domainUrl}/pie/${pieId}/realtime-stats?limit=${limit}&artistPopularity=${artistPopularity}&excludeNonActive=${excludeNonActive}`,
        withCredentials: true,
      }),
      providesTags: ['PieArtists'],
    }),
    createCheckoutSession: build.mutation<
      { data: any },
      {
        amount: number;
        artistLimit: number;
        artistPopularity: number | null;
        excludeNonActive: boolean;
        pieDays?: number;
      }
    >({
      query: ({ amount, artistLimit, artistPopularity, excludeNonActive, pieDays }) => ({
        url: `${domainUrl}/stripe/createCheckout`,
        method: 'POST',
        data: { amount, artistLimit, artistPopularity, excludeNonActive, pieDays },
        withCredentials: true,
      }),
    }),

    banArtist: build.mutation<{ data: any }, { artistId: string; banned: boolean }>({
      query: ({ artistId, banned }) => ({
        url: `${domainUrl}/pie/artist/${artistId}/ban`,
        method: 'PATCH',
        data: { value: banned },
        withCredentials: true,
      }),
      invalidatesTags: ['PieArtists'],
    }),
    setArtistInclusion: build.mutation<{ data: any }, { pieArtistId: string; included: boolean }>({
      query: ({ pieArtistId, included }) => ({
        url: `${domainUrl}/pie/artist/${pieArtistId}/set-inclusion`,
        method: 'PATCH',
        data: { value: included },
        withCredentials: true,
      }),
      invalidatesTags: ['PieArtists'],
    }),
    addMissingTracksAnytime: build.mutation<{ data: any }, void>({
      query: () => ({
        url: `${domainUrl}/pie/add-missing-tracks-anytime`,
        method: 'POST',
        withCredentials: true,
      }),
      invalidatesTags: ['PieActive', 'PieArtists'],
    }),
  }),
});

export const {
  useGetPieArtistsQuery,
  useGetPieActiveQuery,
  useCreateCheckoutSessionMutation,
  useBanArtistMutation,
  useSetArtistInclusionMutation,
  useAddMissingTracksAnytimeMutation,
} = pieApi;
