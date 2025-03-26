import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './locationSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    location: locationReducer,
    auth: authReducer,
  },
});

export default store;