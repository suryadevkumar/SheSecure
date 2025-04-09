import io from 'socket.io-client';
import { 
  setSocket, 
  setConnected 
} from '../redux/socketSlice';
import {
  updateChatRequests,
  addChatRequest,
  removeChatRequest,
  updateChatRequest,
  addChatRoom,
  updateChatRooms,
  addMessage,
  addPendingEndRequest,
  markChatRoomEnded
} from '../redux/chatSlice';

const socketMiddleware = store => {
  let socket = null;

  return next => action => {
    const { dispatch, getState } = store;
    
    // Actions to initialize socket
    if (action.type === 'socket/initialize') {
      const { user } = getState().auth;
      
      if (!user) return next(action);
      
      // Close previous socket if exists
      if (socket) socket.disconnect();
      
      // Create new socket
      socket = io('http://localhost:3000');
      
      // Socket event handlers
      socket.on('connect', () => {
        console.log('Socket connected');
        dispatch(setConnected(true));
        socket.emit('user_connected', user._id);
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        dispatch(setConnected(false));
      });
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      // Set up chat event listeners
      // For counsellors
      if (user.userType === 'Counsellor') {
        socket.on('pending_chat_requests', (requests) => {
          dispatch(updateChatRequests(requests));
        });
        
        socket.on('new_chat_request', (request) => {
          dispatch(addChatRequest(request));
        });
        
        socket.on('chat_request_status_updated', (updatedRequest) => {
          dispatch(removeChatRequest(updatedRequest));
        });
      }
      
      // For users
      if (user.userType === 'User') {
        socket.on('chat_request_created', (request) => {
          dispatch(addChatRequest(request));
        });
      }
      
      // For both user types
      socket.on('chat_request_accepted', ({ chatRequest, chatRoom }) => {
        dispatch(updateChatRequest(chatRequest));
        dispatch(addChatRoom(chatRoom));
      });
      
      socket.on('chat_room_created', (chatRoom) => {
        dispatch(addChatRoom(chatRoom));
      });
      
      socket.on('active_chat_rooms', (rooms) => {
        dispatch(updateChatRooms(rooms));
      });
      
      socket.on('new_message', (message) => {
        dispatch(addMessage(message));
      });
      
      socket.on('message_sent', (message) => {
        dispatch(addMessage(message));
      });
      
      socket.on('end_chat_request', ({ chatRoomId }) => {
        dispatch(addPendingEndRequest(chatRoomId));
      });
      
      socket.on('end_chat_declined', ({ chatRoomId }) => {
        const { activeRoom } = getState().chat;
        if (activeRoom && activeRoom._id === chatRoomId) {
          // Add system message
          dispatch(addMessage({
            _id: Date.now().toString(),
            chatRoom: chatRoomId,
            sender: { _id: 'system' },
            content: 'User declined to end the chat.',
            isSystem: true,
            createdAt: new Date().toISOString(),
          }));
        }
      });
      
      socket.on('chat_ended', ({ chatRoomId }) => {
        dispatch(markChatRoomEnded({ chatRoomId }));
      });
      
      // Save socket in Redux store
      dispatch(setSocket(socket));
    }
    
    // Actions for socket events
    if (action.type === 'socket/createChatRequest') {
      const { problemType, brief } = action.payload;
      const { user } = getState().auth;

      console.log(user, problemType, brief, socket)
      
      if (!socket || !user) return next(action);
      
      socket.emit('create_chat_request', {
        userId: user._id,
        problemType,
        brief,
      });
    }
    
    if (action.type === 'socket/acceptChatRequest') {
      const { requestId } = action.payload;
      const { user } = getState().auth;
      
      if (!socket || !user || user.userType !== 'Counsellor') return next(action);
      
      socket.emit('accept_chat_request', {
        counsellorId: user._id,
        requestId,
      });
    }
    
    if (action.type === 'socket/sendMessage') {
      const { content } = action.payload;
      const { user } = getState().auth;
      const { activeRoom } = getState().chat;
      
      if (!socket || !user || !activeRoom) return next(action);
      
      socket.emit('send_message', {
        chatRoomId: activeRoom._id,
        senderId: user._id,
        content,
      });
    }
    
    if (action.type === 'socket/requestEndChat') {
      const { chatRoomId } = action.payload;
      const { user } = getState().auth;
      
      if (!socket || !user || user.userType !== 'Counsellor') return next(action);
      
      socket.emit('request_end_chat', {
        chatRoomId,
        counsellorId: user._id,
      });
    }
    
    if (action.type === 'socket/confirmEndChatRequest') {
      const { chatRoomId, accepted } = action.payload;
      const { user } = getState().auth;
      
      if (!socket || !user || user.userType !== 'User') return next(action);
      
      socket.emit('end_chat_response', {
        chatRoomId,
        userId: user._id,
        accepted,
      });
    }
    
    return next(action);
  };
};

export default socketMiddleware;