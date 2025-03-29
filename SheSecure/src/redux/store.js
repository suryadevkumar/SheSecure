import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './locationSlice';
import authReducer from './authSlice';
import sosReducer from './sosSlice';
import policeReducer from './policeStationSlice';

const store = configureStore({
  reducer: {
    location: locationReducer,
    auth: authReducer,
    sos: sosReducer,
    police: policeReducer,
  },
});

export default store;