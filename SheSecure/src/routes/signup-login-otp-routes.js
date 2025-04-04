import { api } from "../config/config";

export const sendEmailOTP = (setEmailTimer, email, onEmailStatus) => {
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
                onEmailStatus({ success: true, message: 'Email sent successfully!' });
            } else {
                onEmailStatus({ success: false, message: data.message });
            }
        })
        .catch((error) => {
            onEmailStatus({ success: false, message: 'An error occurred while sending the email.' });
        });
};

export const verifyEmail = (emailOTP) => {
    return new Promise((resolve, reject) => {
        fetch(api + '/auth/verify-otp', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailOTP }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    resolve(true);
                } else {
                    reject(data.message);
                }
            })
            .catch((error) => {
                reject('An unexpected error occurred while verifying OTP.');
            });
    });
};

export const sendMobileOTP = (setMobileTimer, mobile) => {
    setMobileTimer(59);
}

export const verifyMobile = (setIsMobileVerify, mobileOTP) => {
    setIsMobileVerify(true);
}

export const checkUserExist = async (email) => {
    const response = await fetch(api+'/auth/userExist', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return response.json();
};

export const signUp = async (formData, coursesData)=>{
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

    return response.json();
}

export const logIn = async (email) => {
    const response = await fetch(api+'/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return response;
};
