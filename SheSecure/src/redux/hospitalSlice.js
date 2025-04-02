import { createSlice } from '@reduxjs/toolkit';

const hospitalSlice = createSlice({
  name: 'hospital',
  initialState: { hospitals: [] },
  reducers: {
    setHospitals: (state, action) => {
      state.hospitals = action.payload;
    },
  },
});

export const { setHospitals } = hospitalSlice.actions;
export default hospitalSlice.reducer;


// {place.distance.toFixed(2)}
