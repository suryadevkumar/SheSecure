import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveRoom } from "../redux/chatSlice";
import { fetchMessages } from "../redux/chatSlice";

const ChatSidebar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const chatRequests = useSelector((state) => state.chat.chatRequests);
  const chatRooms = useSelector((state) => state.chat.chatRooms);
  const activeRoom = useSelector((state) => state.chat.activeRoom);
  const unreadCounts = useSelector((state) => state.chat.unreadCounts);

  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [problemType, setProblemType] = useState("");
  const [brief, setBrief] = useState("");

  const [showChats, setShowChats] = useState(true);
  const [showPendingChats, setShowPendingChats] = useState(false);

  // Count pending requests
  const pendingRequestsCount = chatRequests.filter(
    (r) => r.status === "Pending"
  ).length;

  // Total unread messages
  const totalUnreadMessages = Object.values(unreadCounts).reduce(
    (total, count) => total + count,
    0
  );

  // const roomUnreadCount = unreadCounts[room._id] || 0;

  const handleCreateRequest = (e) => {
    e.preventDefault();
    dispatch({
      type: "socket/createChatRequest",
      payload: { problemType, brief },
    });
    setProblemType("");
    setBrief("");
    setShowNewRequestForm(false);
  };

  const handleAcceptChatRequest = (requestId) => {
    dispatch({
      type: "socket/acceptChatRequest",
      payload: { requestId },
    });
  };

  const handleSetActiveRoom = (room) => {
    dispatch(setActiveRoom(room));

    if (room) {
      dispatch(fetchMessages({ roomId: room._id, userId: user._id }));

      // You would also want to mark messages as read here
      // dispatch(markMessagesAsRead({ roomId: room._id }));
    }
  };

  const chatList = (checkFalse) => {
    if (checkFalse == true) return;
    setShowPendingChats(!showPendingChats);
    setShowChats(!showChats);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* User Info */}
      <div className="flex items-center justify-between p-3.5 bg-blue-600 text-white shadow-md">
        <h3 className="font-semibold text-lg">
          {user?.firstName} {user.lastName}
        </h3>
        <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold">
          {user?.firstName?.charAt(0)}
          {user?.lastName?.charAt(0)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 bg-gray-50">
        {user?.userType === "User" && (
          <button
            onClick={() => setShowNewRequestForm(!showNewRequestForm)}
            className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md font-medium cursor-pointer"
          >
            {showNewRequestForm ? "Cancel" : "New Chat Request"}
          </button>
        )}
      </div>

      {/* New Request Form */}
      {showNewRequestForm && user?.userType === "User" && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <h4 className="mb-3 text-sm font-medium text-blue-800">
            Create New Request
          </h4>
          <form onSubmit={handleCreateRequest}>
            <div className="mb-3">
              <label
                className="block mb-1 text-xs font-semibold text-blue-700"
                htmlFor="problemType"
              >
                Problem Type
              </label>
              <select
                id="problemType"
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
                required
              >
                <option value="">Select a type</option>
                <option value="Personal">Personal</option>
                <option value="Career">Career</option>
                <option value="Family">Family</option>
                <option value="Relationship">Relationship</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label
                className="block mb-1 text-xs font-semibold text-blue-700"
                htmlFor="brief"
              >
                Brief Description
              </label>
              <textarea
                id="brief"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                rows="3"
                required
                placeholder="Briefly describe your issue..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm font-medium cursor-pointer"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Chat Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          className={`flex-1 p-2 text-center text-sm font-medium transition-all focus:outline-none relative cursor-pointer ${
            showChats
              ? "text-blue-600 border-b-2 border-blue-600 bg-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => chatList(showChats)}
        >
          CHATS
          {totalUnreadMessages > 0 && (
            <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {totalUnreadMessages}
            </span>
          )}
        </button>
        <button
          className={`flex-1 p-2 text-center text-sm font-medium transition-all focus:outline-none relative cursor-pointer ${
            showPendingChats
              ? "text-blue-600 border-b-2 border-blue-600 bg-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => chatList(showPendingChats)}
        >
          PENDING CHATS
          {pendingRequestsCount > 0 && (
            <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Rooms */}
      {chatRooms.length > 0 && showChats && (
        <div className="flex flex-col flex-grow overflow-y-auto">
          <h4 className="p-3 text-xs font-medium text-gray-500 uppercase bg-gray-50">
            Your Chats
          </h4>
          <div className="flex-grow overflow-y-auto">
            {chatRooms.map((room) => (
              <div
                key={room._id}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition duration-150 border-l-4 relative ${
                  activeRoom?._id === room._id
                    ? "bg-blue-50 border-blue-500"
                    : "border-transparent"
                } ${room.isEnded ? "opacity-70" : ""}`}
                onClick={() => handleSetActiveRoom(room)}
              >
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800">
                    {user?.userType === "User"
                      ? `${room.counsellor.firstName} ${room.counsellor.lastName}`
                      : `${room.user.firstName} ${room.user.lastName}`}
                    {onlineUsers.includes(
                      user?.userType === "User"
                        ? room.counsellor._id
                        : room.user._id
                    ) && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </p>
                  <div className="flex items-center">
                    {room.isEnded && (
                      <span className="mr-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        Ended
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {room.chatRequest.problemType}: {room.chatRequest.brief}
                </p>

                {/* Unread message counter for each chat */}
                {unreadCounts[room._id] > 0 && (
                  <span className="absolute right-3 bottom-3 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCounts[room._id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Chat Requests */}
      {user?.userType === "Counsellor" &&
        showPendingChats &&
        chatRequests.length > 0 && (
          <div className="flex flex-col flex-grow overflow-y-auto">
            <h4 className="p-3 text-xs font-medium text-gray-500 uppercase bg-gray-50">
              Pending Requests
            </h4>
            <div className="flex-grow overflow-y-auto">
              {chatRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150"
                >
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-800">
                      {request.user.firstName} {request.user.lastName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 mb-3 text-sm text-gray-600">
                    <span className="font-medium">{request.problemType}:</span>{" "}
                    {request.brief}
                  </p>
                  <button
                    onClick={() => handleAcceptChatRequest(request._id)}
                    className="px-4 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-200 shadow-sm"
                  >
                    Accept Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* User Requests Status */}
      {user?.userType === "User" &&
        showPendingChats &&
        chatRequests.filter((r) => r.status === "Pending").length > 0 && (
          <div className="flex flex-col flex-grow overflow-y-auto">
            <h4 className="p-3 text-xs font-medium text-gray-500 uppercase bg-gray-50">
              Your Pending Requests
            </h4>
            <div className="flex-grow overflow-y-auto">
              {chatRequests
                .filter((r) => r.status === "Pending")
                .map((request) => (
                  <div
                    key={request._id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-800">
                        {request.problemType}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {request.brief}
                    </p>
                    <div className="mt-3 flex items-center text-yellow-600">
                      <svg
                        className="w-4 h-4 mr-1 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <p className="text-xs">
                        Waiting for a counsellor to accept...
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default ChatSidebar;
