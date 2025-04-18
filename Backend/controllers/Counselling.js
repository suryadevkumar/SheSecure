import ChatRequest from '../models/ChatRequest.js';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';

export const getChatRequests = async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    let query = {};
    if (userId) query.user = userId;
    if (status) query.status = status;
    
    const chatRequests = await ChatRequest.find(query)
      .populate('user', 'firstName lastName')
      .populate('acceptedBy', 'firstName lastName')
      .sort('-createdAt');
    
    res.json(chatRequests);
  } catch (error) {
    console.error('Error getting chat requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatRooms = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const chatRooms = await ChatRoom.find({
      $or: [{ user: userId }, { counsellor: userId }],
      isActive: true
    })
    .populate('user', 'name')
    .populate('counsellor', 'name')
    .populate('chatRequest', 'problemType brief')
    .sort('-createdAt');
    
    res.json(chatRooms);
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.query;
    
    if (!chatRoomId) {
      return res.status(400).json({ message: 'Chat room ID is required' });
    }
    
    const messages = await Message.find({chatRoom: chatRoomId})
      .populate('sender', 'firstName lastName userType')
      .sort('createdAt');
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;
    
    if (!chatRoomId || !userId) {
      return res.status(400).json({ message: 'Chat room ID and user ID are required' });
    }
    
    await Message.updateMany(
      { 
        chatRoom: chatRoomId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $push: { readBy: userId } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};