import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const ChatBox = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const activeRoom = useSelector(state => state.chat.activeRoom);
  const messages = useSelector(state => state.chat.messages);
  
  const [newMessage, setNewMessage] = useState('');
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || activeRoom?.isEnded) return;
    
    dispatch({ type: 'socket/sendMessage', payload: { content: newMessage } });
    setNewMessage('');
  };
  
  const handleEndChatRequest = () => {
    if (user?.userType === 'Counsellor') {
      dispatch({ type: 'socket/requestEndChat', payload: { chatRoomId: activeRoom._id } });
    }
  };
  
  const handleEndChatResponse = (accepted) => {
    dispatch({ 
      type: 'socket/confirmEndChatRequest', 
      payload: { chatRoomId: activeRoom._id, accepted } 
    });
    setShowEndChatConfirm(false);
  };
  
  // Show end chat confirmation dialog when requested
  useEffect(() => {
    if (activeRoom?.pendingEndRequest && user?.userType === 'User') {
      setShowEndChatConfirm(true);
    } else {
      setShowEndChatConfirm(false);
    }
  }, [activeRoom?.pendingEndRequest, user?.userType]);
  
  if (!activeRoom) {
    return (
      <div className="flex items-center justify-center flex-grow h-full bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Active Conversation
          </h3>
          <p className="text-gray-500">
            {user?.userType === 'User' 
              ? 'Create a new chat request or select an existing chat' 
              : 'Accept a chat request or select an existing chat'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col flex-grow h-full bg-white">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3 bg-blue-500 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold">
              {user?.userType === 'User' 
                ? `${activeRoom.counsellor.firstName.charAt(0)}${activeRoom.counsellor.lastName.charAt(0)}` 
                : `${activeRoom.user.firstName.charAt(0)}${activeRoom.user.lastName.charAt(0)}`}
            </div>
            <div>
              <h3 className="font-medium text-gray-800">
                {user?.userType === 'User' 
                  ? `${activeRoom.counsellor.firstName} ${activeRoom.counsellor.lastName}` 
                  : `${activeRoom.user.firstName} ${activeRoom.user.lastName}`}
              </h3>
              <p className="text-sm text-gray-500">
                {activeRoom.chatRequest.problemType}: {activeRoom.chatRequest.brief}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`px-3 py-1 text-xs font-medium rounded-full mr-3 ${
              activeRoom.isEnded 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {activeRoom.isEnded ? 'Ended' : 'Active'}
            </div>
            
            {/* End Chat Button - Only for counsellors and active chats */}
            {user?.userType === 'Counsellor' && !activeRoom.isEnded && (
              <button
                onClick={handleEndChatRequest}
                className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-200 shadow-sm"
              >
                End Chat
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* End Chat Confirmation Dialog */}
      {showEndChatConfirm && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 mb-3">
                The counsellor has requested to end this chat. Do you want to end the conversation?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEndChatResponse(true)}
                  className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-200 shadow-sm"
                >
                  Yes, End Chat
                </button>
                <button
                  onClick={() => handleEndChatResponse(false)}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200 shadow-sm"
                >
                  No, Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div 
              key={msg._id}
              className={`flex ${
                msg.isSystem 
                  ? 'justify-center' 
                  : msg.sender._id === user?._id 
                    ? 'justify-end' 
                    : 'justify-start'
              }`}
            >
              {!msg.isSystem && msg.sender._id !== user?._id && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 self-end text-xs font-bold uppercase text-gray-700">
                  {user?.userType === 'User' 
                    ? `${activeRoom.counsellor.firstName.charAt(0)}` 
                    : `${activeRoom.user.firstName.charAt(0)}`}
                </div>
              )}
              <div 
                className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${
                  msg.isSystem 
                    ? 'bg-gray-300 text-gray-700 text-center mx-auto px-6 py-2 rounded-full text-sm' 
                    : msg.sender._id === user?._id 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {!msg.isSystem && (
                  <p className="mt-1 text-xs opacity-75 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                )}
              </div>
              {!msg.isSystem && msg.sender._id === user?._id && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 self-end text-xs font-bold uppercase text-white">
                  {`${user?.firstName?.charAt(0)}`}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input - Disabled if chat is ended */}
      <div className="p-4 bg-white border-t border-gray-200">
        {activeRoom.isEnded ? (
          <div className="p-3 text-center text-sm text-gray-600 bg-gray-100 rounded-lg shadow-inner">
            <svg className="w-5 h-5 mx-auto mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            This chat has ended. You cannot send messages.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatBox;