import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchChatRequests = createAsyncThunk(
  'chat/fetchRequests',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/chat/requests?userId=${userId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat requests');
    }
  }
);

export const fetchChatRooms = createAsyncThunk(
  'chat/fetchRooms',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/chat/rooms?userId=${userId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat rooms');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ roomId, userId }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/chat/messages?chatRoomId=${roomId}`);

      // Mark messages as read
      await axios.post("/api/chat/messages/read", {
        chatRoomId: roomId,
        userId: userId,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatRequests: [],
    chatRooms: [],
    activeRoom: null,
    messages: [],
    loading: false,
    error: null,
    pendingEndRequests: [],
    unreadCounts: {},
    onlineUsers: [],
  },
  reducers: {
    setUserOnline: (state, action) => {
      const { userId } = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    setUserOffline: (state, action) => {
      const { userId } = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    addMessage: (state, action) => {
      if (state.activeRoom && action.payload.chatRoom === state.activeRoom._id) {
        state.messages.push(action.payload);
      }
    },
    updateChatRequests: (state, action) => {
      state.chatRequests = action.payload;
    },
    addChatRequest: (state, action) => {
      state.chatRequests = [action.payload, ...state.chatRequests];
    },
    removeChatRequest: (state, action) => {
      state.chatRequests = state.chatRequests.filter(
        (req) => req._id !== action.payload._id
      );
    },
    updateChatRequest: (state, action) => {
      state.chatRequests = state.chatRequests.map(req =>
        req._id === action.payload._id ? action.payload : req
      );
    },
    addChatRoom: (state, action) => {
      state.chatRooms = [action.payload, ...state.chatRooms];
    },
    updateChatRooms: (state, action) => {
      state.chatRooms = action.payload;
    },
    addPendingEndRequest: (state, action) => {
      if (!state.pendingEndRequests.includes(action.payload)) {
        state.pendingEndRequests.push(action.payload);
      }

      // Also update the active room if it's the one receiving the end request
      if (state.activeRoom && state.activeRoom._id === action.payload) {
        state.activeRoom.pendingEndRequest = true;
      }
    },
    removePendingEndRequest: (state, action) => {
      state.pendingEndRequests = state.pendingEndRequests.filter(
        id => id !== action.payload
      );

      if (state.activeRoom && state.activeRoom._id === action.payload) {
        state.activeRoom.pendingEndRequest = false;
      }
    },
    markMessageRead: (state, action) => {
      const { messageId, userId } = action.payload;
      state.messages = state.messages.map(message => {
        if (message._id === messageId && !message.readBy.includes(userId)) {
          return {
            ...message,
            readBy: [...message.readBy, userId]
          };
        }
        return message;
      });
    },
    markChatRoomEnded: (state, action) => {
      const { chatRoomId } = action.payload;

      // Update chat rooms list
      state.chatRooms = state.chatRooms.map(room => {
        if (room._id === chatRoomId) {
          return {
            ...room,
            isEnded: true,
            endedAt: new Date().toISOString()
          };
        }
        return room;
      });

      // Update active room if it's the one that ended
      if (state.activeRoom && state.activeRoom._id === chatRoomId) {
        state.activeRoom = {
          ...state.activeRoom,
          isEnded: true,
          endedAt: new Date().toISOString()
        };
      }

      // Remove from pending end requests
      state.pendingEndRequests = state.pendingEndRequests.filter(
        id => id !== chatRoomId
      );
    },
    incrementUnreadCount: (state, action) => {
      const { chatRoomId } = action.payload;
      if (!state.unreadCounts[chatRoomId]) {
        state.unreadCounts[chatRoomId] = 0;
      }
      state.unreadCounts[chatRoomId]++;
    },
    clearUnreadCount: (state, action) => {
      const { chatRoomId } = action.payload;
      state.unreadCounts[chatRoomId] = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatRequests.fulfilled, (state, action) => {
        state.chatRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatRequests.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.chatRooms = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const {
  setActiveRoom,
  addMessage,
  updateChatRequests,
  addChatRequest,
  removeChatRequest,
  updateChatRequest,
  addChatRoom,
  updateChatRooms,
  addPendingEndRequest,
  removePendingEndRequest,
  markChatRoomEnded,
  incrementUnreadCount,
  clearUnreadCount,
  setUserOnline,
  setUserOffline
} = chatSlice.actions;

export default chatSlice.reducer;