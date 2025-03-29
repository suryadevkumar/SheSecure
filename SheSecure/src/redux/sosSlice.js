import { createSlice } from '@reduxjs/toolkit';

const sosSlice = createSlice({
    name: 'sos',
    initialState: {
        reportId: null,
        sosLink: null,
        errorSOS: null,
        isSOSActive: false,
    },
    reducers: {
        startSOSAction: (state, action) => {
            state.reportId = action.payload.reportId;
            state.sosLink = action.payload.sosLink;
            state.isSOSActive = true;
            state.errorSOS = null;
        },
        stopSOSAction: (state) => {
            state.reportId = null;
            state.sosLink = null;
            state.isSOSActive = false;
            state.errorSOS = null;
        },
        setErrorSOSAction: (state, action) => {
            state.errorSOS = action.payload;
        },
    },
});

export const { startSOSAction, stopSOSAction, setErrorSOSAction } = sosSlice.actions;
export default sosSlice.reducer;
