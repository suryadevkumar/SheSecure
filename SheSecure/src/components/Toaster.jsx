import React, { useState, useEffect } from 'react';

const Toaster = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progressWidth, setProgressWidth] = useState('100%');

  useEffect(() => {
    // Hide toaster after 3 seconds
    const hideToaster = setTimeout(() => {
      setIsVisible(false);  // Set visibility to false
      onClose();  // Trigger the close function passed from the parent
    }, 3000);

    // Update progress bar every 50ms for smooth transition
    const progressTimer = setInterval(() => {
      setProgressWidth((prevWidth) => {
        const newWidth = parseFloat(prevWidth) - (100 / 60); // Decrease width for 3 seconds
        return newWidth <= 0 ? '0%' : `${newWidth}%`;
      });
    }, 50);

    // Clean up both timers when component unmounts or visibility changes
    return () => {
      clearTimeout(hideToaster);
      clearInterval(progressTimer);
    };
  }, []); // No dependencies to ensure consistency

  if (!isVisible) {
    return null;  // Do not render if not visible
  }

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-50 rounded-lg shadow-md p-4 w-150 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-red-500"
          >
            <path
              fillRule="evenodd"
              d="M5.72 5.72a.75 75 0 0110.6 0L12 11.38l5.68-5.66a.75 75 0 111.06 1.06L13.06 12l5.68 5.66a.75 75 0 11-1.06 1.06L12 13.06l-5.68 5.66a.75 75 0 11-1.06-1.06L10.94 12 5.26 6.34a.75 75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-4 text-2xl">{message}</span>
        </div>
        <button className="text-gray-500" onClick={() => setIsVisible(false)}>
          &times;
        </button>
      </div>
      <div
        className="mt-3 h-1 bg-red-500 rounded-b-lg"
        style={{ width: progressWidth, transition: 'width 0.05s linear' }}
      ></div>
    </div>
  );
};

export default Toaster;
