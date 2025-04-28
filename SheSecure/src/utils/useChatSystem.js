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
  removePendingEndRequest,
  markChatRoomEnded,
  clearUnreadCount,
  setUserOnline,
  setUserOffline,
  incrementUnreadCount,
  markMessageRead,
  setUserTyping,
  clearUserTyping
} from '../redux/chatSlice';
import { wsUrl } from '../config/config';

const chatSocket = store => {
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
      socket = io(wsUrl+'/chat');

      // Socket event handlers
      socket.on('connect', () => {
        console.log('Socket connected');
        dispatch(setConnected(true));
        socket.emit('user_connected', user._id);
      });

      socket.on('online_users', (userIds) => {
        userIds.forEach(userId => dispatch(setUserOnline({ userId })));
      });

      socket.on('user_status_change', ({ userId, status, lastseen }) => {
        if (status === 'online') {
          dispatch(setUserOnline({ userId }));
        } else {
          dispatch(setUserOffline({ userId, lastseen }));
        }
      });

      socket.on('increment_unread', ({ chatRoomId }) => {
        dispatch(incrementUnreadCount({ chatRoomId }));
      });

      socket.on('clear_unread', ({ chatRoomId }) => {
        dispatch(clearUnreadCount({ chatRoomId }));
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
        const { activeRoom } = getState().chat;
        const { user } = getState().auth;

        // Increment unread count if message is not in active room or not from the current user
        if ((!activeRoom || activeRoom._id !== message.chatRoom) && message.sender._id !== user._id) {
          dispatch(incrementUnreadCount({ chatRoomId: message.chatRoom }));
        }
      });

      socket.on('message_sent', (message) => {
        dispatch(addMessage(message));
      });

      socket.on('message_read', ({ messageId, userId }) => {
        // This event will be triggered when a user reads a message
        dispatch(markMessageRead({ messageId, userId }));
      });

      socket.on('update_unread_count', (data) => {
        dispatch(updateUnreadCount(data));
      });

      socket.on('end_chat_request', ({ chatRoomId }) => {
        dispatch(addPendingEndRequest(chatRoomId));

        // Add a system message to make the request visible
        dispatch(addMessage({
          _id: `system-end-request-${Date.now()}`,
          chatRoom: chatRoomId,
          sender: { _id: 'system' },
          content: 'The counselor has requested to end this chat. Please accept or decline.',
          isSystem: true,
          createdAt: new Date().toISOString(),
        }));
      });

      socket.on('clear_end_request_lock', ({ chatRoomId }) => {
        dispatch(removePendingEndRequest(chatRoomId));
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

      // Add typing indicator events
      socket.on('user_typing', ({ chatRoomId, userId }) => {
        dispatch(setUserTyping({ chatRoomId, userId }));
      });

      socket.on('user_stopped_typing', ({ chatRoomId }) => {
        dispatch(clearUserTyping({ chatRoomId }));
      });

      // Save socket in Redux store
      dispatch(setSocket(socket));
    }

    // Actions for socket events
    if (action.type === 'socket/createChatRequest') {
      const { problemType, brief } = action.payload;
      const { user } = getState().auth;

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

    if (action.type === 'socket/markMessageRead') {
      const { messageId, userId, chatRoomId } = action.payload;

      if (!socket || !userId) return next(action);

      socket.emit('mark_message_read', {
        messageId,
        userId,
        chatRoomId
      });
    }

    if (action.type === 'chat/setActiveRoom') {
      const chatRoomId = action.payload._id;

      if (chatRoomId) {
        dispatch(clearUnreadCount({ chatRoomId }));
      }
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

    // Add typing indicator actions
    if (action.type === 'socket/userTyping') {
      const { chatRoomId, userId } = action.payload;

      if (!socket || !userId) return next(action);

      socket.emit('user_typing', {
        chatRoomId,
        userId,
      });
    }

    if (action.type === 'socket/userStoppedTyping') {
      const { chatRoomId, userId } = action.payload;

      if (!socket || !userId) return next(action);

      socket.emit('user_stopped_typing', {
        chatRoomId,
        userId,
      });
    }

    return next(action);
  };
};

export default chatSocket;