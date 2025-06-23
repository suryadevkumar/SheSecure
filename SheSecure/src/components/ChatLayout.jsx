import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ChatSidebar from "./ChatSidebar";
import ChatBox from "./ChatBox";
import { fetchChatRequests, fetchChatRooms, fetchUnreadCounts } from "../redux/chatSlice";

const ChatLayout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const activeRoom = useSelector((state) => state.chat.activeRoom);
  const [showChatBox, setShowChatBox] = useState(false);

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // On desktop, always show both sidebar and chat box
      if (window.innerWidth >= 768) {
        setShowChatBox(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show chat box when active room changes on mobile
  useEffect(() => {
    if (isMobile && activeRoom) {
      setShowChatBox(true);
    }
  }, [activeRoom, isMobile]);

  // Fetch initial data when component mounts
  useEffect(() => {
    if (!user) return;

    // Fetch initial data
    dispatch(fetchChatRequests(user._id));
    dispatch(fetchChatRooms(user._id));
    dispatch(fetchUnreadCounts(user._id));

    // Initialize socket
    dispatch({ type: "socket/initialize" });
  }, [user, dispatch]);

  const handleBackToSidebar = () => {
    setShowChatBox(false);
  };

  return (
    <div className="flex h-[calc(100vh-13rem)] lg:h-[calc(100vh-7rem)] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-lg">
      {/* Sidebar - shown always on desktop, conditionally on mobile */}
      <div className={`${isMobile ? (showChatBox ? 'hidden' : 'w-full') : 'w-1/3'} border-r border-gray-200 shadow-sm`}>
        <ChatSidebar />
      </div>
      
      {/* Chat Box - shown always on desktop, conditionally on mobile */}
      <div className={`${isMobile ? (showChatBox ? 'w-full' : 'hidden') : 'flex-grow'}`}>
        {isMobile && showChatBox && (
          <button 
            onClick={handleBackToSidebar}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatLayout;