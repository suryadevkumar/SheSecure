import User from '../models/User.js';
import ChatRequest from '../models/ChatRequest.js';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';

const chatSocket = (io) => {

    // Store online users
    const onlineUsers = new Map();
    const userLastSeen = new Map();

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // User joins with their ID
        socket.on('user_connected', async (userId) => {
            try {
                const user = await User.findById(userId);
                if (user) {
                    onlineUsers.set(userId, socket.id);
                    userLastSeen.set(userId, Date.now());
                    socket.userId = userId;
                    socket.userType = user.userType;

                    // Broadcast online status to ALL relevant users
                    // Find all chat partners for this user
                    const chatRooms = await ChatRoom.find({
                        $or: [{ user: userId }, { counsellor: userId }],
                        isActive: true
                    });

                    // Create a list of chat partners who should be notified
                    const chatPartners = new Set();
                    chatRooms.forEach(room => {
                        const partnerId = room.user.toString() === userId ?
                            room.counsellor.toString() : room.user.toString();
                        chatPartners.add(partnerId);
                    });

                    // Notify each chat partner individually
                    for (const partnerId of chatPartners) {
                        const partnerSocketId = onlineUsers.get(partnerId);
                        if (partnerSocketId) {
                            io.to(partnerSocketId).emit('user_status_change', {
                                userId,
                                status: 'online',
                                lastSeen: null
                            });
                        }
                    }

                    // Also send a global notification for any pending listeners
                    io.emit('user_status_change', { userId, status: 'online', lastSeen: null });

                    // If counsellor, send all pending chat requests
                    if (user.userType === 'Counsellor') {
                        const pendingRequests = await ChatRequest.find({ status: 'Pending' })
                            .populate('user', 'firstName lastName')
                            .sort('-createdAt');
                        socket.emit('pending_chat_requests', pendingRequests);
                    }

                    // Send active chat rooms for this user
                    const activeChatRooms = await ChatRoom.find({
                        $or: [{ user: userId }, { counsellor: userId }],
                        isActive: true
                    }).populate('user counsellor chatRequest');

                    const activeChatPartners = [];
                    for (const room of activeChatRooms) {
                        const partnerId = room.user.toString() === userId ?
                            room.counsellor.toString() : room.user.toString();

                        if (!activeChatPartners.includes(partnerId)) {
                            activeChatPartners.push(partnerId);
                        }
                    }

                    // Send the online status of all chat partners
                    for (const partnerId of activeChatPartners) {
                        const isOnline = onlineUsers.has(partnerId);
                        socket.emit('user_status_change', {
                            userId: partnerId,
                            status: isOnline ? 'online' : 'offline',
                            lastSeen: isOnline ? null : userLastSeen.get(partnerId)
                        });
                    }
                    socket.emit('active_chat_rooms', activeChatRooms);
                }
            } catch (error) {
                console.error('Error in user_connected:', error);
            }
        });

        // User creates a new chat request
        socket.on('create_chat_request', async (data) => {
            try {
                const { userId, problemType, brief } = data;

                const newChatRequest = await ChatRequest.create({
                    user: userId,
                    problemType,
                    brief,
                    status: 'Pending'
                });

                const populatedRequest = await ChatRequest.findById(newChatRequest._id)
                    .populate('user', 'firstName lastName');

                // Broadcast to all counsellors
                for (const [id, socketId] of onlineUsers.entries()) {
                    const user = await User.findById(id);
                    if (user && user.userType === 'Counsellor') {
                        io.to(socketId).emit('new_chat_request', populatedRequest);
                    }
                }

                // Confirm to the requesting user
                socket.emit('chat_request_created', populatedRequest);
            } catch (error) {
                console.error('Error in create_chat_request:', error);
                socket.emit('error', { message: 'Failed to create chat request' });
            }
        });

        // Counsellor accepts a chat request
        socket.on('accept_chat_request', async (data) => {
            try {
                const { counsellorId, requestId } = data;

                // Update chat request status
                const chatRequest = await ChatRequest.findByIdAndUpdate(
                    requestId,
                    { status: 'Accepted', acceptedBy: counsellorId },
                    { new: true }
                ).populate('user acceptedBy');

                if (!chatRequest) {
                    socket.emit('error', { message: 'Chat request not found' });
                    return;
                }

                // Create a new chat room
                const newChatRoom = await ChatRoom.create({
                    chatRequest: requestId,
                    user: chatRequest.user._id,
                    counsellor: counsellorId,
                    isActive: true
                });

                const populatedRoom = await ChatRoom.findById(newChatRoom._id)
                    .populate('user counsellor chatRequest');

                // Get counsellor details for welcome message
                const counsellor = await User.findById(counsellorId);

                // Create welcome message
                const welcomeMessage = await Message.create({
                    chatRoom: newChatRoom._id,
                    sender: counsellorId,
                    content: `Hi, I am ${counsellor.firstName} ${counsellor.lastName} from SheSecure. How can I help you?`,
                    readBy: [counsellorId]
                });

                const populatedMessage = await Message.findById(welcomeMessage._id)
                    .populate('sender', 'firstName lastName userType');

                // Notify both user and counsellor
                const userSocketId = onlineUsers.get(chatRequest.user._id.toString());
                if (userSocketId) {
                    io.to(userSocketId).emit('chat_request_accepted', {
                        chatRequest,
                        chatRoom: populatedRoom
                    });
                    io.to(userSocketId).emit('new_message', populatedMessage);
                }

                socket.emit('chat_room_created', populatedRoom);
                socket.emit('message_sent', populatedMessage);

                // Update all counsellors that this request is no longer available
                io.emit('chat_request_status_updated', chatRequest);
            } catch (error) {
                console.error('Error in accept_chat_request:', error);
                socket.emit('error', { message: 'Failed to accept chat request' });
            }
        });

        // Send message in chat room
        socket.on('send_message', async (data) => {
            try {
                const { chatRoomId, senderId, content } = data;

                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (!chatRoom || !chatRoom.isActive) {
                    socket.emit('error', { message: 'Chat room not found or inactive' });
                    return;
                }

                // Create and save the message
                const newMessage = await Message.create({
                    chatRoom: chatRoomId,
                    sender: senderId,
                    content,
                    readBy: [senderId]
                });

                const populatedMessage = await Message.findById(newMessage._id)
                    .populate('sender', 'firstName lastName userType');

                // Determine recipient
                const recipientId = senderId === chatRoom.user.toString()
                    ? chatRoom.counsellor.toString()
                    : chatRoom.user.toString();

                const recipientSocketId = onlineUsers.get(recipientId);

                // Send to recipient if online
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('new_message', populatedMessage);
                }

                // Confirm to sender
                socket.emit('message_sent', populatedMessage);
            } catch (error) {
                console.error('Error in send_message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('user_typing', async (data) => {
            try {
                const { chatRoomId, userId } = data;

                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (!chatRoom || !chatRoom.isActive) {
                    return;
                }

                // Determine recipient
                const recipientId = userId === chatRoom.user.toString()
                    ? chatRoom.counsellor.toString()
                    : chatRoom.user.toString();

                const recipientSocketId = onlineUsers.get(recipientId);

                // Send to recipient if online
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('user_typing', { chatRoomId, userId });
                }
            } catch (error) {
                console.error('Error in user_typing:', error);
            }
        });

        socket.on('user_stopped_typing', async (data) => {
            try {
                const { chatRoomId, userId } = data;

                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (!chatRoom || !chatRoom.isActive) {
                    return;
                }

                // Determine recipient
                const recipientId = userId === chatRoom.user.toString()
                    ? chatRoom.counsellor.toString()
                    : chatRoom.user.toString();

                const recipientSocketId = onlineUsers.get(recipientId);

                // Send to recipient if online
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('user_stopped_typing', { chatRoomId });
                }
            } catch (error) {
                console.error('Error in user_stopped_typing:', error);
            }
        });

        // Counsellor requests to end chat
        socket.on('request_end_chat', async (data) => {
            try {
                const { chatRoomId, counsellorId } = data;

                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (!chatRoom || !chatRoom.isActive) {
                    socket.emit('error', { message: 'Chat room not found or inactive' });
                    return;
                }

                // Verify the counsellor is part of this chat
                if (chatRoom.counsellor.toString() !== counsellorId) {
                    socket.emit('error', { message: 'Unauthorized to end this chat' });
                    return;
                }

                // Check if the room already has a pending end request
                const pendingEndRequest = await Message.findOne({
                    chatRoom: chatRoomId,
                    isSystem: true,
                    content: { $regex: 'requested to end this chat' },
                    createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Within last 5 minutes
                });

                if (pendingEndRequest) {
                    socket.emit('error', { message: 'An end request is already pending' });
                    return;
                }

                // Create a system message for the end request
                const endRequestMessage = await Message.create({
                    chatRoom: chatRoomId,
                    sender: counsellorId,
                    content: 'The counselor has requested to end this chat. Please accept or decline.',
                    isSystem: true,
                    readBy: [counsellorId]
                });

                // Find the user socket to send the confirmation request
                const userSocketId = onlineUsers.get(chatRoom.user.toString());
                if (userSocketId) {
                    io.to(userSocketId).emit('end_chat_request', { chatRoomId });

                    // Also send the system message
                    const populatedMessage = await Message.findById(endRequestMessage._id)
                        .populate('sender', 'firstName lastName userType');

                    io.to(userSocketId).emit('new_message', populatedMessage);
                } else {
                    socket.emit('error', { message: 'User is offline, try again later' });
                }
            } catch (error) {
                console.error('Error in request_end_chat:', error);
                socket.emit('error', { message: 'Failed to request end chat' });
            }
        });

        // User responds to end chat request
        socket.on('end_chat_response', async (data) => {
            try {
                const { chatRoomId, userId, accepted } = data;

                const chatRoom = await ChatRoom.findById(chatRoomId);
                if (!chatRoom || !chatRoom.isActive) {
                    socket.emit('error', { message: 'Chat room not found or inactive' });
                    return;
                }

                // Verify the user is part of this chat
                if (chatRoom.user.toString() !== userId) {
                    socket.emit('error', { message: 'Unauthorized to respond to this chat' });
                    return;
                }

                if (accepted) {
                    // End the chat
                    chatRoom.isEnded = true;
                    chatRoom.endedBy = chatRoom.counsellor; // Counsellor initiated the end
                    chatRoom.endedAt = new Date();
                    await chatRoom.save();

                    // Notify both parties
                    const counsellorSocketId = onlineUsers.get(chatRoom.counsellor.toString());
                    if (counsellorSocketId) {
                        io.to(counsellorSocketId).emit('chat_ended', { chatRoomId });
                    }

                    socket.emit('chat_ended', { chatRoomId });

                    // Create a system message noting the chat ended
                    await Message.create({
                        chatRoom: chatRoomId,
                        sender: chatRoom.counsellor, // Counsellor initiated
                        content: "This chat has been ended by the counsellor.",
                        isSystem: true,
                        readBy: [chatRoom.counsellor]
                    });
                } else {
                    // User declined to end the chat
                    const counsellorSocketId = onlineUsers.get(chatRoom.counsellor.toString());
                    if (counsellorSocketId) {
                        io.to(counsellorSocketId).emit('end_chat_declined', { chatRoomId });

                        // Create system message noting the decline
                        await Message.create({
                            chatRoom: chatRoomId,
                            sender: chatRoom.user, // User declined
                            content: "User declined to end the chat.",
                            isSystem: true,
                            readBy: [chatRoom.user]
                        });

                        // Clear any pending end request messages to allow counsellor to request again
                        await Message.updateMany(
                            {
                                chatRoom: chatRoomId,
                                isSystem: true,
                                content: { $regex: 'requested to end this chat' }
                            },
                            { $set: { content: "End chat request was declined." } }
                        );

                        // Notify counsellor to clear the lock
                        io.to(counsellorSocketId).emit('clear_end_request_lock', { chatRoomId });
                    }
                }
            } catch (error) {
                console.error('Error in end_chat_response:', error);
                socket.emit('error', { message: 'Failed to process end chat response' });
            }
        });

        // User disconnects
        socket.on('disconnect', () => {
            if (socket.userId) {
                const userId = socket.userId;
        
                // Remove from online users
                onlineUsers.delete(userId);
        
                // Set last seen time
                const lastSeenTime = Date.now();
                userLastSeen.set(userId, lastSeenTime);
        
                // Global notification
                io.emit('user_status_change', {
                    userId,
                    status: 'offline',
                    lastSeen: lastSeenTime
                });
        
                // Specifically notify users in active chats about status change
                ChatRoom.find({
                    $or: [{ user: userId }, { counsellor: userId }],
                    isActive: true
                })
                    .then(rooms => {
                        rooms.forEach(room => {
                            const otherUserId = room.user.toString() === userId ?
                                room.counsellor.toString() : room.user.toString();
        
                            const otherUserSocketId = onlineUsers.get(otherUserId);
                            if (otherUserSocketId) {
                                io.to(otherUserSocketId).emit('user_status_change', {
                                    userId,
                                    status: 'offline',
                                    lastSeen: lastSeenTime
                                });
                            }
                        });
                    })
                    .catch(err => console.error('Error notifying about disconnect:', err));
            }
            console.log('Client disconnected:', socket.id);
        });
        
    });

    // return io;
};

export default chatSocket;