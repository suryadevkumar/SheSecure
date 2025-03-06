export const sendMobileOTP=(setMobileTimer, mobile)=>{
    setMobileTimer(59);
}

export const sendEmailOTP=(setEmailTimer, email)=>{
    setEmailTimer(59);
}

export const verifyEmail=(setIsEmailVerify, emailOTP)=>{
    setIsEmailVerify(true);
}

export const verifyMobile=(setIsMobileVerify, mobileOTP)=>{
    setIsMobileVerify(true);
}