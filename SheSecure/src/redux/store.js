import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './locationSlice';
import authReducer from './authSlice';
import sosReducer from './sosSlice';
import policeReducer from './policeStationSlice';
import hospitalReducer from './hospitalSlice';
import chatReducer from './chatSlice'
import socketReducer from './socketSlice'
import socketMiddleware from '../utils/socket';

const store = configureStore({
  reducer: {
    location: locationReducer,
    auth: authReducer,
    sos: sosReducer,
    chat: chatReducer,
    police: policeReducer,
    hospital: hospitalReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket object which is not serializable
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.socket'],
      },
    }).concat(socketMiddleware),
});

export default store;