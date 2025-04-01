import { api } from "../config/config";

export const sendMobileOTP=(setMobileTimer, mobile)=>{
    setMobileTimer(59);
}

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

export const verifyMobile=(setIsMobileVerify, mobileOTP)=>{
    setIsMobileVerify(true);
}