import { createSlice } from '@reduxjs/toolkit';

const crimeSlice = createSlice({
  name: 'crime',
  initialState: {
    crimeReports: [],
  },
  reducers: {
    setCrimeReports: (state, action) => {
      state.crimeReports = action.payload;
    },
  },
});

export const { setCrimeReports } = crimeSlice.actions;
export default crimeSlice.reducer;