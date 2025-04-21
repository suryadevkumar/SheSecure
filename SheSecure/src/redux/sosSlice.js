import { createSlice } from '@reduxjs/toolkit';

const sosSlice = createSlice({
    name: 'sos',
    initialState: {
        isSOSActive: false,
    },
    reducers: {
        startSOSAction: (state) => {
            state.isSOSActive = true;
        },
        stopSOSAction: (state) => {
            state.isSOSActive = false;
        },
    },
});

export const { startSOSAction, stopSOSAction } = sosSlice.actions;
export default sosSlice.reducer;
