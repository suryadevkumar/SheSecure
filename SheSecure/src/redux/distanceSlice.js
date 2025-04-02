import { createSlice } from '@reduxjs/toolkit';

const distanceSlice = createSlice({
  name: 'location',
  initialState: {
    pathDistance: null
  },
  reducers: {
    setPathDistance: (state, action) => {
      state.pathDistance = action.payload.pathDistance;
    }
  },
});

export const { setPathDistance } = distanceSlice.actions;
export default distanceSlice.reducer;