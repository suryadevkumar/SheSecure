import React, { useState, useEffect, useRef } from 'react';
import { checkUserExist, logIn, sendEmailOTP } from '../routes/signup-login-otp-routes';
import { toast } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [emailTimer, setEmailTimer] = useState(0);
  const [otpVisible, setOtpVisible] = useState(false);
  const [buttonText, setButtonText] = useState('Send OTP');
  const otpInputRefs = useRef([]);

  // Email timer
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

  const handleSendOTPClick = async (e) => {
    e.preventDefault();
    if (!otpVisible) {
      if (!email) {
        toast.error('Please enter your email!');
        return;
      }

      const response = await checkUserExist(email);
      if (response.success){
        setOtpVisible(true);
        sendEmailOTP(setEmailTimer, email, (status) => {
          if (status.success) {
            toast.success(status.message);
          } else {
            toast.error(status.message);
          }
        });
      } else {
        toast.error(response.message);
      }
    } else {
      sendEmailOTP(setEmailTimer, email, (status) => {
        if (status.success) {
          toast.success(status.message);
        } else {
          toast.error(status.message);
        }
      });
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleLogin = () => {
    const fullOtp = otp.join('');
    logIn(email, fullOtp);
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] bg-white flex items-center justify-center p-4 my-auto">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-pink-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-pink-100 mt-1">Sign in to your SheSecure account</p>
        </div>

        <div className="p-8">
          <div className={`${otpVisible? 'space-y-3' : 'space-y-6'}`}>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className={`w-full px-4 py-3 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition ${
                  otpVisible ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                }`}
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={otpVisible}
              />
            </div>

            {otpVisible && (
              <div className="animate-fade-in">
                <label className="block text-gray-700 font-medium mb-2">
                  Verification Code
                </label>
                <div className="flex justify-between space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      className="w-full h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition"
                      type="text"
                      maxLength="1"
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <button
                className={`py-3 px-6 rounded-lg font-semibold text-white transition ${
                  otpVisible && emailTimer > 0 
                    ? 'bg-pink-400 cursor-not-allowed' 
                    : 'bg-pink-600 hover:bg-pink-700 cursor-pointer'
                }`}
                onClick={handleSendOTPClick}
                disabled={otpVisible && emailTimer > 0}
              >
                {buttonText}
              </button>

              {otpVisible && (
                <button
                  className={`py-3 px-6 rounded-lg font-semibold text-white transition ${
                    otp.join('').length === 6
                      ? 'bg-pink-600 hover:bg-pink-700 cursor-pointer' 
                      : 'bg-pink-400 cursor-not-allowed'
                  }`}
                  onClick={handleLogin}
                  disabled={otp.join('').length !== 6}
                >
                  Verify & Login
                </button>
              )}
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="text-pink-600 font-semibold hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;