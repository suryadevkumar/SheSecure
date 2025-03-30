import React, { useState, useEffect } from 'react';
import { api } from '../config/config';
import { sendEmailOTP, verifyEmail } from '../utils/OTP';
import background from '../assets/background1.jpg';
import { useNavigate } from 'react-router-dom';
import Toaster from './Toaster';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [toasterVisible, setToasterVisible] = useState(false);
  const [toasterMessage, setToasterMessage] = useState('');
  const [toasterType, setToasterType] = useState('success');
  const [emailTimer, setEmailTimer] = useState(0);
  const [otpVisible, setOtpVisible] = useState(false);
  const [buttonText, setButtonText] = useState('Send OTP');
  const navigate = useNavigate();

  // Helper function to display success toaster
  const setSuccessToasterMessage = (message) => {
    setToasterMessage(message);
    setToasterType('success');
    setToasterVisible(true);
  };

  // Helper function to display error toaster
  const setErrorToasterMessage = (message) => {
    setToasterMessage(message);
    setToasterType('error');
    setToasterVisible(true);
  };

  // Close the toaster automatically after 3 seconds
  useEffect(() => {
    if (toasterVisible) {
      const timer = setTimeout(() => {
        setToasterVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toasterVisible]);

  useEffect(() => {
    let emailInterval = null;
    if (emailTimer > 0) {
      emailInterval = setInterval(() => {
        setEmailTimer((prev) => {
          const newTimer = prev - 1;
          setButtonText(`Resend in ${newTimer}s`);
          return newTimer;
        });
      }, 1000);
    } else {
      clearInterval(emailInterval);
      if (otpVisible) {
        setButtonText('Resend OTP');
      } else {
        setButtonText('Send OTP');
      }
    }

    return () => clearInterval(emailInterval);
  }, [emailTimer, otpVisible]);

  const handleSendOTPClick = async () => {
    if (!otpVisible) {
      if (!email) {
        setErrorToasterMessage('Please enter your email!');
        return;
      }

      fetch(api + '/auth/userExist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setOtpVisible(true);
            sendEmailOTP(setEmailTimer, email, (status) => {
              if (status.success) {
                setSuccessToasterMessage('Email sent!');
              } else {
                setErrorToasterMessage(status.message);
              }
            });
          } else {
            setErrorToasterMessage('Account not found!');
          }
        })
        .catch((error) => {
          console.error('Error during signup:', error);
          setErrorToasterMessage('An error occurred. Please try again.');
        });
    } else {
      sendEmailOTP(setEmailTimer, email, (status) => {
        if (status.success) {
          setSuccessToasterMessage('Email sent!');
        } else {
          setErrorToasterMessage(status.message);
        }
      });
    }
  };

  const handleLoginClick = async (e) => {
    e.preventDefault();
  
    try {
      await verifyEmail(emailOTP);
  
      const response = await fetch(`${api}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user',data.user);
          navigate('/userDashboard');
        } else {
          setErrorToasterMessage('Login failed. Server error.');
        }
      } else {
        setErrorToasterMessage('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorToasterMessage(err);
    }
  };  

  return (
    <div className='flex items-center justify-center bg-cover bg-center h-[calc(100vh-4rem)]'style={{ backgroundImage: `url(${background})` }}>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md ml-[40%] lg:ml-[50%] relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>

        {toasterVisible && (
          <Toaster
            message={toasterMessage}
            onClose={() => setToasterVisible(false)}
            type={toasterType}
          />
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="email">
              Email
            </label>
            <input
              className={`appearance-none border rounded w-full py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                otpVisible ? 'cursor-not-allowed' : ''
              }`}
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={otpVisible}
            />
          </div>

          {otpVisible && (
            <div>
              <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="emailOTP">
                OTP
              </label>
              <input
                className="appearance-none border rounded w-full py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="emailOTP"
                id="emailOTP"
                value={emailOTP}
                onChange={(e) => setEmailOTP(e.target.value)}
                placeholder="Enter your email OTP"
              />
            </div>
          )}

          <button
            className={`text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline ${
              otpVisible ? 'w-[48%]' : 'w-full'
            } ${otpVisible && emailTimer > 0 ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'}`}
            onClick={handleSendOTPClick}
            disabled={otpVisible && emailTimer > 0}
          >
            {buttonText}
          </button>

          {otpVisible && (
            <button
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 ml-[4%] rounded focus:outline-none focus:shadow-outline w-[48%] mt-4 ${
                emailOTP ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              onClick={handleLoginClick}
              disabled={!emailOTP}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;