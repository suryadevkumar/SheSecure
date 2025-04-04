import { useEffect, useState } from 'react';
import { sendEmailOTP, sendMobileOTP, verifyEmail, verifyMobile, checkUserExist, signUp } from '../routes/signup-login-otp-routes';
import background from '../assets/background1.jpg'
import { api } from '../config/config';
import { MdDelete } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';

const Signup = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', MobileNumber: '', userType: '', });
  const [coursesData, setCoursesData] = useState([]);
  const [courseData, setCourseData] = useState({ courseName: "", percentage: "", certificate: null, });

  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [page, setPage] = useState(1);
  const [emailTimer, setEmailTimer] = useState(0);
  const [mobileTimer, setMobileTimer] = useState(0);
  const [isEmailVerify, setIsEmailVerify] = useState(false);
  const [isMobileVerify, setIsMobileVerify] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  //go to next page function
  const nextPage = () => {
    if (coursesData.length > 0) {
      if (courseData.courseName && courseData.certificate) {
        setCoursesData([...coursesData, courseData]);
        setCourseData({ courseName: "", percentage: "", certificate: null });
        toast.success("Course successfully added!");
      }
      setShowUserDetails(true);
    }
    else {
      if (!courseData.courseName || !courseData.certificate) {
        toast.error("Course Name and Certificate are required");
      }
      else if (courseData.courseName && courseData.certificate) {
        setCoursesData([...coursesData, courseData]);
        setCourseData({ courseName: "", percentage: "", certificate: null });
        toast.success("Course successfully added!");
        setShowUserDetails(true);
      }
    }
  }

  //back button function
  const back = () => {
    setPage(1);
    setIsEmailVerify(false);
    setIsMobileVerify(false);
    setEmailOTP('');
    setMobileOTP('');
  }

  //function to add more course
  const addCourse = () => {
    if (!courseData.courseName || !courseData.certificate) {
      toast.error("Course Name and Certificate are required");
      return;
    }
    toast.success("Course successfully added!");
    setCoursesData([...coursesData, courseData]);
    setCourseData({ courseName: "", percentage: "", certificate: null });
  };

  //Function to remove course
  const removeCourse = (index) => {
    toast.success("Course successfully deleted!")
    setCoursesData(coursesData.filter((_, i) => i !== index));
  };

  //Function to certificate view
  const handleCertificateView = (certificateFile) => {
    if (!certificateFile) {
      console.error("No certificate file provided.");
      return;
    }
    const fileURL = URL.createObjectURL(certificateFile);
    if (certificateFile.type === 'application/pdf' || certificateFile.name.toLowerCase().endsWith('.pdf')) {
      window.open(fileURL, '_blank');
    } else {
      setSelectedCertificate(fileURL);
    }
  };

  //final details check for user
  const handleChecked = () => {
    setShowUserDetails(false);
    setPage(3);
    sendMobileOTP(setMobileTimer, formData.MobileNumber);
    sendEmailOTP(setEmailTimer, formData.email, (status) => {
      if (status.success) {
        toast.success(status.message);
      } else {
        toast.error(status.message);
      }
    });
  }

  //timer for email otp
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

  //timer for mobile otp
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

  //check user exist and send otp
  const sendOTP = async(e) => {
    e.preventDefault();
    const response = await checkUserExist(formData.email);
    if (response.success)
      toast.error(response.message);
    else{
      if (formData.userType == 'User') {
        setPage(3);
        sendMobileOTP(setMobileTimer, formData.MobileNumber);
        sendEmailOTP(setEmailTimer, formData.email, (status) => {
          if (status.success) {
            toast.success(status.message);
          } else {
            toast.error(status.message);
          }
        });
      }
      else setPage(2);
    }
  };

  //email otp verification
  const emailVerification = () => {
    if (!emailOTP) {
      toast.error('Please Enter OTP!');
      return;
    }
    verifyEmail(emailOTP)
      .then(() => {
        setIsEmailVerify(true);
        toast.success('Email verification successful!');
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  //signup
  const signup = async () => {
      setIsSigningUp(true);
      try {
          
          // Validate basic form data
          if (!formData.firstName || !formData.lastName || !formData.email || !formData.MobileNumber || !formData.userType) {
              toast.error('All fields are required');
              setIsSigningUp(false);
              return;
          }

          // Validate qualifications for Counsellor/Admin
          if ((formData.userType === "Counsellor" || formData.userType === "Admin") && (!coursesData || coursesData.length === 0)) {
              toast.error('Qualifications are required for Counsellors/Admins');
              setIsSigningUp(false);
              return;
          }

          const toastId = toast.loading('Processing your signup...');
          
          const response = await signUp(formData, courseData);

          toast.dismiss(toastId);
          
          if (response.success) {
              toast.success(response.message || 'Signup successful. Redirecting to login...');
              setTimeout(() => {
                  window.location.href = '/login';
                  setIsSigningUp(false);
              }, 3000);
          } else {
              toast.error(response.message || 'Signup failed');
              setIsSigningUp(false);
          }
      } catch (error) {
          console.error('Error during signup:', error);
          toast.error('An error occurred. Please try again.');
          setIsSigningUp(false);
      }
  };

  return (
    <div className='bg-cover bg-center h-[calc(100vh-4rem)]' style={{ backgroundImage: `url(${background})` }}>
      <div className='flex items-center justify-center'>
        <div className="bg-white p-8 mt-[4%] rounded-lg shadow-md w-full max-w-md ml-[40%] lg:ml-[50%]">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Sign Up</h2>

          <ToastContainer position="top-center" autoClose={3000} theme="light"/>

          {page == 1 && <form onSubmit={sendOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="firstName">
                First Name <span className='text-red-600'>*</span>
              </label>
              <input
                className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="lastName">
                Last Name <span className='text-red-600'>*</span>
              </label>
              <input
                className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter your last name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="email">
                Email <span className='text-red-600'>*</span>
              </label>
              <input
                className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="mobileNumber">
                Mobile Number <span className='text-red-600'>*</span>
              </label>
              <input
                className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="mobileNumber"
                type="tel"
                name="mobileNumber"
                value={formData.MobileNumber}
                onChange={(e) => setFormData({ ...formData, MobileNumber: e.target.value })}
                placeholder="Enter your mobile number"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="userType">
                User Type <span className='text-red-600'>*</span>
              </label>
              <select
                className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              >
                <option value="">Select User Type</option>
                <option value="User">User</option>
                <option value="Counsellor">Counsellor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <p><span className='text-red-600 font-bold'>* </span>indicates required</p>
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-300 cursor-pointer"
              type="submit"
            >
              Next
            </button>
          </form>}

          {page == 2 && <div>
            {coursesData.length > 0 && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Added Course:</label>
                <div className="mb-4 p-2 h-32 border rounded-lg bg-gray-50 overflow-y-auto">
                  {coursesData.map((course, index) => (
                    <div key={index} className="border-b mb-1 py-2 flex justify-between items-center">
                      <div className="flex items-start w-full">
                        <div className="mt-6 mr-2 flex-shrink-0">
                          <p className="text-center font-bold bg-black text-white h-6 w-7 rounded-full">{index + 1}</p>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="truncate">
                            <strong>Course:</strong>
                            <span className="ml-1">{course.courseName}</span>
                          </p>
                          <p><strong>Percentage:</strong> {course.percentage || "N/A"}</p>
                          <p className="truncate">
                            <strong>Certificate:</strong>
                            <span className="ml-1 text-blue-500 underline cursor-pointer" onClick={() => handleCertificateView(course.certificate)}>{course.certificate.name}</span>
                          </p>
                        </div>
                        <div className="ml-2 mt-6 hover:opacity-50 cursor-pointer flex-shrink-0">
                          <MdDelete size="1.5em" onClick={() => removeCourse(index)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Course Name <span className='text-red-600'>*</span></label>
                <input
                  type="text"
                  name="courseName"
                  value={courseData.courseName}
                  onChange={(e) => setCourseData({ ...courseData, courseName: e.target.value })}
                  className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter course name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Percentage</label>
                <input
                  type="number"
                  name="percentage"
                  value={courseData.percentage}
                  onChange={(e) => setCourseData({ ...courseData, percentage: e.target.value })}
                  className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter percentage percentage"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Qualification Certificate <span className='text-red-600'>*</span></label>
                <input
                  type="file"
                  name="certificate"
                  onChange={(e) => setCourseData({ ...courseData, certificate: e.target.files[0] })}
                  className="w-full border rounded-lg py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="button"
                onClick={addCourse}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-300 cursor-pointer"
              >
                Add More Courses
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="w-[48%] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-300 cursor-pointer"
                >
                  Back
                </button>
                <button
                  className="w-[48%] ml-[4%] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-300 cursor-pointer"
                  onClick={nextPage}
                >
                  Next
                </button>
              </div>
            </div>
          </div>}

          {showUserDetails && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-[550px]">
                <h2 className="text-2xl font-bold mb-4">Confirm Your Details</h2>
                <p className="text-lg"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p className="text-lg"><strong>Email:</strong> {formData.email}</p>
                <p className="text-lg"><strong>Mobile:</strong> {formData.MobileNumber}</p>
                <p className="text-lg"><strong>User Type:</strong> {formData.userType}</p>

                <div className="mt-5">
                  <h3 className="text-xl font-bold mb-2">Courses</h3>
                  <div className="max-h-62 overflow-y-auto">
                    {coursesData.map((course, index) => (
                      <div key={index} className="mb-3 p-3 border rounded-lg bg-gray-100">
                        <p className="text-lg"><strong>Course:</strong> {course.courseName}</p>
                        <p className="text-lg"><strong>Percentage:</strong> {course.percentage || "N/A"}</p>
                        <p className="text-lg"><strong>Certificate: </strong>{course.certificate && (<span className="text-blue-500 underline cursor-pointer truncate"
                          onClick={() => handleCertificateView(course.certificate)}
                          title={course.certificate.name}>{course.certificate.name}</span>)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setShowUserDetails(false)} className="bg-red-500 text-white w-[100px] py-2 rounded-lg text-lg font-bold cursor-pointer hover:bg-red-400">Edit</button>
                  <button onClick={handleChecked} className="bg-green-500 text-white w-[100px] py-2 rounded-lg font-bold text-lg cursor-pointer hover:bg-green-400">Confirm</button>
                </div>
              </div>
            </div>
          )}

          {selectedCertificate && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[60]">
              <div className="relative max-w-[70%] max-h-[70%]">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-400 z-50 cursor-pointer"
                  title="Close"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              
                <img
                  src={selectedCertificate}
                  alt="Certificate Preview"
                  className="max-w-full max-h-[90vh] object-contain"
                />
              </div>
            </div>
          )}

          {page === 3 && (
            <div>
              <div>
                <label className="block text-gray-700 text-md font-bold mb-1" htmlFor="email">
                  Verify Your Email
                </label>
                <input
                  className="appearance-none border rounded w-[67%] py-1 px-3 text-gray-700 leading-tight cursor-not-allowed"
                  id="userEmail"
                  value={formData.email}
                  disabled={true}
                />
                <button
                  className={`bg-blue-500 text-white text-md py-1 px-1 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${emailTimer > 0 || isEmailVerify ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
                    }`}
                  onClick={() => sendEmailOTP(setEmailTimer, formData.email)}
                  disabled={isEmailVerify}
                >
                  {emailTimer > 0 && !isEmailVerify ? `Resend in ${emailTimer}s` : 'Resend'}
                </button>
              </div>
              <div>
                <input
                  className={`appearance-none border rounded w-[67%] py-1 px-3 my-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isEmailVerify ? 'cursor-not-allowed' : ''}`}
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
                  className={`text-white text-md py-1 px-1 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${isEmailVerify ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
                    }`}
                  onClick={emailVerification}
                  disabled={isEmailVerify}
                >
                  {isEmailVerify ? 'Verified' : 'Verify'}
                </button>

              </div>
              <div>
                <label className="block text-gray-700 text-md font-bold mb-1 mt-2" htmlFor="MobileNumber">
                  Verify Your Mobile Number
                </label>
                <input
                  className="appearance-none border rounded w-[67%] py-1 px-3 text-gray-700 leading-tight cursor-not-allowed"
                  value={formData.MobileNumber}
                  id="userMobile"
                  disabled={true}
                />
                <button
                  className={`bg-blue-500 text-white text-md py-1 px-1 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${mobileTimer > 0 || isMobileVerify ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
                    }`}
                  onClick={() => sendMobileOTP(setMobileTimer, formData.MobileNumber)}
                  disabled={isMobileVerify}
                >
                  {mobileTimer > 0 && !isMobileVerify ? `Resend in ${mobileTimer}s` : 'Resend'}
                </button>
              </div>
              <div>
                <input
                  className={`appearance-none border rounded w-[67%] py-1 px-3 my-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isMobileVerify ? 'cursor-not-allowed' : ''}`}
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
                  className={`bg-blue-500 text-white text-md py-1 px-1 ml-[2%] rounded focus:outline-none focus:shadow-outline w-[31%] ${isMobileVerify ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'
                    }`}
                  onClick={() => verifyMobile(setIsMobileVerify, mobileOTP)}
                  disabled={isMobileVerify}
                >
                  {isMobileVerify ? 'Verified' : 'Verify'}
                </button>
              </div>
              <button
                className={`bg-blue-500 hover:bg-blue-700 text-white text-md py-1 px-1 mt-1 rounded focus:outline-none focus:shadow-outline w-[48%] ${isEmailVerify && isMobileVerify ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
                onClick={back}
                disabled={isEmailVerify && isMobileVerify}
              >
                Back
              </button>
              <button
                className={`bg-blue-500 text-white text-md py-1 px-1 mt-1 rounded focus:outline-none focus:shadow-outline w-[48%] ml-[4%] ${isEmailVerify && isMobileVerify && !isSigningUp ? 'hover:bg-blue-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                onClick={signup}
                disabled={!isEmailVerify || !isMobileVerify || isSigningUp}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;