import React, { useState, useEffect } from 'react';

const Toaster = ({ message, onClose, type }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progressWidth, setProgressWidth] = useState('100%');

  const isSuccess = type === 'success';

  useEffect(() => {
    // Close the toaster after 3 seconds
    const hideToaster = setTimeout(() => {
      setIsVisible(false);
      onClose();  // Ensure the onClose callback is executed after the toaster is hidden
    }, 3000);

    // Progress bar logic (works alongside the hideToaster)
    const progressTimer = setInterval(() => {
      setProgressWidth((prevWidth) => {
        const newWidth = parseFloat(prevWidth) - (100 / 60);
        return newWidth <= 0 ? '0%' : `${newWidth}%`;
      });
    }, 50);

    // Cleanup function to clear the timers when the component unmounts or when isVisible changes
    return () => {
      clearTimeout(hideToaster);
      clearInterval(progressTimer);
    };
  }, [onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 rounded-lg shadow-md p-4 w-150 z-50 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-6 w-6 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {isSuccess ? (
              <path
                fillRule="evenodd"
                d="M8.485 22.944a.75.75 0 01-1.06-1.06l9.057-9.057-9.057-9.057a.75.75 0 011.06-1.06l9.586 9.586a.75.75 0 010 1.06l-9.586 9.586z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M5.72 5.72a.75 75 0 0110.6 0L12 11.38l5.68-5.66a.75 75 0 111.06 1.06L13.06 12l5.68 5.66a.75 75 0 11-1.06 1.06L12 13.06l-5.68 5.66a.75 75 0 01-1.06-1.06L10.94 12 5.26 6.34a.75 75 0 010-1.06z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <span className="ml-4 text-2xl">{message}</span>
        </div>
        <button className="text-gray-500" onClick={() => setIsVisible(false)}>
          &times;
        </button>
      </div>
      <div
        className={`mt-3 h-1 rounded-b-lg ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
        style={{ width: progressWidth, transition: 'width 0.05s linear' }}
      ></div>
    </div>
  );
};

export default Toaster;
