import { toast } from "react-toastify";
import { api } from "../config/config"

export const sendEmailOTP = (setEmailTimer, email) => {
    setEmailTimer(59);
    fetch(api + '/auth/send-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                toast.success('Email sent successfully!');
            } else {
                toast.error(data.message);
            }
        })
        .catch((error) => {
            toast.error('An error occurred while sending the email.');
        });
};

export const verifyEmail = async (emailOTP) => {
    try {
        const response = await fetch(api + '/auth/verify-otp', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailOTP }),
        });
        const data = await response.json();
        
        if (data.success) {
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred while verifying OTP.' };
    }
};

export const checkUserExist = async (email) => {
    const response = await fetch(api + '/auth/userExist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return response.json();
};

export const signUp = async (formData, coursesData, setIsSigningUp) => {
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

        // Create FormData object
        const signupData = new FormData();

        // Append user data with consistent field names
        signupData.append('firstName', formData.firstName);
        signupData.append('lastName', formData.lastName);
        signupData.append('email', formData.email);
        signupData.append('mobileNumber', formData.MobileNumber);
        signupData.append('userType', formData.userType);

        // Only append qualifications for Counsellor/Admin
        if (formData.userType === "Counsellor" || formData.userType === "Admin") {
            signupData.append('qualifications', JSON.stringify(
                coursesData.map(course => ({
                    courseName: course.courseName,
                    percentage: course.percentage
                })))
            );

            // Append certificate files
            coursesData.forEach((course, index) => {
                if (course.certificate instanceof File) {
                    signupData.append(`qualifications[${index}].certificate`, course.certificate);
                }
            });
        }

        // Send to backend
        const response = await fetch(api + '/auth/signup', {
            method: 'POST',
            credentials: 'include',
            body: signupData
        });

        toast.dismiss(toastId);

        const result = await response.json();

        if (result.success) {
            toast.success(result.message || 'Signup successful. Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login';
                setIsSigningUp(false);
            }, 3000);
        } else {
            toast.error(result.message || 'Signup failed');
            setIsSigningUp(false);
        }
    } catch (error) {
        console.error('Error during signup:', error);
        toast.error('An error occurred. Please try again.');
        setIsSigningUp(false);
    }
};

export const logIn = async (email, emailOTP) => {
    try {
        await verifyEmail(emailOTP);

        const response = await fetch(api + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                toast.error('Login failed. Server error.');
            }
        } else {
            toast.error('Login failed. Please try again.');
        }
    } catch (err) {
        console.error('Login error:', err);
        toast.error(err);
        throw err;
    }
};

export const submitCustomerCareRequest = async (formData, token) => {
    try {
        const response = await fetch(api + `/auth/customer-care`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit request');
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting customer care request:', error);
        throw error;
    }
};