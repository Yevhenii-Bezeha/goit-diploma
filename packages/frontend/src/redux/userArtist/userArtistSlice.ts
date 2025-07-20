import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Office } from './userArtistApi';
import { userArtistApi } from './userArtistApi';
import { RootState } from '../../store';

interface UserArtistState {
  selectedOffice: Office | null;
}

const initialState: UserArtistState = {
  selectedOffice: null,
};

export const userArtistSlice = createSlice({
  name: 'userArtist',
  initialState,
  reducers: {
    setSelectedOffice: (state, action: PayloadAction<Office | null>) => {
      state.selectedOffice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
  },
});

export const { setSelectedOffice } = userArtistSlice.actions;

export const isUserOfficeAdminSelector = (state: RootState): boolean => {
  const { selectedOffice } = state.userArtist;
  const userData = userArtistApi.endpoints.getUserArtist.select()(state).data;

  if (!userData || !selectedOffice) return false;

  const member = selectedOffice.members.find((member: { user_id: string }) => member.user_id === userData._id);

  return member?.role === 'admin';
};

export const isUserProfileCompleteSelector = (state: RootState): boolean => {
  const userData = userArtistApi.endpoints.getUserArtist.select()(state).data;

  if (!userData) return false;

  return Boolean(userData.first_name && userData.last_name && userData.phone_number && userData.country);
};

export default userArtistSlice.reducer;
