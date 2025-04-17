import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './locationSlice';
import authReducer from './authSlice';
import sosReducer from './sosSlice';
import policeReducer from './policeStationSlice';
import hospitalReducer from './hospitalSlice';
import crimeReducer from './crimeSlice'
import chatReducer from './chatSlice'
import socketReducer from './socketSlice'
import chatSocket from '../utils/chatSocket';

const store = configureStore({
  reducer: {
    location: locationReducer,
    auth: authReducer,
    sos: sosReducer,
    chat: chatReducer,
    police: policeReducer,
    hospital: hospitalReducer,
    crime: crimeReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket object which is not serializable
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.socket'],
      },
    }).concat(chatSocket),
});

export default store;