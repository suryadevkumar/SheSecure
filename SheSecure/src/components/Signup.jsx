import { useEffect, useState } from 'react';
import { sendEmailOTP, sendMobileOTP, verifyEmail, verifyMobile } from '../utils/OTP';
import background from '../assets/background.jpg'

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    userType: '',
    dob: '',
  });

  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [page, setPage] = useState(1);

  const [emailTimer, setEmailTimer] = useState(0);
  const [mobileTimer, setMobileTimer] = useState(0);

  const [isEmailVerify,setIsEmailVerify]=useState(false);
  const [isMobileVerify,setIsMobileVerify]=useState(false);

  useEffect(() => {
    let emailInterval = null;
    if (emailTimer > 0) {
      emailInterval = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(emailInterval);
    }
    return () => clearInterval(emailInterval);
  }, [emailTimer]);

  useEffect(() => {
    let mobileInterval = null;
    if (mobileTimer > 0) {
      mobileInterval = setInterval(() => {
        setMobileTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(mobileInterval);
    }
    return () => clearInterval(mobileInterval);
  }, [mobileTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sendOTP = (e) => {
    e.preventDefault();
    setPage(2);
    sendMobileOTP(setMobileTimer, formData.mobile);
    sendEmailOTP(setEmailTimer, formData.email);
  };

  const signup=()=>{

  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign Up</h2>
        {page==1 &&<form onSubmit={sendOTP} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="firstName">
              First Name
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="mobile">
              Mobile Number
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="mobile"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter your mobile number"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="userType">
              User Type
            </label>
            <select
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="">Select User Type</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="counsellor">Counsellor</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="dob">
              Date of Birth
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="dob"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            Sign Up
          </button>
        </form>}
        {page === 2 && (
        <div>
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="email">
              Verify Your Email
            </label>
            <input
              className="appearance-none border rounded w-[67%] py-2 px-3 text-gray-700 leading-tight cursor-not-allowed"
              id="userEmail"
              value={formData.email}
              disabled={true}
            />
            <button
              className={`bg-blue-500 text-white font-bold py-2 px-4 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${
                emailTimer > 0 || isEmailVerify ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
              }`}
              onClick={() => sendEmailOTP(setEmailTimer, formData.email)}
              disabled={isEmailVerify}
            >
              {emailTimer > 0 && !isEmailVerify ? `Resend in ${emailTimer}s` : 'Resend'}
            </button>
          </div>
          <div>
            <input
              className={`appearance-none border rounded w-[67%] py-2 px-3 my-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isEmailVerify ? 'cursor-not-allowed':''}`}
              type="text"
              name="emailOTP"
              id="emailOTP"
              value={emailOTP}
              onChange={(e) => setEmailOTP(e.target.value)}
              placeholder="Enter your email OTP"
              required
              disabled={isEmailVerify}
            />
            <button
              className={`text-white font-bold py-2 px-4 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${
                isEmailVerify ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
              }`}
              onClick={() => verifyEmail(setIsEmailVerify, emailOTP)}
              disabled={isEmailVerify}
            >
              {isEmailVerify ? 'Verified' : 'Verify'}
            </button>
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-bold mb-1 mt-2" htmlFor="mobile">
              Verify Your Mobile Number
            </label>
            <input
              className="appearance-none border rounded w-[67%] py-2 px-3 text-gray-700 leading-tight cursor-not-allowed"
              value={formData.mobile}
              id="userMobile"
              disabled={true}
            />
            <button
              className={`bg-blue-500 text-white font-bold py-2 px-4 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${
                mobileTimer > 0 || isMobileVerify? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
              }`}
              onClick={() => sendMobileOTP(setMobileTimer, formData.mobile)}
              disabled={isMobileVerify}
            >
              {mobileTimer > 0 && !isMobileVerify ? `Resend in ${mobileTimer}s` : 'Resend'}
            </button>
          </div>
          <div>
            <input
              className={`appearance-none border rounded w-[67%] py-2 px-3 my-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isMobileVerify ? 'cursor-not-allowed':''}`}
              type="text"
              name="mobileOTP"
              id="mobileOTP"
              value={mobileOTP}
              onChange={(e) => setMobileOTP(e.target.value)}
              placeholder="Enter your mobile OTP"
              required
              disabled={isMobileVerify}
            />
            <button
              className={`bg-blue-500 text-white font-bold py-2 px-4 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${
                isMobileVerify ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
              }`}
              onClick={() => verifyMobile(setIsMobileVerify, mobileOTP)}
              disabled={isMobileVerify}
            >
              {isMobileVerify ? 'Verified' : 'Verify'}
            </button>
          </div>
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-1 rounded focus:outline-none focus:shadow-outline w-[48%] ${isEmailVerify && isMobileVerify ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
            onClick={()=>setPage(1)}
            disabled={isEmailVerify && isMobileVerify}
          >
            Back
          </button>
          <button
            className={`bg-blue-500 text-white font-bold py-2 px-4 mt-1 rounded focus:outline-none focus:shadow-outline w-[48%] ml-[4%] ${isEmailVerify && isMobileVerify ? 'hover:bg-blue-700 cursor-pointer' :'opacity-50 cursor-not-allowed'}`}
            onClick={signup}
            disabled={!isEmailVerify || !isMobileVerify}
          >
            Submit
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Signup;