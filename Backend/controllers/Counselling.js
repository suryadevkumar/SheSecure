import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';

export const getChatRequests = async (req, res) => {
  try {
    const { userId, status } = req.query;
    console.log(req.query);
    let query = {};
    if (userId) query.user = userId;
    query.status = "Pending";
    
    const chatRequests = await ChatRoom.find(query)
      .populate('user', 'firstName lastName')
      .populate('counsellor', 'firstName lastName')
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
      status: { $ne: 'Pending' }
    })
    .populate('user', 'firstName lastName')
    .populate('counsellor', 'firstName lastName')
    .sort('-updatedAt');
    
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

export const getUnreadCounts = async (req, res) => {
  try {
      const { userId } = req.query;
      
      if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Get all user's chat rooms
      const chatRooms = await ChatRoom.find({
          $or: [{ user: userId }, { counsellor: userId }]
      });
      
      const unreadCounts = {};
      
      // For each room, count unread messages
      for (const room of chatRooms) {
          const unreadMessages = await Message.countDocuments({
              chatRoom: room._id,
              sender: { $ne: userId },
              readBy: { $nin: [userId] }
          });
          
          if (unreadMessages > 0) {
              unreadCounts[room._id] = unreadMessages;
          }
      }
      
      res.json(unreadCounts);
  } catch (error) {
      console.error('Error getting unread counts:', error);
      res.status(500).json({ message: 'Server error' });
  }
};