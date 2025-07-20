import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../api/api.ts';

export interface Track {
  _id: string;
  image: string;
  artists: { name: string; _id: string }[];
  artist_count: number;
  duration: number;
  name: string;
  user_id: string;
  played_at?: string;
  popularity: number;
  external_url: string;
  pie_id: string | null;
  __v: number;
  createdAt: string;
  updatedAt: string;
  count?: number;
  album_name: string;
}

const domainUrl = process.env.NODE_ENV === 'production' ? 'https://mypie.app/api' : 'http://localhost:3000/api';

export const artistsApi = createApi({
  reducerPath: 'artists',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['UserLatestTracks', 'UserArtists'],
  endpoints: (build) => ({
    getUserLatestTracks: build.query<{ data: Track[]; currentPage: number; totalCount: number }, { page: number }>({
      query: ({ page = 1 }) => ({
        url: `${domainUrl}/tracks/user/latest?page=${page}`,
        withCredentials: true,
      }),
      providesTags: ['UserLatestTracks'],
    }),


  }),
});

export const {
  useGetUserLatestTracksQuery,
} = artistsApi;
