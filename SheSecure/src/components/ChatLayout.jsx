import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ChatSidebar from "./ChatSidebar";
import ChatBox from "./ChatBox";
import { fetchChatRequests, fetchChatRooms, fetchUnreadCounts } from "../redux/chatSlice";

const ChatLayout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Fetch initial data when component mounts
  // In your ChatLayout.js
  useEffect(() => {
    if (!user) return;

    // Fetch initial data
    dispatch(fetchChatRequests(user._id));
    dispatch(fetchChatRooms(user._id));
    dispatch(fetchUnreadCounts(user._id));

    // Initialize socket
    dispatch({ type: "socket/initialize" });
  }, [user, dispatch]);

  return (
    <div className="flex h-[calc(100vh-13rem)] lg:h-[calc(100vh-7rem)] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-lg">
      <div className="w-1/3 border-r border-gray-200 shadow-sm">
        <ChatSidebar />
      </div>
      <div className="flex-grow">
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatLayout;
