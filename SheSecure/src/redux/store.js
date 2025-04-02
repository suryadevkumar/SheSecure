import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './locationSlice';
import authReducer from './authSlice';
import sosReducer from './sosSlice';
import policeReducer from './policeStationSlice';
import hospitalReducer from './hospitalSlice';

const store = configureStore({
  reducer: {
    location: locationReducer,
    auth: authReducer,
    sos: sosReducer,
    police: policeReducer,
    hospital: hospitalReducer,
  },
});

export default store;