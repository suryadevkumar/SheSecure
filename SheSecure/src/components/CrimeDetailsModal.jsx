import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaThumbsUp, FaThumbsDown, FaTimes, FaComment } from "react-icons/fa";
import {
  crimeComment,
  getInteractions,
  interactWithCrime,
} from "../routes/crime-report-interaction-routes";

const CrimeDetailsModal = ({ crime, onClose }) => {
  const [interactions, setInteractions] = useState({
    likeCount: 0,
    unlikeCount: 0,
    comments: [],
    userInteraction: null,
  });
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [error, setError] = useState(null);
  // Track expanded comments in an object using comment ids as keys
  const [expandedComments, setExpandedComments] = useState({});

  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (crime?._id) {
      fetchInteractions();
    }
  }, [crime?._id]);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInteractions(token, crime._id);

      if (response?.success) {
        setInteractions({
          likeCount: response.data.likeCount,
          unlikeCount: response.data.unlikeCount,
          comments: response.data.comments || [],
          userInteraction: response.data.userLike,
        });
      } else {
        setError(response?.error || "Failed to load interactions");
      }
    } catch (error) {
      console.error("Error fetching interactions:", error);
      setError("Failed to load interactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (likeStatus) => {
    try {
      setError(null);
      // Toggle behavior - if already selected, remove selection
      const action =
        interactions.userInteraction === likeStatus ? null : likeStatus;

      const response = await interactWithCrime(token, crime._id, action);

      if (response?.success) {
        setInteractions({
          likeCount: response.data.likeCount,
          unlikeCount: response.data.unlikeCount,
          comments: [...interactions.comments],
          userInteraction: response.data.like,
        });
      } else {
        setError(response?.error || "Failed to update interaction");
      }
    } catch (error) {
      console.error("Error updating interaction:", error);
      setError("Failed to update interaction. Please try again.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitStatus("submitting");
      setError(null);
      const response = await crimeComment(token, crime._id, comment);

      if (response?.success) {
        console.log(response)
        setComment("");
        setInteractions((prev) => ({
          ...prev,
          comments: [response.data.comment, ...prev.comments],
        }));
        setSubmitStatus("success");
        setTimeout(() => setSubmitStatus(""), 3000);
      } else {
        setSubmitStatus("error");
        setError(response?.error || "Failed to post comment");
        setTimeout(() => setSubmitStatus(""), 3000);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setSubmitStatus("error");
      setError("Failed to post comment. Please try again.");
      setTimeout(() => setSubmitStatus(""), 3000);
    }
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count === 1 ? "" : "s"} ago`;
      }
    }

    return `${Math.floor(seconds)} seconds ago`;
  };

  const getUserName = (commentUser) => {
    if (!commentUser) return "Anonymous";
    return (
      `${commentUser.firstName} ${commentUser.lastName}`.trim() || "Anonymous"
    );
  };

  const getUserImage = (commentUser) => {
    return commentUser?.additionalDetails?.image || "/default-user.png";
  };

  // Function to render comment text with read more/less functionality
  const renderCommentText = (comment) => {
    const commentText = comment.text;
    const isLongComment = commentText.length > 150;
    const isExpanded = expandedComments[comment._id];

    if (!isLongComment) {
      return <p className="mt-1 text-gray-700">{commentText}</p>;
    }

    return (
      <div className="mt-1">
        <p className="text-gray-700">
          {isExpanded ? commentText : `${commentText.substring(0, 150)}...`}
        </p>
        <button
          onClick={() => toggleCommentExpansion(comment._id)}
          className="text-blue-600 text-sm mt-1 hover:underline focus:outline-none cursor-pointer"
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold">Crime Report Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition cursor-pointer"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col md:flex-row overflow-auto">
          {/* Left Side - Crime Details */}
          <div className="md:w-1/2 p-4 border-r border-gray-200">
            <h3 className="font-bold text-red-600 text-xl">
              {crime.typeOfCrime}
            </h3>
            <p className="text-gray-700 mt-3">{crime.description}</p>
            <p className="text-sm text-gray-500 mt-4">
              Reported: {new Date(crime.createdAt).toLocaleString()}
            </p>

            {crime.crimePhotos?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Evidence Photos</h4>
                <div className="grid grid-cols-2 gap-2">
                  {crime.crimePhotos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Crime evidence ${idx + 1}`}
                      className="w-full h-40 object-cover rounded"
                      onError={(e) => {
                        e.target.src = "/image-placeholder.png";
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Interactions */}
          <div className="md:w-1/2 p-4 flex flex-col">
            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <p>Loading interactions...</p>
              </div>
            ) : (
              <>
                {/* Support/Unsupport Counts */}
                <div className="flex justify-around mb-6">
                  <button
                    onClick={() => handleInteraction("Like")}
                    className={`flex flex-col items-center cursor-pointer ${
                      interactions.userInteraction === "Like"
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    } transition-colors`}
                  >
                    <FaThumbsUp size={32} />
                    <span className="font-bold mt-1">
                      {interactions.likeCount}
                    </span>
                    <span>Support</span>
                  </button>

                  <button
                    onClick={() => handleInteraction("Unlike")}
                    className={`flex flex-col items-center cursor-pointer ${
                      interactions.userInteraction === "Unlike"
                        ? "text-red-600"
                        : "text-gray-600 hover:text-red-600"
                    } transition-colors`}
                  >
                    <FaThumbsDown size={32} />
                    <span className="font-bold mt-1">
                      {interactions.unlikeCount}
                    </span>
                    <span>Unsupport</span>
                  </button>
                </div>

                {/* Comments Section */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold flex items-center">
                    <FaComment className="mr-2" />
                    Comments ({interactions.comments.length})
                  </h4>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add your comment..."
                      className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitStatus === "submitting"}
                    />
                    <button
                      type="submit"
                      disabled={
                        !comment.trim() || submitStatus === "submitting"
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitStatus === "submitting" ? "Posting..." : "Post"}
                    </button>
                  </div>
                  {submitStatus === "success" && (
                    <p className="text-green-600 text-sm mt-1">
                      Comment posted successfully!
                    </p>
                  )}
                  {submitStatus === "error" && (
                    <p className="text-red-600 text-sm mt-1">
                      Failed to post comment
                    </p>
                  )}
                </form>

                {/* Comments List with fixed height and scrolling */}
                <div className="flex-1 overflow-y-auto max-h-64">
                  {interactions.comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {interactions.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="border-b border-gray-200 pb-3"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={getUserImage(comment.user)}
                              alt="User profile"
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = "/default-user.png";
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-semibold">
                                  {getUserName(comment.user)}
                                  {currentUser &&
                                    comment.user &&
                                    currentUser._id === comment.user._id && (
                                      <span className="text-xs text-blue-600 ml-2">
                                        (You)
                                      </span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {timeAgo(comment.createdAt)}
                                </p>
                              </div>
                              {renderCommentText(comment)}

                              {comment.supportStatus && (
                                <div className="mt-1 flex items-center">
                                  {comment.supportStatus === "Support" ? (
                                    <span className="text-blue-600 text-sm flex items-center">
                                      <FaThumbsUp className="mr-1" size={12} />
                                      Supported
                                    </span>
                                  ) : (
                                    <span className="text-red-600 text-sm flex items-center">
                                      <FaThumbsDown
                                        className="mr-1"
                                        size={12}
                                      />
                                      Unsupported
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrimeDetailsModal;
