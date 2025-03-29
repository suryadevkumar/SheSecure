import { createSlice } from '@reduxjs/toolkit';

const policeSlice = createSlice({
  name: 'police',
  initialState: {
    policeStations: [],
  },
  reducers: {
    setPoliceStations: (state, action) => {
      state.policeStations = action.payload;
    },
  },
});

export const { setPoliceStations } = policeSlice.actions;
export default policeSlice.reducer;