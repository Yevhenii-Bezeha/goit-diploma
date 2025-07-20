import { configureStore } from '@reduxjs/toolkit';
import { artistsApi, userApi, pieApi } from '../redux/userFan';
import { authApi, userArtistApi } from '../redux/userArtist';
import userArtistReducer from '../redux/userArtist/userArtistSlice';

export const store = configureStore({
  reducer: {
    [artistsApi.reducerPath]: artistsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [pieApi.reducerPath]: pieApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userArtistApi.reducerPath]: userArtistApi.reducer,
    userArtist: userArtistReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(artistsApi.middleware)
      .concat(userApi.middleware)
      .concat(pieApi.middleware)
      .concat(authApi.middleware)
      .concat(userArtistApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
