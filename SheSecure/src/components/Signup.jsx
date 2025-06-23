import { useEffect, useState, useRef } from "react";
import {
  sendEmailOTP,
  verifyEmail,
  checkUserExist,
  signUp,
} from "../routes/signup-login-otp-routes";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    MobileNumber: "",
    userType: "",
  });
  const [coursesData, setCoursesData] = useState([]);
  const [courseData, setCourseData] = useState({
    courseName: "",
    percentage: "",
    certificate: null,
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [page, setPage] = useState(1);
  const [emailTimer, setEmailTimer] = useState(0);
  const [otpVisible, setOtpVisible] = useState(false);
  const [buttonText, setButtonText] = useState("Send OTP");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const otpInputRefs = useRef([]);

  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

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
        setButtonText("Resend OTP");
      } else {
        setButtonText("Send OTP");
      }
    }

    return () => clearInterval(emailInterval);
  }, [emailTimer, otpVisible]);

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
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  //go to next page function
  const nextPage = () => {
    if (coursesData.length > 0) {
      if (courseData.courseName && courseData.certificate) {
        setCoursesData([...coursesData, courseData]);
        setCourseData({ courseName: "", percentage: "", certificate: null });
        toast.success("Course successfully added!");
      }

      setShowUserDetails(true);
    } else {
      if (!courseData.courseName || !courseData.certificate) {
        toast.error("Course Name and Certificate are required");
      } else if (courseData.courseName && courseData.certificate) {
        setCoursesData([...coursesData, courseData]);
        setCourseData({ courseName: "", percentage: "", certificate: null });
        toast.success("Course successfully added!");
        setShowUserDetails(true);
      }
    }
  };

  //back button function
  const back = () => {
    setPage(1);
    setOtpVisible(false);
    setOtp(["", "", "", "", "", ""]);
  };

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
    toast.success("Course successfully deleted!");
    setCoursesData(coursesData.filter((_, i) => i !== index));
  };

  //Function to certificate view
  const handleCertificateView = (certificateFile) => {
    if (!certificateFile) {
      console.error("No certificate file provided.");
      return;
    }
    const fileURL = URL.createObjectURL(certificateFile);
    if (
      certificateFile.type === "application/pdf" ||
      certificateFile.name.toLowerCase().endsWith(".pdf")
    ) {
      window.open(fileURL, "_blank");
    } else {
      setSelectedCertificate(fileURL);
    }
  };

  //final details check for user
  const handleChecked = () => {
    setShowUserDetails(false);
    setPage(3);
    setOtpVisible(true);
    sendEmailOTP(setEmailTimer, formData.email);
  };

  //check user exist and send otp
  const sendOTP = async (e) => {
    e.preventDefault();
    const response = await checkUserExist(formData.email);
    if (response.success) toast.error(response.message);
    else {
      if (formData.userType == "User") {
        setPage(3);
        setOtpVisible(true);
        sendEmailOTP(setEmailTimer, formData.email);
      } else setPage(2);
    }
  };

  // Handle signup with OTP verification
  const handleSignup = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const verification = await verifyEmail(fullOtp);

    if (verification.success) {
      await signUp(formData, coursesData, setIsSigningUp);
    } else {
      toast.error(verification.message);
    }
  };

  return (
    <div className="bg-white flex p-4 my-4 justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-pink-600 p-3 text-center">
          <div className="flex justify-center mb-1">
            <UserPlus className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-pink-100">Join SheSecure today</p>
        </div>

        <div className="px-8 py-2">
          {page === 1 && (
            <form onSubmit={sendOTP} className="space-y-2 py-4">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="firstName"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition bg-white"
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="lastName"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition bg-white"
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="email"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition bg-white"
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="mobileNumber"
                >
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition bg-white"
                  id="mobileNumber"
                  type="tel"
                  name="mobileNumber"
                  value={formData.MobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, MobileNumber: e.target.value })
                  }
                  placeholder="Enter your mobile number"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="userType"
                >
                  User Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition cursor-pointer bg-white"
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={(e) =>
                    setFormData({ ...formData, userType: e.target.value })
                  }
                  required
                >
                  <option value="">Select User Type</option>
                  <option value="User">User</option>
                  <option value="Counsellor">Counsellor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <p className="text-sm text-gray-600">
                <span className="text-red-500 font-bold">*</span> indicates
                required
              </p>

              <button
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 cursor-pointer"
                type="submit"
              >
                Next
              </button>

              <div className="text-center pt-1">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-pink-600 font-semibold hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          )}

          {page === 2 && (
            <div className="space-y-2">
              {coursesData.length > 0 && (
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Added Courses:
                  </label>
                  <div className="mb-2 px-3 py-1 border-2 rounded-lg bg-gray-50 h-30 overflow-y-auto">
                    {coursesData.map((course, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 mb-2 py-2 flex justify-between items-center"
                      >
                        <div className="flex items-start w-full">
                          <div className="mt-6 mr-2 flex-shrink-0">
                            <p className="text-center font-bold bg-pink-600 text-white h-6 w-6 rounded-full">
                              {index + 1}
                            </p>
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="truncate">
                              <span className="font-medium">Course:</span>{" "}
                              {course.courseName}
                            </p>
                            <p>
                              <span className="font-medium">Percentage:</span>{" "}
                              {course.percentage || "N/A"}
                            </p>
                            <p className="truncate">
                              <span className="font-medium">Certificate:</span>{" "}
                              <span
                                className="text-pink-600 underline cursor-pointer"
                                onClick={() =>
                                  handleCertificateView(course.certificate)
                                }
                              >
                                {course.certificate.name}
                              </span>
                            </p>
                          </div>
                          <div className="ml-2 mt-6 hover:opacity-70 cursor-pointer flex-shrink-0">
                            <MdDelete
                              size="1.3em"
                              onClick={() => removeCourse(index)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={courseData.courseName}
                  onChange={(e) =>
                    setCourseData({ ...courseData, courseName: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition bg-white"
                  placeholder="Enter course name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Percentage
                </label>
                <input
                  type="number"
                  name="percentage"
                  value={courseData.percentage}
                  onChange={(e) =>
                    setCourseData({ ...courseData, percentage: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition bg-white"
                  placeholder="Enter percentage"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Qualification Certificate{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="certificate"
                  onClick={() =>
                    setCourseData({ ...courseData, certificate: null })
                  }
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      certificate: e.target.files[0],
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border-2 focus:border-pink-500 focus:outline-none transition bg-white cursor-pointer"
                />
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={addCourse}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer"
                >
                  Add Course
                </button>
              </div>

              <button
                type="button"
                onClick={nextPage}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer"
              >
                Continue
              </button>
            </div>
          )}

          {page === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border-2 bg-gray-100 cursor-not-allowed"
                  value={formData.email}
                  disabled
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
                      ? "bg-pink-400 cursor-not-allowed"
                      : "bg-pink-600 hover:bg-pink-700 cursor-pointer"
                  }`}
                  onClick={() => sendEmailOTP(setEmailTimer, formData.email)}
                  disabled={otpVisible && emailTimer > 0}
                >
                  {buttonText}
                </button>

                <div className="flex space-x-4 pt-2">
                  <button
                    onClick={back}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition duration-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSignup}
                    className={`flex-1 font-semibold py-3 rounded-lg transition duration-300 ${
                      otp.join("").length === 6 && !isSigningUp
                        ? "bg-pink-600 hover:bg-pink-700 text-white cursor-pointer"
                        : "bg-pink-300 text-white cursor-not-allowed"
                    }`}
                    disabled={otp.join("").length !== 6 || isSigningUp}
                  >
                    {isSigningUp ? "Processing..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showUserDetails && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Confirm Your Details
                </h2>
                <div className="space-y-3">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {formData.email}
                  </p>
                  <p>
                    <span className="font-medium">Mobile:</span>{" "}
                    {formData.MobileNumber}
                  </p>
                  <p>
                    <span className="font-medium">User Type:</span>{" "}
                    {formData.userType}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-gray-800 mb-2">Courses</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {coursesData.map((course, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <p>
                          <span className="font-medium">Course:</span>{" "}
                          {course.courseName}
                        </p>
                        <p>
                          <span className="font-medium">Percentage:</span>{" "}
                          {course.percentage || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Certificate: </span>
                          {course.certificate && (
                            <span
                              className="text-pink-600 underline cursor-pointer"
                              onClick={() =>
                                handleCertificateView(course.certificate)
                              }
                            >
                              {course.certificate.name}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleChecked}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedCertificate && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[60]">
              <div className="relative max-w-[90%] max-h-[90%]">
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
        </div>
      </div>
    </div>
  );
};

export default Signup;
