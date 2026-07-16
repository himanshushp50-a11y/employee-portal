import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  mobileNavOpen: boolean;
}

const initialState: AppState = {
  mobileNavOpen: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileNavOpen = action.payload;
    },
  },
});

export const { setMobileNavOpen } = appSlice.actions;
export default appSlice.reducer;
