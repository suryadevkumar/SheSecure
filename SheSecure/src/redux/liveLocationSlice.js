import { createSlice } from '@reduxjs/toolkit';

const liveLocationSlice = createSlice({
    name: 'liveLocation',
    initialState: {
        isLocationShared: false,
    },
    reducers: {
        startShareLocation: (state) => {
            state.isLocationShared = true;
        },
        stopShareLocation: (state) => {
            state.isLocationShared = false;
        },
    },
});

export const { startShareLocation, stopShareLocation } = liveLocationSlice.actions;
export default liveLocationSlice.reducer;
